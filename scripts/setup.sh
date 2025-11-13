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
#   --enabled_dynamic_versions=[v1,v2,v3]   Enable specific dynamic versions (default: v1)
#                                            v2 requires choosing: DB mode OR AI generation (see examples)
#   --enable_db_mode=BOOL         Enable DB-backed mode (for v2: load pre-generated data from DB)
#   --data_seed_value=INT         Seed value for v2 data generation (required for DB mode, optional for AI)
#   -y, --yes                     Force Docker cleanup (remove all containers/images/volumes) before deploy
#   --fast=BOOL                   Skip cleanup and use cached builds (true/false, default: false)
#   -h, --help                    Show this help and exit
#
# Examples:
#   ./setup.sh --demo=automail  # v1 enabled by default (seeds + layout variants)
#   
#   # v2: AI Generation mode (generates data on-the-fly)
#   ./setup.sh --enabled_dynamic_versions=v2
#   
#   # v2: DB Mode (loads pre-generated data from database)
#   ./setup.sh --enabled_dynamic_versions=v2 --enable_db_mode=true --data_seed_value=42
#   
#   # v1 + v2: Layouts + AI Generation
#   ./setup.sh --enabled_dynamic_versions=v1,v2
#   
#   # v1 + v2: Layouts + DB Mode
#   ./setup.sh --enabled_dynamic_versions=v1,v2 --enable_db_mode=true --data_seed_value=42
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
  --enabled_dynamic_versions=[v1,v2,v3]   Enable specific dynamic versions (default: v1)
                                            v2 requires choosing: DB mode OR AI generation
  --enable_db_mode=BOOL         Enable DB-backed mode (for v2: load pre-generated data from DB)
  --data_seed_value=INT         Seed value for v2 (required for DB mode, optional for AI)
  --fast=BOOL                   Skip cleanup and use cached builds (true/false, default: false)
  -h, --help                    Show this help and exit

Examples:
  ./setup.sh --demo=automail  # v1 enabled by default (seeds + layout variants)
  
  # v2: AI Generation mode (generates data on-the-fly)
  ./setup.sh --enabled_dynamic_versions=v2
  
  # v2: DB Mode (loads pre-generated data from database)
  ./setup.sh --enabled_dynamic_versions=v2 --enable_db_mode=true --data_seed_value=42
  
  # v1 + v2: Layouts + AI Generation
  ./setup.sh --enabled_dynamic_versions=v1,v2
  
  # v1 + v2: Layouts + DB Mode
  ./setup.sh --enabled_dynamic_versions=v1,v2 --enable_db_mode=true --data_seed_value=42
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
# Dynamic versions system: v1=ENABLE_DYNAMIC_HTML, v2=ENABLE_DATA_GENERATION, v3=ENABLE_DYNAMIC_HTML_STRUCTURE
# Individual defaults removed - now controlled by ENABLED_DYNAMIC_VERSIONS_DEFAULT
ENABLE_DB_MODE_DEFAULT=false
ENABLE_SEED_HTML_DEFAULT=false
DATA_SEED_VALUE=""    # Optional integer seed for v2 data generation
FAST_DEFAULT=false
ENABLED_DYNAMIC_VERSIONS_DEFAULT="v1" # v1 enabled by default (seeds + layout variants)

# 5) Parse args (only one public flag, plus -y convenience)
for ARG in "$@"; do
  case "$ARG" in
    --web_port=*)        WEB_PORT="${ARG#*=}" ;;
    --postgres_port=*)   POSTGRES_PORT="${ARG#*=}" ;;
    --webs_port=*)       WEBS_PORT="${ARG#*=}" ;;
    --webs_postgres=*)   WEBS_PG_PORT="${ARG#*=}" ;;
    --demo=*)            WEB_DEMO="${ARG#*=}" ;;
    --enable_db_mode=*)   ENABLE_DB_MODE="${ARG#*=}" ;;
    --enabled_dynamic_versions=*) ENABLED_DYNAMIC_VERSIONS="${ARG#*=}" ;;
    --data_seed_value=*)  DATA_SEED_VALUE="${ARG#*=}" ;;
    -h|--help)           print_usage; exit 0 ;;
    --fast=*)            FAST_MODE="${ARG#*=}" ;;
    # Deprecated flags (kept for backward compatibility, but ignored)
    --enable_dynamic_html=*) echo "[WARN] --enable_dynamic_html is deprecated. Use --enabled_dynamic_versions=v1" ;;
    --enable_data_generation=*) echo "[WARN] --enable_data_generation is deprecated. Use --enabled_dynamic_versions=v2" ;;
    --seed_value=*)       DATA_SEED_VALUE="${ARG#*=}"; echo "[WARN] --seed_value is deprecated. Use --data_seed_value" ;;
    *) ;;
  esac
