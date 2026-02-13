#!/usr/bin/env bash
# setup.sh - Deploy all web demo projects + API (webs_server) with isolation
#------------------------------------------------------------
# Usage:
#   ./setup.sh [OPTIONS]
#
# Options:
#   --web_port=PORT               Set base web port (default: 8000)
#   --postgres_port=PORT          Set base postgres port (default: 5434)
#   --webs_port=PORT              Set webs_server port (default: 8090)
#   --webs_postgres=PORT          Set webs_server postgres port (default: 5437)
#   --demo=NAME                   Deploy specific demo: movies, autocinema, books, autobooks, autozone, autodining, autocrm, automail, autodelivery, autolodge, autoconnect, autowork, autocalendar, autolist, autodrive, autohealth, or all (default: all)
#   --enabled_dynamic_versions=[v1,v2,v3]   Enable specific dynamic versions (default: v1,v2,v3)
#                                            v2 = carga de datos por seed (dataset por ?seed=X)
#   --webs_data_path=PATH         Host dir to bind at /app/data (default: $DEMOS_DIR/webs_server/initial_data)
#   -y, --yes                     Force Docker cleanup (remove all containers/images/volumes) before deploy
#   --fast=BOOL                   Skip cleanup and use cached builds (true/false, default: false)
#   --parallel=N                  Max concurrent web project deployments when --demo=all (default: 3)
#   -h, --help                    Show this help and exit
#
# Examples:
#   ./setup.sh --demo=automail  # v1,v3 enabled by default (seeds + layout variants + HTML structure)
#   ./setup.sh --enabled_dynamic_versions=v2  # v2: DB Mode
#   ./setup.sh --enabled_dynamic_versions=v1,v2  # v1 + v2: Layouts + DB Mode
#   ./setup.sh --demo=all --parallel=4  # Deploy all demos with max 4 concurrent
#------------------------------------------------------------
set -euo pipefail

echo "🚀 Setting up web demos..."

# Load helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

# Helper: print usage
print_usage() {
  cat <<USAGE
Usage: ./setup.sh [OPTIONS]

Options:
  --web_port=PORT               Set base web port (default: 8000)
  --postgres_port=PORT          Set base postgres port (default: 5434)
  --webs_port=PORT              Set webs_server port (default: 8090)
  --webs_postgres=PORT          Set webs_server postgres port (default: 5437)
  --demo=NAME                   One of: movies, autocinema, books, autobooks, autozone, autodining, autocrm, automail, autodelivery, autolodge, autoconnect, autowork, autocalendar, autolist, autodrive, autohealth, all (default: all)
  --enabled_dynamic_versions=[v1,v2,v3]   Enable specific dynamic versions (default: v1,v2,v3). v2 = datos por seed.
  --webs_data_path=PATH         Host dir to bind at /app/data (default: \$DEMOS_DIR/webs_server/initial_data)
  --fast=BOOL                   Skip cleanup and use cached builds (true/false, default: false)
  --parallel=N                  Max concurrent web project deployments when --demo=all (default: 3)
  -h, --help                    Show this help and exit

Examples:
  ./setup.sh --demo=automail  # v1,v3 enabled by default (seeds + layout variants + HTML structure)
  ./setup.sh --enabled_dynamic_versions=v2  # v2: DB Mode
  ./setup.sh --enabled_dynamic_versions=v1,v2  # v1 + v2: Layouts + DB Mode
  ./setup.sh --demo=all --parallel=4  # Deploy all demos with max 4 concurrent
USAGE
}

# ============================================================================
# 1. CONFIGURATION
# ============================================================================

# Paths
DEMOS_DIR="$(dirname "$SCRIPT_DIR")"
EXTERNAL_NET="apps_net"
WEBS_PROJECTS="web_1_autocinema web_2_autobooks web_3_autozone web_4_autodining web_5_autocrm web_6_automail web_7_autodelivery web_8_autolodge web_9_autoconnect web_10_autowork web_11_autocalendar web_12_autolist web_13_autodrive web_14_autohealth"

echo "📂 Script directory: $SCRIPT_DIR"
echo "📂 Demos root:      $DEMOS_DIR"

