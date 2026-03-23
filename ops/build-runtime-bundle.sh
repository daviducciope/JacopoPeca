#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT_DIR/web"
ARTIFACTS_DIR="$ROOT_DIR/.artifacts"
OUTPUT_FILE="$ARTIFACTS_DIR/jacopopeca-runtime.tgz"

mkdir -p "$ARTIFACTS_DIR"

pushd "$WEB_DIR" >/dev/null
npm run db:generate
npm run build

tar -czf "$OUTPUT_FILE" \
  .next/standalone \
  .next/static \
  public \
  prisma \
  package.json \
  package-lock.json
popd >/dev/null

echo "Runtime bundle creato: $OUTPUT_FILE"