#!/usr/bin/env bash
# Run npm audit in every web_* app. Use locally to check for vulnerabilities (CI runs this per-app).
# Usage: ./scripts/audit-all-webs.sh   or   ./scripts/audit-all-webs.sh --audit-level=moderate
set -euo pipefail

REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
[[ $# -eq 0 ]] && set -- --audit-level=high
cd "$REPO_ROOT"

failed=()
for d in $(find . -maxdepth 1 -type d -name 'web_*' | sed 's|^\./||' | sort); do
  [[ -f "$d/package.json" ]] || continue
  echo "--- Audit $d ---"
  if (cd "$d" && npm audit "$@"); then
    :
  else
    failed+=("$d")
  fi
done

if [[ ${#failed[@]} -gt 0 ]]; then
  echo ""
  echo "Audit failed in: ${failed[*]}"
  exit 1
fi
echo ""
echo "Audit passed in all web_* apps."
