#!/usr/bin/env bash
# Install pre-push hook to run lint in all web_* before push. Run once per clone.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOK_SRC="$SCRIPT_DIR/git-hooks/pre-push"
HOOK_DST="$REPO_ROOT/.git/hooks/pre-push"
if [[ ! -d "$REPO_ROOT/.git" ]]; then
  echo "Not a git repo."
  exit 1
fi
cp "$HOOK_SRC" "$HOOK_DST"
chmod +x "$HOOK_DST"
echo "Installed pre-push hook: .git/hooks/pre-push (runs scripts/lint-all-webs.sh before push)"
