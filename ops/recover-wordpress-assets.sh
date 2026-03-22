#!/usr/bin/env bash

set -euo pipefail

INSTANCE_NAME="${INSTANCE_NAME:-jacopopeca-wordpress}"
REGION="${REGION:-eu-central-1}"
OUTPUT_DIR="${OUTPUT_DIR:-$PWD/recovered-wordpress}"

mkdir -p "$OUTPUT_DIR"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

need_cmd aws
need_cmd jq
need_cmd ssh
need_cmd scp

tmpdir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmpdir"
}
trap cleanup EXIT

keyfile="$tmpdir/lightsail.key"

aws lightsail get-instance-access-details \
  --instance-name "$INSTANCE_NAME" \
  --region "$REGION" \
  --output json | jq -r '.accessDetails.privateKey' > "$keyfile"

chmod 600 "$keyfile"

read -r -d '' REMOTE_SCRIPT <<'EOF' || true
set -euo pipefail

ROOT=""
if [[ -d /opt/bitnami/wordpress ]]; then
  ROOT="/opt/bitnami/wordpress"
elif [[ -d /bitnami/wordpress ]]; then
  ROOT="/bitnami/wordpress"
else
  echo "WordPress root not found" >&2
  exit 1
fi

cd "$ROOT"

UPLOADS_DIR="$ROOT/wp-content/uploads"
CONFIG_FILE="$ROOT/wp-config.php"

extract_define() {
  local key="$1"
  php -r '$cfg=file_get_contents($argv[1]); if (preg_match("/define\\(\\s*[\"\x27]".$argv[2]."[\"\x27]\\s*,\\s*[\"\x27](.*?)[\"\x27]\\s*\\)/", $cfg, $m)) { echo $m[1]; }' "$CONFIG_FILE" "$key"
}

DB_NAME="$(extract_define DB_NAME)"
DB_USER="$(extract_define DB_USER)"
DB_PASSWORD="$(extract_define DB_PASSWORD)"
DB_HOST="$(extract_define DB_HOST)"

mkdir -p /tmp/jacopopeca-export
tar -czf /tmp/jacopopeca-export/uploads.tar.gz -C "$UPLOADS_DIR" .
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > /tmp/jacopopeca-export/wordpress.sql
printf '{"root":"%s","uploads":"%s","db":"%s"}\n' "$ROOT" "$UPLOADS_DIR" "$DB_NAME" > /tmp/jacopopeca-export/metadata.json
EOF

ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$keyfile" "bitnami@${INSTANCE_NAME}" true 2>/dev/null || true

IP_ADDRESS="$(aws lightsail get-instance --instance-name "$INSTANCE_NAME" --region "$REGION" --query 'instance.publicIpAddress' --output text)"

ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$keyfile" "bitnami@$IP_ADDRESS" "$REMOTE_SCRIPT"

scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$keyfile" \
  "bitnami@$IP_ADDRESS:/tmp/jacopopeca-export/uploads.tar.gz" "$OUTPUT_DIR/uploads.tar.gz"

scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$keyfile" \
  "bitnami@$IP_ADDRESS:/tmp/jacopopeca-export/wordpress.sql" "$OUTPUT_DIR/wordpress.sql"

scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$keyfile" \
  "bitnami@$IP_ADDRESS:/tmp/jacopopeca-export/metadata.json" "$OUTPUT_DIR/metadata.json"

echo "Recovery completed in $OUTPUT_DIR"