done

WEB_PORT="${WEB_PORT:-$WEB_PORT_DEFAULT}"
POSTGRES_PORT="${POSTGRES_PORT:-$POSTGRES_PORT_DEFAULT}"
WEBS_PORT="${WEBS_PORT:-$WEBS_PORT_DEFAULT}"
WEBS_PG_PORT="${WEBS_PG_PORT:-$WEBS_PG_PORT_DEFAULT}"
# Initialize flags to false - will be overridden by dynamic versions system if versions are enabled
ENABLE_DYNAMIC_HTML="${ENABLE_DYNAMIC_HTML:-false}"
ENABLE_DATA_GENERATION="${ENABLE_DATA_GENERATION:-false}"
ENABLE_DB_MODE="${ENABLE_DB_MODE:-$ENABLE_DB_MODE_DEFAULT}"
ENABLE_DYNAMIC_HTML_STRUCTURE="${ENABLE_DYNAMIC_HTML_STRUCTURE:-false}"
ENABLE_SEED_HTML="${ENABLE_SEED_HTML:-$ENABLE_SEED_HTML_DEFAULT}"
DATA_SEED_VALUE="${DATA_SEED_VALUE:-}"
FAST_MODE="${FAST_MODE:-$FAST_DEFAULT}"
ENABLED_DYNAMIC_VERSIONS="${ENABLED_DYNAMIC_VERSIONS:-$ENABLED_DYNAMIC_VERSIONS_DEFAULT}"

# Helpers: validation and normalization (single copy)
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
ENABLE_DYNAMIC_HTML_STRUCTURE="$(normalize_bool "$ENABLE_DYNAMIC_HTML_STRUCTURE")"
ENABLE_SEED_HTML="$(normalize_bool "$ENABLE_SEED_HTML")"
FAST_MODE="$(normalize_bool "$FAST_MODE")"
if [ "$ENABLE_DYNAMIC_HTML" = "__INVALID__" ] || [ "$ENABLE_DATA_GENERATION" = "__INVALID__" ] || [ "$ENABLE_DB_MODE" = "__INVALID__" ] || [ "$ENABLE_DYNAMIC_HTML_STRUCTURE" = "__INVALID__" ] || [ "$ENABLE_SEED_HTML" = "__INVALID__" ] || [ "$FAST_MODE" = "__INVALID__" ]; then
  echo "❌ Invalid boolean flag. Use true/false (or yes/no, 1/0)."
  exit 1
fi

# Normalize and validate enabled dynamic versions (accepts formats like v1,v2 or [v1,v2])
normalize_versions() {
  local raw="$1"
  # remove surrounding brackets and whitespace
  raw="${raw//[[:space:]]/}"
  raw="${raw//\[/}"
  raw="${raw//\]/}"
  # empty -> empty
  if [ -z "$raw" ]; then
    echo ""
    return 0
  fi
  # split and validate each token
  IFS=',' read -ra parts <<<"$raw"
  local out=()
  for p in "${parts[@]}"; do
    # allow tokens like v1, v2, v10; reject if empty
    if [[ -z "$p" ]]; then
      echo "__INVALID__"
      return 0
    fi
    if [[ ! "$p" =~ ^v[0-9]+$ ]]; then
      echo "__INVALID__"
      return 0
    fi
    out+=("$p")
  done
  # rejoin normalized list (comma-separated)
  local IFS=','; echo "${out[*]}"
}

ENABLED_DYNAMIC_VERSIONS_NORMALIZED="$(normalize_versions "$ENABLED_DYNAMIC_VERSIONS")"
if [ "$ENABLED_DYNAMIC_VERSIONS_NORMALIZED" = "__INVALID__" ]; then
  echo "❌ Invalid --enabled_dynamic_versions value. Expected comma-separated tokens like v1,v2 or [v1,v2] where each token matches ^v[0-9]+$"
  exit 1
fi
ENABLED_DYNAMIC_VERSIONS="$ENABLED_DYNAMIC_VERSIONS_NORMALIZED"

