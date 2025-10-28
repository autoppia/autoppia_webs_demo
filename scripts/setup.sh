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
#   --demo=NAME                   Deploy specific demo: movies, books, autozone, autodining, autocrm, automail, autodelivery, autolodge, autoconnect, autowork, autocalendar, autolist, autodrive, or all (default: all)
#   --enable_dynamic_html=BOOL    Enable dynamic HTML (true/false, default: false)
#   --enable_data_generation=BOOL Generate demo data where supported (true/false, default: false)
#   --enable_db_mode=BOOL         Enable DB-backed mode for supported apps (true/false, default: false)
#   --seed_value=INT              Optional integer seed for data generation
#   -y, --yes                     Force Docker cleanup (remove all containers/images/volumes) before deploy
#   --fast=BOOL                   Skip cleanup and use cached builds (true/false, default: false)
#   -h, --help                    Show this help and exit
#
# Examples:
#   ./setup.sh --demo=automail --enable_dynamic_html=true
#   ./setup.sh --demo=all --enable_dynamic_html=true --web_port=8000
#------------------------------------------------------------
set -euo pipefail

echo "🚀 Setting up web demos..."

# Helper: print usage
print_usage() {
  cat <<USAGE
Usage: ./setup.sh [OPTIONS]

Options:
  --web_port=PORT               Set base web port (default: 8000)
  --postgres_port=PORT          Set base postgres port (default: 5434)
  --webs_port=PORT              Set webs_server port (default: 8090)
  --webs_postgres=PORT          Set webs_server postgres port (default: 5437)
  --demo=NAME                   One of: movies, books, autozone, autodining, autocrm, automail, autodelivery, autolodge, autoconnect, autowork, autocalendar, autolist, autodrive, all (default: all)
  --enable_dynamic_html=BOOL    Enable dynamic HTML (true/false, default: false)
  --enable_data_generation=BOOL Generate demo data where supported (true/false, default: false)
  --enable_db_mode=BOOL         Enable DB-backed mode for supported apps (true/false, default: false)
  --seed_value=INT              Optional integer seed for data generation
  --fast=BOOL                   Skip cleanup and use cached builds (true/false, default: false)
  -h, --help                    Show this help and exit

Examples:
  ./setup.sh --demo=automail --enable_dynamic_html=true --web_port=8003
  ./setup.sh --demo=all --enable_dynamic_html=true --web_port=8000
USAGE
}

# 2. External network name (will be created after cleanup)
EXTERNAL_NET="apps_net"

# 3) Detect script & demos root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEMOS_DIR="$(dirname "$SCRIPT_DIR")"
echo "📂 Script directory: $SCRIPT_DIR"
echo "📂 Demos root:      $DEMOS_DIR"

# 4) Defaults
WEB_PORT_DEFAULT=8000
POSTGRES_PORT_DEFAULT=5434
WEBS_PORT_DEFAULT=8090
WEBS_PG_PORT_DEFAULT=5437
WEB_DEMO="all"
ENABLE_DYNAMIC_HTML_DEFAULT=false
ENABLE_DATA_GENERATION_DEFAULT=false
ENABLE_DB_MODE_DEFAULT=false
SEED_VALUE=""    # optional integer seed
FAST_DEFAULT=false

# 5) Parse args (only one public flag, plus -y convenience)
for ARG in "$@"; do
  case "$ARG" in
    --web_port=*)        WEB_PORT="${ARG#*=}" ;;
    --postgres_port=*)   POSTGRES_PORT="${ARG#*=}" ;;
    --webs_port=*)       WEBS_PORT="${ARG#*=}" ;;
    --webs_postgres=*)   WEBS_PG_PORT="${ARG#*=}" ;;
    --demo=*)            WEB_DEMO="${ARG#*=}" ;;
    --enable_dynamic_html=*) ENABLE_DYNAMIC_HTML="${ARG#*=}" ;;
    --enable_data_generation=*) ENABLE_DATA_GENERATION="${ARG#*=}" ;;
    --enable_db_mode=*)   ENABLE_DB_MODE="${ARG#*=}" ;;
    --seed_value=*)       SEED_VALUE="${ARG#*=}" ;;
    -h|--help)           print_usage; exit 0 ;;
    --fast=*)            FAST_MODE="${ARG#*=}" ;;
    *) ;;
  esac
