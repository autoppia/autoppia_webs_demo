#!/usr/bin/env bash
# Run lint in every web_* app. Use before pushing to catch errors locally (same as CI).
# Requires Node and Bun (lint scripts use bunx). Usage: ./scripts/lint-all-webs.sh
set -euo pipefail

REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO_ROOT"

failed=()
for d in $(find . -maxdepth 1 -type d -name 'web_*' | sed 's|^\./||' | sort); do
  [[ -f "$d/package.json" ]] || continue
  echo "--- Lint $d ---"
  if (cd "$d" && npm run lint); then
    :
  else
    failed+=("$d")
  fi
done

if [[ ${#failed[@]} -gt 0 ]]; then
  echo ""
  echo "Lint failed in: ${failed[*]}"
  exit 1
fi
echo ""
echo "Lint passed in all web_* apps."