# ============================================================================
# 2. PARSE ARGUMENTS
# ============================================================================

for ARG in "$@"; do
  case "$ARG" in
    --web_port=*)        WEB_PORT="${ARG#*=}" ;;
    --postgres_port=*)   POSTGRES_PORT="${ARG#*=}" ;;
    --webs_port=*)       WEBS_PORT="${ARG#*=}" ;;
    --webs_postgres=*)   WEBS_PG_PORT="${ARG#*=}" ;;
    --demo=*)            WEB_DEMO="${ARG#*=}" ;;
    --enabled_dynamic_versions=*) ENABLED_DYNAMIC_VERSIONS="${ARG#*=}" ;;
    --webs_data_path=*)  WEBS_DATA_PATH="${ARG#*=}" ;;
    -h|--help)           print_usage; exit 0 ;;
    --fast=*)            FAST_MODE="${ARG#*=}" ;;
    --parallel=*)        PARALLEL_JOBS="${ARG#*=}" ;;
    *) ;;
  esac
done

# Apply defaults (if not provided via arguments)
WEB_PORT="${WEB_PORT:-8000}"
POSTGRES_PORT="${POSTGRES_PORT:-5434}"
WEBS_PORT="${WEBS_PORT:-8090}"
WEBS_PG_PORT="${WEBS_PG_PORT:-5437}"
WEB_DEMO="${WEB_DEMO:-all}"
FAST_MODE="${FAST_MODE:-false}"
PARALLEL_JOBS="${PARALLEL_JOBS:-3}"
ENABLED_DYNAMIC_VERSIONS="${ENABLED_DYNAMIC_VERSIONS:-v1,v2,v3}"

# Initialize dynamic version flags (will be set by version mapping)
ENABLE_DYNAMIC_V1="${ENABLE_DYNAMIC_V1:-false}"
ENABLE_DYNAMIC_V2="${ENABLE_DYNAMIC_V2:-}"
ENABLE_DYNAMIC_V3="${ENABLE_DYNAMIC_V3:-false}"
ENABLE_DYNAMIC_V4="${ENABLE_DYNAMIC_V4:-false}"

# ============================================================================
# 3. NORMALIZE VALUES
# ============================================================================

# Normalize dynamic versions FIRST (before mapping)
ENABLED_DYNAMIC_VERSIONS_NORMALIZED="$(normalize_versions "$ENABLED_DYNAMIC_VERSIONS")"
if [ "$ENABLED_DYNAMIC_VERSIONS_NORMALIZED" = "__INVALID__" ]; then
  echo "❌ Invalid --enabled_dynamic_versions value. Expected comma-separated tokens like v1,v2 or [v1,v2] where each token matches ^v[0-9]+$"
  exit 1
fi
ENABLED_DYNAMIC_VERSIONS="$ENABLED_DYNAMIC_VERSIONS_NORMALIZED"

# ============================================================================
# 4. MAP DYNAMIC VERSIONS TO FLAGS
# ============================================================================
# v1 -> ENABLE_DYNAMIC_V1 (seeds + layout variants)
# v2 -> ENABLE_DYNAMIC_V2 (datos por seed)
# v3 -> ENABLE_DYNAMIC_V3 (changes classes, IDs, structure)
# v4 -> ENABLE_DYNAMIC_V4

if [ -n "$ENABLED_DYNAMIC_VERSIONS" ]; then
  IFS=',' read -ra VERSION_PARTS <<<"$ENABLED_DYNAMIC_VERSIONS"
  for version in "${VERSION_PARTS[@]}"; do
    case "$version" in
      v1)
        ENABLE_DYNAMIC_V1=true
        echo "[INFO] v1 enabled: seeds + layout variants"
        ;;
      v2)
        ENABLE_DYNAMIC_V2=true
        echo "[INFO] v2 enabled: data by seed"
        ;;
      v3)
        ENABLE_DYNAMIC_V3=true
        echo "[INFO] v3 enabled: HTML structure changes"
        ;;
      v4)
        ENABLE_DYNAMIC_V4=true
        echo "[INFO] v4 enabled: seed HTML"
        ;;
      *)
        echo "[WARN] Unknown version: $version (ignoring)"
        ;;
    esac
  done
