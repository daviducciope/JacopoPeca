#!/usr/bin/env bash

set -euo pipefail

DISTRIBUTION_ID="${DISTRIBUTION_ID:-E1WY7YHVG6PVEF}"
RUNTIME_ORIGIN_DOMAIN="${RUNTIME_ORIGIN_DOMAIN:?Set RUNTIME_ORIGIN_DOMAIN, for example runtime.jacopopeca.com}"
ORIGIN_ID="${ORIGIN_ID:-jacopopeca-runtime-origin}"
ORIGIN_PROTOCOL_POLICY="${ORIGIN_PROTOCOL_POLICY:-http-only}"

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

aws cloudfront get-distribution-config \
  --id "$DISTRIBUTION_ID" \
  --output json > "$tmpdir/current.json"

etag="$(jq -r '.ETag' "$tmpdir/current.json")"
jq '.DistributionConfig' "$tmpdir/current.json" > "$tmpdir/config.json"

jq \
  --arg originId "$ORIGIN_ID" \
  --arg domain "$RUNTIME_ORIGIN_DOMAIN" \
  --arg protocol "$ORIGIN_PROTOCOL_POLICY" '
  .Origins.Items = [
    {
      Id: $originId,
      DomainName: $domain,
      OriginPath: "",
      CustomHeaders: { Quantity: 0 },
      CustomOriginConfig: {
        HTTPPort: 80,
        HTTPSPort: 443,
        OriginProtocolPolicy: $protocol,
        OriginSslProtocols: { Quantity: 1, Items: ["TLSv1.2"] },
        OriginReadTimeout: 30,
        OriginKeepaliveTimeout: 5
      },
      ConnectionAttempts: 3,
      ConnectionTimeout: 10,
      OriginShield: { Enabled: false }
    }
  ] |
  .Origins.Quantity = 1 |
  .DefaultCacheBehavior.TargetOriginId = $originId |
  .DefaultCacheBehavior.ViewerProtocolPolicy = "redirect-to-https" |
  .DefaultCacheBehavior.AllowedMethods = {
    Quantity: 7,
    Items: ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
    CachedMethods: { Quantity: 2, Items: ["GET", "HEAD"] }
  } |
  .DefaultCacheBehavior.ForwardedValues = {
    QueryString: true,
    Cookies: { Forward: "all" },
    Headers: { Quantity: 1, Items: ["Authorization"] },
    QueryStringCacheKeys: { Quantity: 0 }
  } |
  .DefaultCacheBehavior.MinTTL = 0 |
  .DefaultCacheBehavior.DefaultTTL = 0 |
  .DefaultCacheBehavior.MaxTTL = 31536000
  ' "$tmpdir/config.json" > "$tmpdir/updated.json"

aws cloudfront update-distribution \
  --id "$DISTRIBUTION_ID" \
  --if-match "$etag" \
  --distribution-config "file://$tmpdir/updated.json"

aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths '/*'
