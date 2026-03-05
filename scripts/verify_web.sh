#!/usr/bin/env bash
# verify_web.sh - Run verification (lint, unit tests, optional e2e) for a web demo.
# Usage: ./scripts/verify_web.sh <web_dir> [--e2e]
# Example: ./scripts/verify_web.sh web_16_autodiscord --e2e
# Used by CI and locally to ensure a web passes before merge.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEMOS_DIR="$(dirname "$SCRIPT_DIR")"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <web_dir> [--e2e]"
  echo "  web_dir  e.g. web_16_autodiscord"
  echo "  --e2e    run Playwright e2e tests (if supported)"
  exit 1
fi

WEB_DIR="$1"
RUN_E2E=false
[[ "${2:-}" == "--e2e" ]] && RUN_E2E=true

ABS_WEB="$DEMOS_DIR/$WEB_DIR"
if [[ ! -d "$ABS_WEB" ]]; then
  echo "Error: directory not found: $ABS_WEB"
  exit 1
fi

echo "Verifying: $WEB_DIR"
cd "$ABS_WEB"

if [[ ! -f package.json ]]; then
  echo "Error: no package.json in $WEB_DIR"
  exit 1
fi

npm ci
npm run lint

if grep -q '"test":' package.json 2>/dev/null; then
  npm run test
fi

if [[ "$RUN_E2E" == true ]]; then
  if grep -q '"test:e2e"' package.json 2>/dev/null; then
    npx playwright install chromium --with-deps 2>/dev/null || true
    npm run test:e2e
  else
    echo "Skipping e2e (no test:e2e script)"
  fi
fi

echo "Verify OK: $WEB_DIR"