else
  echo "[INFO] No dynamic versions specified; leaving all dynamic flags disabled."
fi

# Normalize all boolean flags AFTER version mapping (so mapped values are preserved)
for var in ENABLE_DYNAMIC_V1 ENABLE_DYNAMIC_V2 ENABLE_DYNAMIC_V3 ENABLE_DYNAMIC_V4 FAST_MODE; do
  eval "$var=\$(normalize_bool \"\$$var\")"
done

# Check for invalid booleans
for var in ENABLE_DYNAMIC_V1 ENABLE_DYNAMIC_V2 ENABLE_DYNAMIC_V3 ENABLE_DYNAMIC_V4 FAST_MODE; do
  if [ "$(eval echo \$$var)" = "__INVALID__" ]; then
    echo "❌ Invalid boolean flag: $var. Use true/false (or yes/no, 1/0)."
    exit 1
  fi
done

# ============================================================================
# 5. VALIDATE CONFIGURATION
# ============================================================================

# Validate ports
for port_var in WEB_PORT POSTGRES_PORT WEBS_PORT WEBS_PG_PORT; do
  port_val=$(eval echo \$$port_var)
  if ! is_valid_port "$port_val"; then
    echo "❌ Invalid port: $port_var=$port_val"
    exit 1
  fi
done

# Validate demo name
if ! is_valid_demo "$WEB_DEMO"; then
  echo "❌ Invalid demo: $WEB_DEMO. Use one of: movies, autocinema, books, autobooks, autozone, autodining, autocrm, automail, autodelivery, autolodge, autoconnect, autowork, autocalendar, autolist, autodrive, autohealth, or all."
  exit 1
fi

# Validate parallel jobs (used only when --demo=all)
if [ "$WEB_DEMO" = "all" ]; then
  if ! is_integer "$PARALLEL_JOBS" || [ "$PARALLEL_JOBS" -lt 1 ]; then
    echo "❌ Invalid --parallel value: $PARALLEL_JOBS. Use a positive integer (e.g., 3)."
    exit 1
  fi
fi

# ============================================================================
# 6. SHOW CONFIGURATION
# ============================================================================

echo ""
echo "🔣 Configuration:"
echo "    Ports:"
if [ "$WEB_DEMO" = "all" ]; then
  echo "      Base web port         →  $WEB_PORT"
else
  echo "      $WEB_DEMO HTTP         →  $WEB_PORT"
  echo "      $WEB_DEMO DB           →  N/A (uses webs_server)"
fi
echo "      webs_server HTTP    →  $WEBS_PORT"
echo "      webs_server DB      →  $WEBS_PG_PORT"
echo "    Demo:                  →  $WEB_DEMO"
echo "    Dynamic versions:"
echo "      V1 (seeds/layouts)   →  $ENABLE_DYNAMIC_V1"
echo "      V2 (data by seed)    →  $ENABLE_DYNAMIC_V2"
echo "      V3 (HTML structure)  →  $ENABLE_DYNAMIC_V3"
echo "      V4 (seed HTML)       →  $ENABLE_DYNAMIC_V4"
echo "    Enabled versions       →  ${ENABLED_DYNAMIC_VERSIONS:-<none>}"
echo "    Fast mode              →  $FAST_MODE"
[ "$WEB_DEMO" = "all" ] && echo "    Parallel jobs           →  $PARALLEL_JOBS"
echo "    Host data path         →  ${WEBS_DATA_PATH:-<default: ~/webs_data (copied from repo)>}"
echo ""

# ============================================================================
# 7. DEPLOY FUNCTIONS
# ============================================================================

