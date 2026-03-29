#!/usr/bin/env bash
# Run Jest with coverage in every web_* app, pytest coverage in webs_server, then print the monorepo summary.
# Requires Node/npm (and deps installed per app), Python with pytest/pytest-cov/coverage for the backend.
# Usage:
#   ./scripts/coverage-all.sh
#   COVERAGE_ENFORCE=1 ./scripts/coverage-all.sh   # same as: ... --enforce 1 --failOnMissing 0
set -euo pipefail

REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO_ROOT"

failed=()

for d in $(find . -maxdepth 1 -type d -name 'web_*' | sed 's|^\./||' | sort); do
  [[ -f "$d/package.json" ]] || continue
  if ! (cd "$d" && npm run 2>/dev/null | grep -q " test"); then
    echo "--- Skip $d (no test script) ---"
    continue
  fi
  echo "--- Coverage $d ---"
  if (cd "$d" && npm test -- --coverage --watch=false); then
    :
  else
    failed+=("$d")
  fi
done

if [[ -d "webs_server" ]] && { [[ -f "webs_server/.coveragerc" ]] || [[ -f "webs_server/requirements.txt" ]]; }; then
  echo "--- Coverage webs_server ---"
  if (
    cd "webs_server" &&
      python3 -m pytest --cov=src --cov-report=xml --cov-report=term-missing --cov-config=.coveragerc
  ); then
    :
  else
    failed+=("webs_server")
  fi
else
  echo "--- Skip webs_server (not present) ---"
fi

summary_args=(--coverageBaseDir .)
if [[ "${COVERAGE_ENFORCE:-}" == "1" ]]; then
  summary_args+=(--enforce 1 --failOnMissing 0)
fi

echo ""
echo "--- Monorepo coverage summary ---"
node scripts/monorepo-coverage-summary.mjs "${summary_args[@]}"

if [[ ${#failed[@]} -gt 0 ]]; then
  echo ""
  echo "Coverage/tests failed in: ${failed[*]}"
  exit 1
fi

echo ""
echo "All coverage runs completed successfully."
