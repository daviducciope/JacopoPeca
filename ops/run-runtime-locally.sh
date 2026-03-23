#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT_DIR/web"

pushd "$WEB_DIR" >/dev/null
npm run db:generate
npm run build
node .next/standalone/server.js
popd >/dev/null