# Setup Docker (check, cleanup, create network)
setup_docker() {
  # Check Docker is installed
  if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker not installed."
    exit 1
  fi
  
  # Check Docker daemon is running
  if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker daemon not running."
    exit 1
  fi
  echo "✅ Docker is ready."

  # Cleanup or fast mode
  if [ "$FAST_MODE" = true ]; then
    echo "[INFO] Fast mode: skipping cleanup, using cached builds"
    if ! docker network ls --format '{{.Name}}' | grep -qx "$EXTERNAL_NET"; then
      docker network create "$EXTERNAL_NET"
    fi
  else
    echo "[INFO] Cleaning up Docker..."
    docker ps -aq | xargs -r docker rm -f || true
    docker volume ls -q | xargs -r docker volume rm 2>/dev/null || true
    docker images -q | xargs -r docker rmi --force 2>/dev/null || true
    docker network prune -f || true
    if ! docker network ls --format '{{.Name}}' | grep -qx "$EXTERNAL_NET"; then
      docker network create "$EXTERNAL_NET"
    fi
  fi
}

# Get Git commit hash for automatic versioning
# If web_dir is provided, returns the hash of the last commit that modified that directory
# Otherwise, returns the hash of the current HEAD
get_git_commit_hash() {
  local web_dir="${1:-}"
  local repo_root="$DEMOS_DIR"
  
  if ! command -v git >/dev/null 2>&1 || [ ! -d "$repo_root/.git" ]; then
    echo "unknown"
    return
  fi
  
  if [ -n "$web_dir" ]; then
    # Get the hash of the last commit that modified files in this web directory
    # This ensures each web gets its own version based on when it was last changed
    local hash=$(git -C "$repo_root" log -1 --format=%h -- "$web_dir/" 2>/dev/null)
    if [ -n "$hash" ]; then
      echo "$hash"
    else
      # Fallback: if no commits found for this directory, use HEAD
      git -C "$repo_root" rev-parse --short HEAD 2>/dev/null || echo "unknown"
    fi
  else
    # No directory specified, use HEAD
    git -C "$repo_root" rev-parse --short HEAD 2>/dev/null || echo "unknown"
  fi
}

# Export environment variables for deployment
export_env_vars() {
  local web_port="$1"
  local db_port="$2"
  local web_dir="${3:-}"  # Optional: web directory name (e.g., "web_1_autocinema")
  local git_hash=$(get_git_commit_hash "$web_dir")
  export \
    WEB_PORT="$web_port" \
    POSTGRES_PORT="$db_port" \
    GIT_COMMIT_HASH="$git_hash" \
    ENABLE_DYNAMIC_V1="$ENABLE_DYNAMIC_V1" \
    NEXT_PUBLIC_ENABLE_DYNAMIC_V1="$ENABLE_DYNAMIC_V1" \
    ENABLE_DYNAMIC_V2="$ENABLE_DYNAMIC_V2" \
    NEXT_PUBLIC_ENABLE_DYNAMIC_V2="$ENABLE_DYNAMIC_V2" \
    ENABLE_DYNAMIC_V3="$ENABLE_DYNAMIC_V3" \
    NEXT_PUBLIC_ENABLE_DYNAMIC_V3="$ENABLE_DYNAMIC_V3" \
    ENABLE_DYNAMIC_V4="$ENABLE_DYNAMIC_V4" \
    NEXT_PUBLIC_ENABLE_DYNAMIC_V4="$ENABLE_DYNAMIC_V4" \
    API_URL="http://app:8090" \
    NEXT_PUBLIC_API_URL="http://localhost:$WEBS_PORT" \
    ENABLED_DYNAMIC_VERSIONS="$ENABLED_DYNAMIC_VERSIONS" \
    NEXT_PUBLIC_ENABLED_DYNAMIC_VERSIONS="$ENABLED_DYNAMIC_VERSIONS"
}

# Deploy a web project
deploy_project() {
  local name="$1"
  local web_port="$2"
  local db_port="$3"
  local project_name="$4"

  local dir="$DEMOS_DIR/$name"
  if [[ ! -d "$dir" ]]; then
    echo "⚠️  Directory not found: $dir"
    return 0
  fi

  echo "📂 Deploying $name (HTTP→$web_port, DB→$db_port)..."
  pushd "$dir" >/dev/null

  # Remove existing containers
  if docker compose -p "$project_name" ps -q | grep -q .; then
    echo "    [INFO] Removing previous containers..."
    docker compose -p "$project_name" down --volumes
  fi

  # Build and start
  local cache_flag=""
  [ "$FAST_MODE" = false ] && cache_flag="--no-cache"

  (
    # Pass the web directory name (e.g., "web_1_autocinema") to get its specific commit hash
    export_env_vars "$web_port" "$db_port" "$name"
    docker compose -p "$project_name" build $cache_flag
    docker compose -p "$project_name" up -d
  )

  popd >/dev/null
  echo "✅ $name running on port $web_port"
  echo ""
}

