#!/usr/bin/env bash

set -euo pipefail

INSTANCE_NAME="${INSTANCE_NAME:-jacopopeca-recovery-20260322}"
SNAPSHOT_NAME="${SNAPSHOT_NAME:-copilot-pre-migration-20260322}"
REGION="${REGION:-eu-central-1}"
AVAILABILITY_ZONE="${AVAILABILITY_ZONE:-eu-central-1a}"
BUNDLE_ID="${BUNDLE_ID:-micro_3_0}"
BUCKET_NAME="${BUCKET_NAME:-jacopopeca-migration-check-20260322}"

if [[ -z "${AWS_ACCESS_KEY_ID:-}" || -z "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
  echo "AWS credentials are required in the environment" >&2
  exit 1
fi

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

need_cmd aws

tmpdir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmpdir"
}
trap cleanup EXIT

cat > "$tmpdir/user-data.sh" <<'EOF'
#!/bin/bash
set -euxo pipefail

sleep 45
export DEBIAN_FRONTEND=noninteractive

if ! command -v aws >/dev/null 2>&1; then
  apt-get update
  apt-get install -y awscli
fi

ROOT=""
if [ -d /opt/bitnami/wordpress ]; then
  ROOT="/opt/bitnami/wordpress"
elif [ -d /bitnami/wordpress ]; then
  ROOT="/bitnami/wordpress"
fi

mkdir -p /tmp/jacopopeca-export

if [ -z "$ROOT" ]; then
  printf 'wordpress root not found\n' > /tmp/jacopopeca-export/error.txt
else
  CONFIG_FILE="$ROOT/wp-config.php"

  extract_define() {
    php -r '
      $cfg=file_get_contents($argv[1]);
      $key=$argv[2];
      if (preg_match("/define\\(\\s*[\"\\x27]".$key."[\"\\x27]\\s*,\\s*[\"\\x27](.*?)[\"\\x27]\\s*\\)/", $cfg, $m)) {
        echo $m[1];
      }
    ' "$CONFIG_FILE" "$1"
  }

  DB_NAME="$(extract_define DB_NAME || true)"
  DB_USER="$(extract_define DB_USER || true)"
  DB_PASSWORD="$(extract_define DB_PASSWORD || true)"
  DB_HOST="$(extract_define DB_HOST || true)"

  tar -czf /tmp/jacopopeca-export/uploads.tar.gz -C "$ROOT/wp-content/uploads" . || true

  if command -v mysqldump >/dev/null 2>&1 && [ -n "$DB_NAME" ] && [ -n "$DB_USER" ]; then
    mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > /tmp/jacopopeca-export/wordpress.sql || true
  fi

  printf '{"root":"%s","db":"%s","db_host":"%s"}\n' "$ROOT" "$DB_NAME" "$DB_HOST" > /tmp/jacopopeca-export/metadata.json
fi

export AWS_ACCESS_KEY_ID='__AWS_ACCESS_KEY_ID__'
export AWS_SECRET_ACCESS_KEY='__AWS_SECRET_ACCESS_KEY__'
export AWS_DEFAULT_REGION='__REGION__'

aws s3 cp /var/log/cloud-init-output.log s3://__BUCKET_NAME__/recovery/cloud-init-output.log || true

for f in /tmp/jacopopeca-export/*; do
  [ -e "$f" ] || continue
  aws s3 cp "$f" s3://__BUCKET_NAME__/recovery/$(basename "$f") || true
done

shutdown -h now
EOF

sed -i \
  -e "s|__AWS_ACCESS_KEY_ID__|${AWS_ACCESS_KEY_ID}|g" \
  -e "s|__AWS_SECRET_ACCESS_KEY__|${AWS_SECRET_ACCESS_KEY}|g" \
  -e "s|__REGION__|${REGION}|g" \
  -e "s|__BUCKET_NAME__|${BUCKET_NAME}|g" \
  "$tmpdir/user-data.sh"

if aws lightsail get-instance --instance-name "$INSTANCE_NAME" --region "$REGION" >/dev/null 2>&1; then
  echo "Instance $INSTANCE_NAME already exists"
else
  aws lightsail create-instances-from-snapshot \
    --region "$REGION" \
    --instance-names "$INSTANCE_NAME" \
    --instance-snapshot-name "$SNAPSHOT_NAME" \
    --availability-zone "$AVAILABILITY_ZONE" \
    --bundle-id "$BUNDLE_ID" \
    --ip-address-type dualstack \
    --user-data file://"$tmpdir/user-data.sh"
fi

aws lightsail get-instance \
  --instance-name "$INSTANCE_NAME" \
  --region "$REGION" \
  --query 'instance.{Name:name,State:state.name,Created:createdAt,Ip:publicIpAddress,Ipv6:ipv6Addresses[0]}'