done

WEB_PORT="${WEB_PORT:-$WEB_PORT_DEFAULT}"
POSTGRES_PORT="${POSTGRES_PORT:-$POSTGRES_PORT_DEFAULT}"
WEBS_PORT="${WEBS_PORT:-$WEBS_PORT_DEFAULT}"
WEBS_PG_PORT="${WEBS_PG_PORT:-$WEBS_PG_PORT_DEFAULT}"
ENABLE_DYNAMIC_HTML="${ENABLE_DYNAMIC_HTML:-$ENABLE_DYNAMIC_HTML_DEFAULT}"
ENABLE_DATA_GENERATION="${ENABLE_DATA_GENERATION:-$ENABLE_DATA_GENERATION_DEFAULT}"
ENABLE_DB_MODE="${ENABLE_DB_MODE:-$ENABLE_DB_MODE_DEFAULT}"
SEED_VALUE="${SEED_VALUE:-}"
FAST_MODE="${FAST_MODE:-$FAST_DEFAULT}"

# Helpers: validation and normalization
to_lower() { echo "${1:-}" | tr '[:upper:]' '[:lower:]'; }
normalize_bool() {
  local v; v="$(to_lower "${1:-}")"
  case "$v" in
    true|1|yes|y) echo true ;;
    false|0|no|n|"") echo false ;;
    *) echo "__INVALID__" ;;
  esac
}
is_valid_port() {
  local p="$1"; [[ "$p" =~ ^[0-9]+$ ]] && [ "$p" -ge 1 ] && [ "$p" -le 65535 ]
}
is_integer() { [[ "${1:-}" =~ ^-?[0-9]+$ ]]; }

# Normalize booleans
ENABLE_DYNAMIC_HTML="$(normalize_bool "$ENABLE_DYNAMIC_HTML")"
ENABLE_DATA_GENERATION="$(normalize_bool "$ENABLE_DATA_GENERATION")"
ENABLE_DB_MODE="$(normalize_bool "$ENABLE_DB_MODE")"
FAST_MODE="$(normalize_bool "$FAST_MODE")"
if [ "$ENABLE_DYNAMIC_HTML" = "__INVALID__" ] || [ "$ENABLE_DATA_GENERATION" = "__INVALID__" ] || [ "$ENABLE_DB_MODE" = "__INVALID__" ] || [ "$FAST_MODE" = "__INVALID__" ]; then
  echo "❌ Invalid boolean flag. Use true/false (or yes/no, 1/0)."
  exit 1
fi

# Validate ports and seed
if ! is_valid_port "$WEB_PORT"; then echo "❌ Invalid --web_port: $WEB_PORT"; exit 1; fi
if ! is_valid_port "$POSTGRES_PORT"; then echo "❌ Invalid --postgres_port: $POSTGRES_PORT"; exit 1; fi
if ! is_valid_port "$WEBS_PORT"; then echo "❌ Invalid --webs_port: $WEBS_PORT"; exit 1; fi
if ! is_valid_port "$WEBS_PG_PORT"; then echo "❌ Invalid --webs_postgres: $WEBS_PG_PORT"; exit 1; fi
if [ -n "$SEED_VALUE" ] && ! is_integer "$SEED_VALUE"; then echo "❌ --seed_value must be an integer"; exit 1; fi

is_valid_demo() {
  case "$1" in
    movies|books|autozone|autodining|autocrm|automail|autodelivery|autolodge|autoconnect|autowork|autocalendar|autolist|autodrive|all) return 0;;
    *) return 1;;
  esac
}
if ! is_valid_demo "$WEB_DEMO"; then
  echo "❌ Invalid demo option: $WEB_DEMO. Use one of: 'movies', 'books', 'autozone', 'autodining', 'autocrm', 'automail', 'autodelivery', 'autolodge', 'autoconnect', 'autowork', 'autocalendar', 'autolist', 'autodrive', or 'all'."
  exit 1
fi