# Deploy webs_server (API)
deploy_webs_server() {
  local name="webs_server"
  local dir="$DEMOS_DIR/$name"
  
  if [[ ! -d "$dir" ]]; then
    echo "❌ Directory not found: $dir"
    exit 1
  fi

  # Check if webs_server is already running
  if docker ps --format '{{.Names}}' | grep -q "^webs_server-app-1$"; then
    echo "✅ webs_server is already running - skipping deployment"
    echo "   HTTP→localhost:$WEBS_PORT, DB→localhost:$WEBS_PG_PORT"
    return 0
  fi

  echo "📂 Deploying $name (HTTP→$WEBS_PORT, DB→$WEBS_PG_PORT)..."
  pushd "$dir" >/dev/null

  # Create .env file if it doesn't exist (docker-compose requires it)
  # Note: .env can be empty - OPENAI_API_KEY is only needed for optional data generation endpoints
  # Each web already has its static datasets in initial_data/, so LLM is not required for basic operation
  if [ ! -f ".env" ]; then
    echo "[INFO] Creating .env file (empty - LLM not required, datasets already in initial_data/)..."
    touch .env
  fi

  docker compose -p "$name" down --volumes || true

  local cache_flag=""
  [ "$FAST_MODE" = false ] && cache_flag="--no-cache"

  (
    # Calculate absolute path for webs_data (works on any server)
    # Use a temp directory outside repo to avoid modifying repo files
    if [ -z "${WEBS_DATA_PATH:-}" ]; then
      WEBS_DATA_ABS_PATH="${HOME}/webs_data"
    else
      WEBS_DATA_ABS_PATH="$WEBS_DATA_PATH"
    fi
    
    # Source data directory (in repo, read-only)
    INITIAL_DATA_DIR="$DEMOS_DIR/webs_server/initial_data"
    
    # Initialize data directory if it doesn't exist (copy from repo)
    # This copies both 'original/' (high quality, fewer records) and 'data/' (more records)
    # The container will use 'original/' if v2 is disabled, 'data/' if v2 is enabled
    if [ ! -d "$WEBS_DATA_ABS_PATH" ] || [ -z "$(ls -A "$WEBS_DATA_ABS_PATH" 2>/dev/null)" ]; then
      echo "  [INFO] Initializing data directory from repo (first time only)..."
      echo "  [INFO] Copying both 'original/' (high quality) and 'data/' (more records) directories..."
      mkdir -p "$WEBS_DATA_ABS_PATH"
      if [ -d "$INITIAL_DATA_DIR" ]; then
        cp -r "$INITIAL_DATA_DIR"/* "$WEBS_DATA_ABS_PATH/" 2>/dev/null || true
        echo "  ✅ Data copied from $INITIAL_DATA_DIR to $WEBS_DATA_ABS_PATH"
        echo "  ✅ Both 'original/' and 'data/' directories are available"
      fi
    fi
    
    export \
      WEB_PORT="$WEBS_PORT" \
      POSTGRES_PORT="$WEBS_PG_PORT" \
      OPENAI_API_KEY="${OPENAI_API_KEY:-}" \
      ENABLE_DYNAMIC_V2="$ENABLE_DYNAMIC_V2" \
      NEXT_PUBLIC_ENABLE_DYNAMIC_V2="$ENABLE_DYNAMIC_V2" \
      HOST_UID=$(id -u) \
      HOST_GID=$(id -g) \
      WEBS_DATA_PATH="$WEBS_DATA_ABS_PATH"

    # Ensure host data directory exists and is owned by the invoking user
    mkdir -p "$WEBS_DATA_PATH"
    chown -R "$(id -u)":"$(id -g)" "$WEBS_DATA_ABS_PATH" 2>/dev/null || true

    docker compose -p "$name" build $cache_flag
    docker compose -p "$name" up -d
  )

  # Wait for health check
  echo "⏳ Waiting for $name to be ready..."
  max_attempts=60
  attempt=1
  while [ $attempt -le $max_attempts ]; do
    if curl -fsS "http://localhost:$WEBS_PORT/health" >/dev/null 2>&1 || \
       wget -qO- "http://localhost:$WEBS_PORT/health" >/dev/null 2>&1; then
      echo "✅ $name is ready"
      break
    fi
    echo "   Attempt $attempt/$max_attempts - waiting 2 seconds..."
    sleep 2
    attempt=$((attempt + 1))
  done

  if [ $attempt -gt $max_attempts ]; then
    echo "❌ $name did not become ready after $max_attempts attempts"
    docker compose -p "$name" logs --tail=20
    exit 1
  fi

  # Initialize master data pools if they don't exist
  echo "📦 Checking for initial data pools..."
  # Use the same WEBS_DATA_PATH that was set in deploy_webs_server
  if [ -z "${WEBS_DATA_PATH:-}" ]; then
    WEBS_DATA_PATH="${HOME}/webs_data"
  fi
  mkdir -p "$WEBS_DATA_PATH"
  
  for project in $WEBS_PROJECTS; do
    if [ ! -f "$WEBS_DATA_PATH/$project/main.json" ]; then
      echo "  → Initializing $project master pool (100 records)..."
      mkdir -p "$WEBS_DATA_PATH/$project/data"
      if [ -d "$DEMOS_DIR/webs_server/initial_data/$project" ]; then
        cp -r "$DEMOS_DIR/webs_server/initial_data/$project"/* "$WEBS_DATA_PATH/$project/"
        echo "  ✅ $project master pool initialized"
      else
        echo "  ⚠️  No initial data found for $project (will need to generate)"
      fi
    else
  echo "  ✓ $project master pool already exists ($(cat "$WEBS_DATA_PATH/$project/main.json" | grep -o '"./data/[^"]*"' | wc -l) files)"
  fi
done

echo "✅ Master pools ready"

  popd >/dev/null
  echo "✅ $name running on HTTP→localhost:$WEBS_PORT, DB→localhost:$WEBS_PG_PORT"
  echo ""
}

# Semaphore for limiting concurrent jobs (used only when --demo=all)
PARALLEL_PIDS=()
open_sem() {
  local n="$1"
  mkfifo /tmp/sem.$$
  exec 3<>/tmp/sem.$$
  rm -f /tmp/sem.$$
  for ((i=0;i<n;i++)); do echo; done >&3
}

run_with_limit() {
  read -u 3
  { set +e; "$@"; ret=$?; echo >&3; exit $ret; } &
  PARALLEL_PIDS+=($!)
}

# ============================================================================
# 8. DOCKER SETUP
# ============================================================================

setup_docker

# ============================================================================
# 9. EXECUTE DEPLOYMENT
# ============================================================================

case "$WEB_DEMO" in
  movies|autocinema)
    deploy_webs_server
    deploy_project "web_1_autocinema" "$WEB_PORT" "" "${WEB_DEMO}_${WEB_PORT}"
    ;;
  books|autobooks)
    deploy_webs_server
    deploy_project "web_2_autobooks" "$WEB_PORT" "" "${WEB_DEMO}_${WEB_PORT}"
    ;;
  autozone)
    deploy_webs_server
    deploy_project "web_3_autozone" "$WEB_PORT" "" "autozone_${WEB_PORT}"
    ;;
  autodining)
    deploy_webs_server
    deploy_project "web_4_autodining" "$WEB_PORT" "" "autodining_${WEB_PORT}"
    ;;
  autocrm)
    deploy_webs_server
    deploy_project "web_5_autocrm" "$WEB_PORT" "" "autocrm_${WEB_PORT}"
    ;;
  automail)
    deploy_webs_server
    deploy_project "web_6_automail" "$WEB_PORT" "" "automail_${WEB_PORT}"
    ;;
  autodelivery)
    deploy_webs_server
    deploy_project "web_7_autodelivery" "$WEB_PORT" "" "autodelivery_${WEB_PORT}"
    ;;
  autolodge)
    deploy_webs_server
    deploy_project "web_8_autolodge" "$WEB_PORT" "" "autolodge_${WEB_PORT}"
    ;;
  autoconnect)
    deploy_webs_server
    deploy_project "web_9_autoconnect" "$WEB_PORT" "" "autoconnect_${WEB_PORT}"
    ;;
  autowork)
    deploy_webs_server
    deploy_project "web_10_autowork" "$WEB_PORT" "" "autowork_${WEB_PORT}"
    ;;
  autocalendar)
    deploy_webs_server
    deploy_project "web_11_autocalendar" "$WEB_PORT" "" "autocalendar_${WEB_PORT}"
    ;;
  autolist)
    deploy_webs_server
    deploy_project "web_12_autolist" "$WEB_PORT" "" "autolist_${WEB_PORT}"
    ;;
  autodrive)
    deploy_webs_server
    deploy_project "web_13_autodrive" "$WEB_PORT" "" "autodrive_${WEB_PORT}"
    ;;
  autohealth)
    deploy_webs_server
    deploy_project "web_14_autohealth" "$WEB_PORT" "" "autohealth_${WEB_PORT}"
    ;;
  all)
    deploy_webs_server
    echo "📦 Deploying all web projects in parallel (max $PARALLEL_JOBS concurrent)..."
    open_sem "$PARALLEL_JOBS"
    run_with_limit deploy_project "web_1_autocinema" "$WEB_PORT" "" "movies_${WEB_PORT}"
#    run_with_limit deploy_project "web_2_autobooks" "$((WEB_PORT + 1))" "" "books_$((WEB_PORT + 1))"
#    run_with_limit deploy_project "web_3_autozone" "$((WEB_PORT + 2))" "" "autozone_$((WEB_PORT + 2))"
#    run_with_limit deploy_project "web_4_autodining" "$((WEB_PORT + 3))" "" "autodining_$((WEB_PORT + 3))"
#    run_with_limit deploy_project "web_5_autocrm" "$((WEB_PORT + 4))" "" "autocrm_$((WEB_PORT + 4))"
#    run_with_limit deploy_project "web_6_automail" "$((WEB_PORT + 5))" "" "automail_$((WEB_PORT + 5))"
#    run_with_limit deploy_project "web_7_autodelivery" "$((WEB_PORT + 6))" "" "autodelivery_$((WEB_PORT + 6))"
#    run_with_limit deploy_project "web_8_autolodge" "$((WEB_PORT + 7))" "" "autolodge_$((WEB_PORT + 7))"
#    run_with_limit deploy_project "web_9_autoconnect" "$((WEB_PORT + 8))" "" "autoconnect_$((WEB_PORT + 8))"
#    run_with_limit deploy_project "web_10_autowork" "$((WEB_PORT + 9))" "" "autowork_$((WEB_PORT + 9))"
#    run_with_limit deploy_project "web_11_autocalendar" "$((WEB_PORT + 10))" "" "autocalendar_$((WEB_PORT + 10))"
#    run_with_limit deploy_project "web_12_autolist" "$((WEB_PORT + 11))" "" "autolist_$((WEB_PORT + 11))"
#    run_with_limit deploy_project "web_13_autodrive" "$((WEB_PORT + 12))" "" "autodrive_$((WEB_PORT + 12))"
#    run_with_limit deploy_project "web_14_autohealth" "$((WEB_PORT + 13))" "" "autohealth_$((WEB_PORT + 13))"
    failed=0
    for pid in "${PARALLEL_PIDS[@]}"; do
      wait "$pid" || failed=1
    done
    exec 3>&-
    [ $failed -eq 0 ] || exit 1
    ;;
  *)
    echo "❌ Invalid demo: $WEB_DEMO. Use one of: movies, autocinema, books, autobooks, autozone, autodining, autocrm, automail, autodelivery, autolodge, autoconnect, autowork, autocalendar, autolist, autodrive, autohealth, or all."
    exit 1
    ;;
esac

echo "🎉 Deployment complete!"
