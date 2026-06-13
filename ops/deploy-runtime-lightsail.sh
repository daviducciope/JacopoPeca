#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REGION="${REGION:-eu-central-1}"
INSTANCE_NAME="${INSTANCE_NAME:-jacopopeca-runtime-prod}"
STATIC_IP_NAME="${STATIC_IP_NAME:-jacopopeca-runtime-prod-ip}"
REMOTE_DIR="${REMOTE_DIR:-/opt/jacopopeca}"
ASSET_BUCKET="${ASSET_BUCKET:-jacopopeca-assets-089081311517-prod}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://jacopopeca.com}"
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

tmpdir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmpdir"
}
trap cleanup EXIT

key_path="$tmpdir/lightsail-default-key.pem"
access_json="$tmpdir/access.json"
aws lightsail get-instance-access-details \
  --region "$REGION" \
  --instance-name "$INSTANCE_NAME" \
  --protocol ssh > "$access_json"
jq -r '.accessDetails.privateKey' "$access_json" > "$key_path"
chmod 600 "$key_path"

host="$(jq -r '.accessDetails.ipAddress' "$access_json")"
ssh_user="$(jq -r '.accessDetails.username' "$access_json")"

ssh_base=(ssh -i "$key_path" -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile="$tmpdir/known_hosts" "$ssh_user@$host")
rsync_base=(rsync -az --delete -e "ssh -i $key_path -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=$tmpdir/known_hosts")

for attempt in {1..60}; do
  if "${ssh_base[@]}" 'true' >/dev/null 2>&1; then
    break
  fi
  if [[ "$attempt" -eq 60 ]]; then
    echo "Instance is not ready for SSH/Docker yet." >&2
    exit 1
  fi
  sleep 10
done

"${ssh_base[@]}" '
set -euo pipefail
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sudo sh
fi
sudo systemctl enable --now docker
if ! sudo docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is not available after Docker installation." >&2
  exit 1
fi
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab >/dev/null
fi
'

"${ssh_base[@]}" "sudo mkdir -p '$REMOTE_DIR' && sudo chown '$ssh_user:$ssh_user' '$REMOTE_DIR'"

"${rsync_base[@]}" \
  --exclude '.git/' \
  --exclude 'web/node_modules/' \
  --exclude 'web/.next/' \
  --exclude 'web/out/' \
  --exclude 'web/.env*' \
  --exclude '.artifacts/' \
  "$ROOT_DIR/" "$ssh_user@$host:$REMOTE_DIR/"

db_password="${POSTGRES_PASSWORD:-$(openssl rand -base64 36 | tr -d '\n' | tr '/+' 'AZ')}"
admin_email="${ADMIN_EMAIL:-}"
admin_password="${ADMIN_PASSWORD:-}"
stripe_secret="${STRIPE_SECRET_KEY:-}"
stripe_webhook_secret="${STRIPE_WEBHOOK_SECRET:-}"
stripe_publishable="${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:-}"

if [[ -z "$admin_email" || -z "$admin_password" ]]; then
  echo "ADMIN_EMAIL and ADMIN_PASSWORD are required in the environment." >&2
  exit 1
fi

if [[ -z "$stripe_publishable" ]]; then
  echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required in the environment." >&2
  exit 1
fi

cat > "$tmpdir/.env.production" <<ENV
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://jacopopeca:${db_password}@postgres:5432/jacopopeca
POSTGRES_DB=jacopopeca
POSTGRES_USER=jacopopeca
POSTGRES_PASSWORD=${db_password}
NEXT_PUBLIC_SITE_URL=${SITE_URL}
NEXT_PUBLIC_ASSET_BASE_URL=${ASSET_BASE_URL}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${stripe_publishable}
STRIPE_SECRET_KEY=${stripe_secret}
STRIPE_WEBHOOK_SECRET=${stripe_webhook_secret}
ADMIN_EMAIL=${admin_email}
ADMIN_PASSWORD=${admin_password}
AWS_REGION=${REGION}
AWS_S3_BUCKET=${ASSET_BUCKET}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV

cat > "$tmpdir/docker-compose.yml" <<'COMPOSE'
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    env_file: .env.production
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 10s
      timeout: 5s
      retries: 10

  app:
    build:
      context: ./web
      args:
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
        NEXT_PUBLIC_ASSET_BASE_URL: ${NEXT_PUBLIC_ASSET_BASE_URL}
    restart: unless-stopped
    env_file: .env.production
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "80:3000"

  migrate:
    image: node:22-alpine
    working_dir: /workspace/web
    env_file: .env.production
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - .:/workspace

volumes:
  postgres_data:
COMPOSE

scp -i "$key_path" -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile="$tmpdir/known_hosts" \
  "$tmpdir/.env.production" "$tmpdir/docker-compose.yml" "$ssh_user@$host:$REMOTE_DIR/"

"${ssh_base[@]}" "cd '$REMOTE_DIR' && sudo docker compose --env-file .env.production up -d postgres"
"${ssh_base[@]}" "cd '$REMOTE_DIR' && sudo docker compose --env-file .env.production run --rm migrate sh -lc 'npm ci && npm run db:push && npm run db:seed'"
"${ssh_base[@]}" "cd '$REMOTE_DIR' && sudo docker compose --env-file .env.production up -d --build app"

for attempt in {1..30}; do
  if curl -fsS "http://$host/" >/dev/null 2>&1; then
    echo "Runtime deployed: http://$host/"
    exit 0
  fi
  sleep 5
done

echo "Runtime containers started, but HTTP health check did not pass yet." >&2
"${ssh_base[@]}" "cd '$REMOTE_DIR' && sudo docker compose ps && sudo docker compose logs --tail=80 app" >&2
exit 1
