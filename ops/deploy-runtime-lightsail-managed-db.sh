#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REGION="${REGION:-eu-central-1}"
INSTANCE_NAME="${INSTANCE_NAME:-jacopopeca-runtime-staging}"
REMOTE_DIR="${REMOTE_DIR:-/opt/jacopopeca}"
ASSET_BUCKET="${ASSET_BUCKET:-jacopopeca-assets-089081311517-prod}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-http://127.0.0.1}"
ASSET_BASE_URL="${NEXT_PUBLIC_ASSET_BASE_URL:-https://$ASSET_BUCKET.s3.$REGION.amazonaws.com}"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

need_cmd aws
need_cmd rsync
need_cmd ssh
need_cmd jq

if [[ -z "${AWS_ACCESS_KEY_ID:-}" || -z "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
  echo "AWS credentials are required in the environment" >&2
  exit 1
fi

required_env=(DATABASE_URL ADMIN_EMAIL ADMIN_PASSWORD NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
for key in "${required_env[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "$key is required in the environment." >&2
    exit 1
  fi
done

tmpdir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmpdir"
}
trap cleanup EXIT

key_path="${LIGHTSAIL_KEY_PATH:-$ROOT_DIR/.artifacts/jacopopeca-runtime-staging-key.pem}"
host="$(aws lightsail get-instance --instance-name "$INSTANCE_NAME" --region "$REGION" --query 'instance.publicIpAddress' --output text)"
ssh_user="${LIGHTSAIL_SSH_USER:-ubuntu}"

ssh_base=(ssh -i "$key_path" -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile="$tmpdir/known_hosts" "$ssh_user@$host")
rsync_base=(rsync -az --delete -e "ssh -i $key_path -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=$tmpdir/known_hosts")

for attempt in {1..90}; do
  if "${ssh_base[@]}" 'test -d /opt/jacopopeca && command -v docker >/dev/null && sudo docker compose version >/dev/null' >/dev/null 2>&1; then
    break
  fi
  if [[ "$attempt" -eq 90 ]]; then
    echo "Instance is not ready for SSH/Docker yet." >&2
    exit 1
  fi
  sleep 10
done

"${ssh_base[@]}" "sudo mkdir -p '$REMOTE_DIR' && sudo chown '$ssh_user:$ssh_user' '$REMOTE_DIR'"

"${rsync_base[@]}" \
  --exclude '.git/' \
  --exclude 'web/node_modules/' \
  --exclude 'web/.next/' \
  --exclude 'web/out/' \
  --exclude 'web/.env*' \
  --exclude '.artifacts/' \
  "$ROOT_DIR/" "$ssh_user@$host:$REMOTE_DIR/"

cat > "$tmpdir/.env.production" <<ENV
NODE_ENV=production
PORT=3000
DATABASE_URL=${DATABASE_URL}
NEXT_PUBLIC_SITE_URL=${SITE_URL}
NEXT_PUBLIC_ASSET_BASE_URL=${ASSET_BASE_URL}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
AWS_REGION=${REGION}
AWS_S3_BUCKET=${ASSET_BUCKET}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV

cat > "$tmpdir/docker-compose.yml" <<'COMPOSE'
services:
  app:
    build:
      context: ./web
      args:
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
        NEXT_PUBLIC_ASSET_BASE_URL: ${NEXT_PUBLIC_ASSET_BASE_URL}
    restart: unless-stopped
    env_file: .env.production
    ports:
      - "80:3000"

  migrate:
    image: node:22-alpine
    working_dir: /workspace/web
    env_file: .env.production
    volumes:
      - .:/workspace
COMPOSE

scp -i "$key_path" -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile="$tmpdir/known_hosts" \
  "$tmpdir/.env.production" "$tmpdir/docker-compose.yml" "$ssh_user@$host:$REMOTE_DIR/"

"${ssh_base[@]}" "cd '$REMOTE_DIR' && sudo docker compose --env-file .env.production run --rm -e NODE_ENV=development migrate sh -lc 'npm ci --include=dev && npm run db:generate && npm run db:push && npm run db:seed'"
"${ssh_base[@]}" "cd '$REMOTE_DIR' && sudo docker compose --env-file .env.production up -d --build app"

for attempt in {1..40}; do
  if curl -fsS "http://$host/" >/dev/null 2>&1; then
    echo "Runtime deployed: http://$host/"
    exit 0
  fi
  sleep 5
done

echo "Runtime containers started, but HTTP health check did not pass yet." >&2
"${ssh_base[@]}" "cd '$REMOTE_DIR' && sudo docker compose ps && sudo docker compose logs --tail=120 app" >&2
exit 1
