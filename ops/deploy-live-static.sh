#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT_DIR/web"
REGION="${REGION:-eu-central-1}"
BUCKET="${BUCKET:-staging.jacopopeca.com}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:-E1WY7YHVG6PVEF}"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

need_cmd aws
need_cmd npm

pushd "$WEB_DIR" >/dev/null
npm run db:generate
npm run build:static
popd >/dev/null

if [[ ! -d "$WEB_DIR/out" ]]; then
  echo "Static export directory not found: $WEB_DIR/out" >&2
  exit 1
fi

AWS_PAGER="" aws s3 sync "$WEB_DIR/out/" "s3://$BUCKET/" \
  --delete \
  --exclude 'wp-content/*' \
  --region "$REGION"

invalidation_json="$(AWS_PAGER="" aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths '/*' \
  --output json)"

invalidation_id="$(printf '%s' "$invalidation_json" | python3 -c 'import json,sys; print(json.load(sys.stdin)["Invalidation"]["Id"])')"

echo "Deploy statico completato sul bucket s3://$BUCKET/"
echo "CloudFront distribution: $DISTRIBUTION_ID"
echo "Invalidation: $invalidation_id"
echo "Nota: questa distribuzione serve staging.jacopopeca.com, jacopopeca.com e www.jacopopeca.com"