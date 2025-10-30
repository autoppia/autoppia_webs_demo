#!/usr/bin/env bash
# setup.sh - Deploy all web demo projects + API (webs_server) with isolation
#------------------------------------------------------------
set -euo pipefail

echo "🚀 Setting up web demos..."

# 2. Ensure external network for app ↔ front communication
EXTERNAL_NET="apps_net"
if ! docker network ls --format '{{.Name}}' | grep -qx "$EXTERNAL_NET"; then
  echo "[INFO] Creating external network: $EXTERNAL_NET"
  docker network create "$EXTERNAL_NET"
else
  echo "[INFO] External network $EXTERNAL_NET already exists"
fi

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
SEED_VALUE=""
FORCE_DELETE=false

# 5) Parse args
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
    -y|--yes)            FORCE_DELETE=true ;;
    *) ;;
  esac
done

WEB_PORT="${WEB_PORT:-$WEB_PORT_DEFAULT}"
POSTGRES_PORT="${POSTGRES_PORT:-$POSTGRES_PORT_DEFAULT}"
WEBS_PORT="${WEBS_PORT:-$WEBS_PORT_DEFAULT}"
WEBS_PG_PORT="${WEBS_PG_PORT_DEFAULT:-$WEBS_PG_PORT_DEFAULT}"
ENABLE_DYNAMIC_HTML="${ENABLE_DYNAMIC_HTML:-$ENABLE_DYNAMIC_HTML_DEFAULT}"
ENABLE_DATA_GENERATION="${ENABLE_DATA_GENERATION:-$ENABLE_DATA_GENERATION_DEFAULT}"
ENABLE_DB_MODE="${ENABLE_DB_MODE:-$ENABLE_DB_MODE_DEFAULT}"
SEED_VALUE="${SEED_VALUE:-}"

echo "🔣 Configuration:"
echo "    Demo to deploy:         →  $WEB_DEMO"
echo "    Web port:               →  $WEB_PORT"
echo "    Webs server HTTP port:  →  $WEBS_PORT"
echo "    Dynamic HTML:           →  $ENABLE_DYNAMIC_HTML"
echo "    Data generation:        →  $ENABLE_DATA_GENERATION"
echo "    DB mode:                →  $ENABLE_DB_MODE"
echo "    Seed value:             →  ${SEED_VALUE:-<none>}"
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

  echo "📂 Deploying $name (HTTP→$webp, DB→$pgp)..."
  pushd "$dir" >/dev/null

  if docker compose -p "$proj" ps -q | grep -q .; then
    echo "    [INFO] Removing previous containers..."
    docker compose -p "$proj" down --volumes
  fi

  WEB_PORT="$webp" POSTGRES_PORT="$pgp" ENABLE_DYNAMIC_HTML="$ENABLE_DYNAMIC_HTML" \
  ENABLE_DATA_GENERATION="$ENABLE_DATA_GENERATION" \
  NEXT_PUBLIC_ENABLE_DATA_GENERATION="$ENABLE_DATA_GENERATION" \
  ENABLE_DB_MODE="$ENABLE_DB_MODE" NEXT_PUBLIC_ENABLE_DB_MODE="$ENABLE_DB_MODE" \
  DATA_SEED_VALUE="$SEED_VALUE" NEXT_PUBLIC_DATA_SEED_VALUE="$SEED_VALUE" \
  API_URL="http://app:$WEBS_PORT" NEXT_PUBLIC_API_URL="http://localhost:$WEBS_PORT" \
  docker compose -p "$proj" up -d --build

  popd >/dev/null
  echo "✅ $name is running on port $webp"
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
  WEB_PORT="$WEBS_PORT" POSTGRES_PORT="$WEBS_PG_PORT" \
  OPENAI_API_KEY="${OPENAI_API_KEY:-}" \
  docker compose -p "$name" up -d --build

  echo "⏳ Waiting for $name to be ready..."
  local max_attempts=60
  local attempt=1
  while [ $attempt -le $max_attempts ]; do
    if curl -s "http://localhost:$WEBS_PORT/health" > /dev/null 2>&1; then
      echo "✅ $name is ready"
      break
    fi
    echo "   Attempt $attempt/$max_attempts - $name not ready, waiting 2 seconds..."
    sleep 2
    attempt=$((attempt + 1))
  done

  if [ $attempt -gt $max_attempts ]; then
    echo "❌ $name did not become ready after $max_attempts attempts"
    docker compose -p "$name" logs --tail=20
    exit 1
  fi

  popd >/dev/null
  echo "✅ $name running on HTTP→localhost:$WEBS_PORT, DB→localhost:$WEBS_PG_PORT"
  echo
}

# 8) Execute
case "$WEB_DEMO" in
  movies)
    deploy_project "web_1_demo_movies" "$WEB_PORT" "$POSTGRES_PORT" "movies_${WEB_PORT}" ;;
  books)
    deploy_project "web_2_demo_books" "$WEB_PORT" "$POSTGRES_PORT" "books_${WEB_PORT}" ;;
  autozone)
    deploy_webs_server
    deploy_project "web_3_autozone" "$WEB_PORT" "" "autozone_${WEB_PORT}" ;;
  autodining)
    deploy_webs_server
    deploy_project "web_4_autodining" "$WEB_PORT" "" "autodining_${WEB_PORT}" ;;
  autocrm)
    deploy_webs_server
    deploy_project "web_5_autocrm" "$WEB_PORT" "" "autocrm_${WEB_PORT}" ;;
  automail)
    deploy_webs_server
    deploy_project "web_6_automail" "$WEB_PORT" "" "automail_${WEB_PORT}" ;;
  autodelivery)
    deploy_webs_server
    deploy_project "web_7_autodelivery" "$WEB_PORT" "" "autodelivery_${WEB_PORT}" ;;
  autolodge)
    deploy_webs_server
    deploy_project "web_8_autolodge" "$WEB_PORT" "" "autolodge_${WEB_PORT}" ;;
  autoconnect)
    deploy_webs_server
    deploy_project "web_9_autoconnect" "$WEB_PORT" "" "autoconnect_${WEB_PORT}" ;;
  autowork)
    deploy_webs_server
    deploy_project "web_10_autowork" "$WEB_PORT" "" "autowork_${WEB_PORT}" ;;
  autocalendar)
    deploy_webs_server
    deploy_project "web_11_autocalendar" "$WEB_PORT" "" "autocalendar_${WEB_PORT}" ;;
  all)
    deploy_webs_server
    deploy_project "web_11_autocalendar" "$WEB_PORT" "" "autocalendar_${WEB_PORT}" ;;
  *)
    echo "❌ Invalid demo option: $WEB_DEMO"
    echo "   Valid options: movies, books, autozone, autodining, autocrm, automail, autodelivery, autolodge, autoconnect, autowork, autocalendar, all"
    exit 1 ;;
esac

echo "🎉 Deployment complete!"