echo "🔣 Configuration:"
echo "    movies/books base HTTP  →  $WEB_PORT"
echo "    movies/books Postgres   →  $POSTGRES_PORT"
echo "    webs_server HTTP        →  $WEBS_PORT"
echo "    webs_server Postgres    →  $WEBS_PG_PORT"
echo "    Demo to deploy:         →  $WEB_DEMO"
echo "    Dynamic HTML enabled:   →  $ENABLE_DYNAMIC_HTML"
echo "    Data generation:        →  $ENABLE_DATA_GENERATION"
echo "    DB mode:                →  $ENABLE_DB_MODE"
echo "    Seed value:             →  ${SEED_VALUE:-<none>}"
echo "    Fast mode:              →  $FAST_MODE"
echo

# 6) Check Docker
if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker not installed."
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker daemon not running."
  exit 1
fi
echo "✅ Docker is ready."

# 0/1. Global cleanup to ensure fresh deploy unless fast mode is enabled
if [ "$FAST_MODE" = true ]; then
  echo "[INFO] Fast mode enabled: skipping global Docker cleanup and using cached builds."
  # Ensure external network exists when skipping cleanup
  if ! docker network ls --format '{{.Name}}' | grep -qx "$EXTERNAL_NET"; then
    echo "[INFO] Creating external network: $EXTERNAL_NET"
    docker network create "$EXTERNAL_NET"
  else
    echo "[INFO] External network $EXTERNAL_NET already exists"
  fi
else
  echo "[INFO] Removing all containers..."
  docker ps -aq | xargs -r docker rm -f || true

  echo "[INFO] Pruning volumes, images and networks..."
  docker volume ls -q | xargs -r docker volume rm 2>/dev/null || true
  docker images -q | xargs -r docker rmi --force 2>/dev/null || true
  docker network prune -f || true

  # Recreate external network for app ↔ front communication after pruning
  if ! docker network ls --format '{{.Name}}' | grep -qx "$EXTERNAL_NET"; then
    echo "[INFO] Creating external network: $EXTERNAL_NET"
    docker network create "$EXTERNAL_NET"
  else
    echo "[INFO] External network $EXTERNAL_NET already exists"
  fi
fi

# 7) Deploy functions
deploy_project() {
  local name="$1"; shift
  local webp="$1"; shift
  local pgp="$1"; shift
  local proj="$1"; shift

  local dir="$DEMOS_DIR/$name"
  if [[ ! -d "$dir" ]]; then
    echo "⚠️  Directory does not exist: $dir"
    return 0
  fi

  echo "📂 Deploying $name (HTTP→$webp, DB→$pgp, Dynamic HTML→$ENABLE_DYNAMIC_HTML)..."
  pushd "$dir" > /dev/null

  if docker compose -p "$proj" ps -q | grep -q .; then
    echo "    [INFO] Removing previous containers..."
    docker compose -p "$proj" down --volumes
  fi

  # Build (optionally without cache), then start
  local cache_flag=""
  if [ "$FAST_MODE" = false ]; then
    cache_flag="--no-cache"
  fi
  (
    export \
      WEB_PORT="$webp" \
      POSTGRES_PORT="$pgp" \
      ENABLE_DYNAMIC_HTML="$ENABLE_DYNAMIC_HTML" \
      ENABLE_DATA_GENERATION="$ENABLE_DATA_GENERATION" \
      ENABLE_DB_MODE="$ENABLE_DB_MODE" \
      NEXT_PUBLIC_ENABLE_DB_MODE="$ENABLE_DB_MODE" \
      DATA_SEED_VALUE="$SEED_VALUE" \
      NEXT_PUBLIC_DATA_SEED_VALUE="$SEED_VALUE" \
      API_URL="http://app:$WEBS_PORT" \
      NEXT_PUBLIC_API_URL="http://localhost:$WEBS_PORT"

    docker compose -p "$proj" build $cache_flag
    docker compose -p "$proj" up -d
  )

  popd >/dev/null
  echo "✅ $name is running on port $webp (Dynamic HTML: $ENABLE_DYNAMIC_HTML)"
  echo
}