# Map dynamic version tokens to feature flags
# v1 -> ENABLE_DYNAMIC_HTML (seeds + layout variants)
# v2 -> Enables data generation system (you must choose: DB mode OR AI generation)
#       - If --enable_db_mode=true: Loads pre-generated data from DB (requires --data_seed_value)
#       - If --enable_db_mode=false: Generates data with AI (--data_seed_value optional)
# v3 -> ENABLE_DYNAMIC_HTML_STRUCTURE (changes classes, IDs, structure)
# v4 -> ENABLE_SEED_HTML
if [ -n "$ENABLED_DYNAMIC_VERSIONS" ]; then
  IFS=',' read -ra _dv_parts <<<"$ENABLED_DYNAMIC_VERSIONS"
  for _dv in "${_dv_parts[@]}"; do
    case "$_dv" in
      v1)
        ENABLE_DYNAMIC_HTML=true
        # v1 also enables dynamic HTML structure by default (they work together)
        ENABLE_DYNAMIC_HTML_STRUCTURE=true
        echo "[INFO] dynamic version $_dv enabled: ENABLE_DYNAMIC_HTML=true (seeds + layout variants)"
        echo "[INFO] dynamic version $_dv also enabled: ENABLE_DYNAMIC_HTML_STRUCTURE=true (text/ID/class variations)"
        ;;
      v2)
        # v2 enables data generation system
        # Mode selection:
        #   - If ENABLE_DB_MODE=true: DB mode (load from database)
        #   - If ENABLE_DB_MODE=false: AI generation mode (generate on-the-fly)
        # By default, if no --enable_db_mode specified, use AI generation
        if [ "$ENABLE_DB_MODE" != "true" ]; then
          ENABLE_DATA_GENERATION=true
          echo "[INFO] dynamic version $_dv enabled: Data generation system (AI generation mode)"
        else
          echo "[INFO] dynamic version $_dv enabled: Data generation system (DB mode)"
        fi
        ;;
      v3)
        ENABLE_DYNAMIC_HTML_STRUCTURE=true
        echo "[INFO] dynamic version $_dv enabled: ENABLE_DYNAMIC_HTML_STRUCTURE=true"
        ;;
      v4)
        ENABLE_SEED_HTML=true
        echo "[INFO] dynamic version $_dv enabled: ENABLE_SEED_HTML=true"
        ;;
      *)
        echo "[WARN] Unknown dynamic version token '$_dv' — ignoring"
        ;;
    esac
  done
fi

# Set default DATA_SEED_VALUE for v2 DB mode
if echo "$ENABLED_DYNAMIC_VERSIONS" | grep -q "v2"; then
  if [ "$ENABLE_DB_MODE" = "true" ] && [ -z "$DATA_SEED_VALUE" ]; then
    DATA_SEED_VALUE="1"
    echo "[INFO] v2 DB mode: Using default DATA_SEED_VALUE=1 (specify --data_seed_value=X to override)"
  fi
fi

# Validate ports and seed
if ! is_valid_port "$WEB_PORT"; then echo "❌ Invalid --web_port: $WEB_PORT"; exit 1; fi
if ! is_valid_port "$POSTGRES_PORT"; then echo "❌ Invalid --postgres_port: $POSTGRES_PORT"; exit 1; fi
if ! is_valid_port "$WEBS_PORT"; then echo "❌ Invalid --webs_port: $WEBS_PORT"; exit 1; fi
if ! is_valid_port "$WEBS_PG_PORT"; then echo "❌ Invalid --webs_postgres: $WEBS_PG_PORT"; exit 1; fi
if [ -n "$DATA_SEED_VALUE" ] && ! is_integer "$DATA_SEED_VALUE"; then echo "❌ --data_seed_value must be an integer"; exit 1; fi

is_valid_demo() {
  case "$1" in
    movies|books|autozone|autodining|autocrm|automail|autodelivery|autolodge|autoconnect|autowork|autocalendar|autolist|autodrive|autohealth|all) return 0;;
    *) return 1;;
  esac
}
if ! is_valid_demo "$WEB_DEMO"; then
  echo "❌ Invalid demo option: $WEB_DEMO. Use one of: 'movies', 'books', 'autozone', 'autodining', 'autocrm', 'automail', 'autodelivery', 'autolodge', 'autoconnect', 'autowork', 'autocalendar', 'autolist', 'autodrive', 'autohealth', or 'all'."
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
echo "    Dynamic structure:      →  $ENABLE_DYNAMIC_HTML_STRUCTURE"
echo "    Seed HTML enabled:      →  $ENABLE_SEED_HTML"
echo "    Enabled dynamic versions→  ${ENABLED_DYNAMIC_VERSIONS:-<none>}"
echo "    Data seed value (v2):   →  ${DATA_SEED_VALUE:-<none>}"
echo "    Fast mode:              →  $FAST_MODE"
echo

