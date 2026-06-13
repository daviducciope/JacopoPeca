#!/usr/bin/env bash

set -euo pipefail

REGION="${REGION:-eu-central-1}"
INSTANCE_NAME="${INSTANCE_NAME:-jacopopeca-runtime-prod}"
BUNDLE_ID="${BUNDLE_ID:-small_3_0}"
BLUEPRINT_ID="${BLUEPRINT_ID:-ubuntu_24_04}"
STATIC_IP_NAME="${STATIC_IP_NAME:-jacopopeca-runtime-prod-ip}"
ASSET_BUCKET="${ASSET_BUCKET:-jacopopeca-assets-089081311517-prod}"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

need_cmd aws
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

cat > "$tmpdir/user-data.sh" <<'USERDATA'
#!/bin/bash
set -euxo pipefail

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl gnupg rsync jq
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

mkdir -p /opt/jacopopeca
USERDATA

if ! aws lightsail get-instance --instance-name "$INSTANCE_NAME" --region "$REGION" >/dev/null 2>&1; then
  aws lightsail create-instances \
    --region "$REGION" \
    --instance-names "$INSTANCE_NAME" \
    --availability-zone "${REGION}a" \
    --blueprint-id "$BLUEPRINT_ID" \
    --bundle-id "$BUNDLE_ID" \
    --user-data "file://$tmpdir/user-data.sh" >/dev/null
fi

if ! aws lightsail get-static-ip --static-ip-name "$STATIC_IP_NAME" --region "$REGION" >/dev/null 2>&1; then
  aws lightsail allocate-static-ip --static-ip-name "$STATIC_IP_NAME" --region "$REGION" >/dev/null
fi

attached_to="$(aws lightsail get-static-ip --static-ip-name "$STATIC_IP_NAME" --region "$REGION" --query 'staticIp.attachedTo' --output text)"
if [[ "$attached_to" != "$INSTANCE_NAME" ]]; then
  aws lightsail attach-static-ip \
    --static-ip-name "$STATIC_IP_NAME" \
    --instance-name "$INSTANCE_NAME" \
    --region "$REGION" >/dev/null
fi

if ! aws s3api head-bucket --bucket "$ASSET_BUCKET" 2>/dev/null; then
  aws s3api create-bucket \
    --bucket "$ASSET_BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration "LocationConstraint=$REGION" >/dev/null
fi

aws s3api delete-public-access-block --bucket "$ASSET_BUCKET" 2>/dev/null || true

cat > "$tmpdir/bucket-policy.json" <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadProductAssets",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$ASSET_BUCKET/*"
    }
  ]
}
POLICY

aws s3api put-bucket-policy --bucket "$ASSET_BUCKET" --policy "file://$tmpdir/bucket-policy.json"

cat > "$tmpdir/cors.json" <<'CORS'
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "https://jacopopeca.com",
        "https://www.jacopopeca.com",
        "https://staging.jacopopeca.com"
      ],
      "AllowedMethods": ["GET", "PUT", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
CORS

aws s3api put-bucket-cors --bucket "$ASSET_BUCKET" --cors-configuration "file://$tmpdir/cors.json"

aws lightsail open-instance-public-ports \
  --region "$REGION" \
  --instance-name "$INSTANCE_NAME" \
  --port-info fromPort=22,toPort=22,protocol=TCP >/dev/null || true
aws lightsail open-instance-public-ports \
  --region "$REGION" \
  --instance-name "$INSTANCE_NAME" \
  --port-info fromPort=80,toPort=80,protocol=TCP >/dev/null || true

aws lightsail get-instance \
  --instance-name "$INSTANCE_NAME" \
  --region "$REGION" \
  --query 'instance.{name:name,state:state.name,publicIp:publicIpAddress,bundle:bundleId}'

aws lightsail get-static-ip \
  --static-ip-name "$STATIC_IP_NAME" \
  --region "$REGION" \
  --query 'staticIp.{name:name,ip:ipAddress,attachedTo:attachedTo}'

echo "Asset bucket: s3://$ASSET_BUCKET"