deploy_webs_server() {
  local name="webs_server"
  local dir="$DEMOS_DIR/$name"
  if [[ ! -d "$dir" ]]; then
    echo "❌ Directory not found: $dir"
    exit 1
  fi

  echo "📂 Deploying $name (HTTP→$WEBS_PORT, DB→$WEBS_PG_PORT)..."
  pushd "$dir" >/dev/null

  docker compose -p "$name" down --volumes || true

  local cache_flag=""
  if [ "$FAST_MODE" = false ]; then
    cache_flag="--no-cache"
  fi
  (
    export \
      WEB_PORT="$WEBS_PORT" \
      POSTGRES_PORT="$WEBS_PG_PORT" \
      OPENAI_API_KEY="${OPENAI_API_KEY:-}"

    docker compose -p "$name" build $cache_flag
    docker compose -p "$name" up -d
  )

  # Wait for webs_server to be ready
  echo "⏳ Waiting for $name to be ready..."
  max_attempts=60
  attempt=1
  check_health() {
    local url="http://localhost:$WEBS_PORT/health"
    if command -v curl >/dev/null 2>&1; then
      curl -fsS "$url" >/dev/null 2>&1
    elif command -v wget >/dev/null 2>&1; then
      wget -qO- "$url" >/dev/null 2>&1
    else
      echo "❌ Neither curl nor wget is installed for health checks."
      return 1
    fi
  }
  while [ $attempt -le $max_attempts ]; do
    if check_health; then
      echo "✅ $name is ready"
      break
    else
      echo "   Attempt $attempt/$max_attempts - $name not ready, waiting 2 seconds..."
      sleep 2
      attempt=$((attempt + 1))
    fi
  done

  if [ $attempt -gt $max_attempts ]; then
    echo "❌ $name did not become ready after $max_attempts attempts"
    echo "📋 Checking logs:"
    docker compose -p "$name" logs --tail=20
    exit 1
  fi

  popd >/dev/null
  echo "✅ $name is running on HTTP→localhost:$WEBS_PORT, DB→localhost:$WEBS_PG_PORT"
  echo
}

# 8) Execute
case "$WEB_DEMO" in
  movies)
    deploy_webs_server
    deploy_project "web_1_demo_movies" "$WEB_PORT" "$POSTGRES_PORT" "movies_${WEB_PORT}"
    ;;
  books)
    deploy_project "web_2_demo_books" "$WEB_PORT" "$POSTGRES_PORT" "books_${WEB_PORT}"
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
  all)
    deploy_webs_server
    deploy_project "web_1_demo_movies" "$WEB_PORT" "$POSTGRES_PORT" "movies_${WEB_PORT}"
    deploy_project "web_2_demo_books" "$((WEB_PORT + 1))" "$((POSTGRES_PORT + 1))" "books_$((WEB_PORT + 1))"
    deploy_project "web_3_autozone" "$((WEB_PORT + 2))" "" "autozone_$((WEB_PORT + 2))"
    deploy_project "web_4_autodining" "$((WEB_PORT + 3))" "" "autodining_$((WEB_PORT + 3))"
    deploy_project "web_5_autocrm" "$((WEB_PORT + 4))" "" "autocrm_$((WEB_PORT + 4))"
    deploy_project "web_6_automail" "$((WEB_PORT + 5))" "" "automail_$((WEB_PORT + 5))"
    deploy_project "web_7_autodelivery" "$((WEB_PORT + 6))" "" "autodelivery_$((WEB_PORT + 6))"
    deploy_project "web_8_autolodge" "$((WEB_PORT + 7))" "" "autolodge_$((WEB_PORT + 7))"
    deploy_project "web_9_autoconnect" "$((WEB_PORT + 8))" "" "autoconnect_$((WEB_PORT + 8))"
    deploy_project "web_10_autowork" "$((WEB_PORT + 9))" "" "autowork_$((WEB_PORT + 9))"
    deploy_project "web_11_autocalendar" "$((WEB_PORT + 10))" "" "autocalendar_$((WEB_PORT + 10))"
    deploy_project "web_12_autolist" "$((WEB_PORT + 11))" "" "autolist_$((WEB_PORT + 11))"
    deploy_project "web_13_autodrive" "$((WEB_PORT + 12))" "" "autodrive_$((WEB_PORT + 12))"
    ;;
  *)
    echo "❌ Invalid demo option: $WEB_DEMO. Use one of: 'movies', 'books', 'autozone', 'autodining', 'autocrm', 'automail', 'autodelivery', 'autolodge', 'autoconnect', 'autowork', 'autocalendar', 'autolist', 'autodrive', or 'all'."
    exit 1
    ;;
esac

echo "🎉 Deployment complete!"
