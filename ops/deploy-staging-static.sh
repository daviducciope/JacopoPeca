#!/usr/bin/env bash

set -euo pipefail

REGION="${REGION:-eu-central-1}"
DOMAIN_NAME="${DOMAIN_NAME:-jacopopeca.com}"
STAGING_SUBDOMAIN="${STAGING_SUBDOMAIN:-staging.jacopopeca.com}"
BUILD_DIR="${BUILD_DIR:-$PWD/web/out}"

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
need_cmd jq

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Build directory not found: $BUILD_DIR" >&2
  exit 1
fi

if ! aws s3api head-bucket --bucket "$STAGING_SUBDOMAIN" 2>/dev/null; then
  aws s3api create-bucket \
    --bucket "$STAGING_SUBDOMAIN" \
    --region "$REGION" \
    --create-bucket-configuration "LocationConstraint=$REGION"
fi

aws s3api delete-public-access-block --bucket "$STAGING_SUBDOMAIN" 2>/dev/null || true

aws s3api put-bucket-website \
  --bucket "$STAGING_SUBDOMAIN" \
  --website-configuration '{"IndexDocument":{"Suffix":"index.html"},"ErrorDocument":{"Key":"404.html"}}'

policy_file="$(mktemp)"
cleanup() {
  rm -f "$policy_file"
}
trap cleanup EXIT

jq -n --arg bucket "$STAGING_SUBDOMAIN" '{
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicReadGetObject",
      Effect: "Allow",
      Principal: "*",
      Action: ["s3:GetObject"],
      Resource: ["arn:aws:s3:::" + $bucket + "/*"]
    }
  ]
}' > "$policy_file"

aws s3api put-bucket-policy --bucket "$STAGING_SUBDOMAIN" --policy "file://$policy_file"

aws s3 sync "$BUILD_DIR/" "s3://$STAGING_SUBDOMAIN/" --delete

hosted_zone_id="$(aws route53 list-hosted-zones-by-name \
  --dns-name "$DOMAIN_NAME" \
  --query 'HostedZones[0].Id' \
  --output text | sed 's|/hostedzone/||')"

change_batch="$(mktemp)"
trap 'rm -f "$policy_file" "$change_batch"' EXIT

jq -n \
  --arg name "$STAGING_SUBDOMAIN." \
  --arg target "$STAGING_SUBDOMAIN.s3-website.$REGION.amazonaws.com" \
  '{
    Changes: [
      {
        Action: "UPSERT",
        ResourceRecordSet: {
          Name: $name,
          Type: "CNAME",
          TTL: 300,
          ResourceRecords: [{ Value: $target }]
        }
      }
    ]
  }' > "$change_batch"

aws route53 change-resource-record-sets \
  --hosted-zone-id "$hosted_zone_id" \
  --change-batch "file://$change_batch"

echo "Staging website deployed: http://$STAGING_SUBDOMAIN"