# 6) Check Docker (single copy)
if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker not installed."
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker daemon not running."
  exit 1
fi
echo "✅ Docker is ready."

# 0/1. Global cleanup to ensure fresh deploy unless fast mode is enabled (single copy)
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
  # Remove all containers (running and stopped)
  docker ps -aq | xargs -r docker rm -f || true
  # Also try to remove by name pattern in case some weren't caught
  docker ps -a --filter "name=webs_server" --format "{{.ID}}" | xargs -r docker rm -f || true

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

  echo "📂 Deploying $name (HTTP→$webp, DB→$pgp, Dynamic HTML→$ENABLE_DYNAMIC_HTML, Structure→$ENABLE_DYNAMIC_HTML_STRUCTURE)..."
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
      NEXT_PUBLIC_DATA_GENERATION="$ENABLE_DATA_GENERATION" \
      ENABLE_DB_MODE="$ENABLE_DB_MODE" \
      NEXT_PUBLIC_ENABLE_DB_MODE="$ENABLE_DB_MODE" \
      NEXT_PUBLIC_ENABLE_DATA_GENERATION="$ENABLE_DATA_GENERATION" \
      DATA_SEED_VALUE="$DATA_SEED_VALUE" \
      NEXT_PUBLIC_DATA_SEED_VALUE="$DATA_SEED_VALUE" \
      API_URL="http://app:8080" \
      NEXT_PUBLIC_API_URL="http://localhost:$WEBS_PORT" \
      ENABLED_DYNAMIC_VERSIONS="$ENABLED_DYNAMIC_VERSIONS" \
      NEXT_PUBLIC_ENABLED_DYNAMIC_VERSIONS="$ENABLED_DYNAMIC_VERSIONS" \
      ENABLE_DYNAMIC_HTML_STRUCTURE="$ENABLE_DYNAMIC_HTML_STRUCTURE" \
      NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE="$ENABLE_DYNAMIC_HTML_STRUCTURE" \
      DYNAMIC_HTML_STRUCTURE="$ENABLE_DYNAMIC_HTML_STRUCTURE" \
      NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE="$ENABLE_DYNAMIC_HTML_STRUCTURE" \
      ENABLE_SEED_HTML="$ENABLE_SEED_HTML" \
      NEXT_PUBLIC_ENABLE_SEED_HTML="$ENABLE_SEED_HTML"

    docker compose -p "$proj" build $cache_flag
    docker compose -p "$proj" up -d
  )

  popd >/dev/null
  echo "✅ $name is running on port $webp (Dynamic HTML: $ENABLE_DYNAMIC_HTML, Data generation: $ENABLE_DATA_GENERATION, DB mode: $ENABLE_DB_MODE, Dynamic structure: $ENABLE_DYNAMIC_HTML_STRUCTURE, Seed HTML: $ENABLE_SEED_HTML)"
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

  # Forcefully remove any existing containers with this project name
  docker compose -p "$name" down --volumes --remove-orphans || true
  # Also remove containers by name pattern as a fallback
  docker ps -a --filter "name=${name}-" --format "{{.ID}}" | xargs -r docker rm -f || true

  local cache_flag=""
  if [ "$FAST_MODE" = false ]; then
    cache_flag="--no-cache"
  fi
  (
    export \
      WEB_PORT="$WEBS_PORT" \
      POSTGRES_PORT="$WEBS_PG_PORT" \
      OPENAI_API_KEY="${OPENAI_API_KEY:-}" \
      NEXT_PUBLIC_ENABLE_DB_MODE="$ENABLE_DB_MODE" \
      NEXT_PUBLIC_ENABLE_DATA_GENERATION="$ENABLE_DATA_GENERATION" \
      DATA_SEED_VALUE="$DATA_SEED_VALUE" \
      NEXT_PUBLIC_DATA_SEED_VALUE="$DATA_SEED_VALUE"

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
  autohealth)
    deploy_webs_server
    deploy_project "web_14_autohealth" "$WEB_PORT" "" "autohealth_${WEB_PORT}"
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
    #deploy_project "web_14_autohealth" "$((WEB_PORT + 13))" "" "autohealth_$((WEB_PORT + 13))"
    ;;
  *)
    echo "❌ Invalid demo option: $WEB_DEMO. Use one of: 'movies', 'books', 'autozone', 'autodining', 'autocrm', 'automail', 'autodelivery', 'autolodge', 'autoconnect', 'autowork', 'autocalendar', 'autolist', 'autodrive', 'autohealth', or 'all'."
    exit 1
    ;;
esac

echo "🎉 Deployment complete!"
