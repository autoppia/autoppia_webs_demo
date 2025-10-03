#!/usr/bin/env bash
# setup.sh - Deploy all web demo projects + API (webs_server) with isolation
#------------------------------------------------------------
set -euo pipefail

echo "🚀 Setting up web demos..."

# 0. Remove all containers
echo "[INFO] Removing all containers..."
docker ps -aq | xargs -r docker rm -f || true

# 1. Prune Docker environment
echo "[INFO] Pruning volumes, images and networks..."
docker volume rm $(docker volume ls -q) 2>/dev/null || true
docker rmi $(docker images -q) --force 2>/dev/null || true
docker network prune -f || true

# 2. Ensure external network for app ↔ front communication
EXTERNAL_NET="apps_net"
if ! docker network ls --format '{{.Name}}' | grep -qx "$EXTERNAL_NET"; then
  echo "[INFO] Creating external network: $EXTERNAL_NET"
  docker network create "$EXTERNAL_NET"
else
  echo "[INFO] External network $EXTERNAL_NET already exists"
fi

# 3. Detect script & demos root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEMOS_DIR="$( dirname "$SCRIPT_DIR" )"
echo "📂 Script directory: $SCRIPT_DIR"
echo "📂 Demos root:      $DEMOS_DIR"

# 4. Default ports & options
WEB_PORT_DEFAULT=8000
POSTGRES_PORT_DEFAULT=5434
WEBS_PORT_DEFAULT=8090
WEBS_PG_PORT_DEFAULT=5437
WEB_DEMO="all"
FORCE_DELETE=false
ENABLE_DYNAMIC_HTML="false"

# 5. Parse args
for ARG in "$@"; do
  case $ARG in
    --web_port=*)      WEB_PORT="${ARG#*=}" ;;
    --postgres_port=*) POSTGRES_PORT="${ARG#*=}" ;;
    --webs_port=*)     WEBS_PORT="${ARG#*=}" ;;
    --webs_postgres=*) WEBS_PG_PORT="${ARG#*=}" ;;
    --demo=*)          WEB_DEMO="${ARG#*=}" ;;
    --enable_dynamic_html=*) ENABLE_DYNAMIC_HTML="${ARG#*=}" ;;
    -y|--yes)          FORCE_DELETE=true ;;
    *) ;; 
  esac
done

WEB_PORT="${WEB_PORT:-$WEB_PORT_DEFAULT}"
POSTGRES_PORT="${POSTGRES_PORT:-$POSTGRES_PORT_DEFAULT}"
WEBS_PORT="${WEBS_PORT:-$WEBS_PORT_DEFAULT}"
WEBS_PG_PORT="${WEBS_PG_PORT:-$WEBS_PG_PORT_DEFAULT}"

echo "🔣 Configuration:"
echo "    movies/books base HTTP  →  $WEB_PORT"
echo "    movies/books Postgres   →  $POSTGRES_PORT"
echo "    webs_server HTTP        →  $WEBS_PORT"
echo "    webs_server Postgres    →  $WEBS_PG_PORT"
echo "    Demo to deploy:         →  $WEB_DEMO"
echo "    Enable Dynamic HTML     →  $ENABLE_DYNAMIC_HTML"
echo

# 6. Check Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker not installed."
  exit 1
fi
if ! docker info &> /dev/null; then
  echo "❌ Docker daemon not running."
  exit 1
fi
echo "✅ Docker is ready."

# 7. Deploy functions

deploy_project() {
  local name="$1"; shift
  local webp="$1"; shift
  local pgp="$1"; shift
  local proj="$1"; shift

  local dir="$DEMOS_DIR/$name"
  if [ ! -d "$dir" ]; then
    echo "⚠️  Directory does not exist: $dir"
    return
  fi

  echo "📂 Deploying $name (HTTP→$webp, DB→$pgp)..."
  pushd "$dir" > /dev/null

    if docker compose -p "$proj" ps -q | grep -q .; then
      echo "    [INFO] Removing previous containers..."
      docker compose -p "$proj" down --volumes
    fi

    # up
    WEB_PORT="$webp" POSTGRES_PORT="$pgp" ENABLE_DYNAMIC_HTML="$ENABLE_DYNAMIC_HTML" \
      docker compose -p "$proj" up -d --build

  popd > /dev/null
  echo "✅ $name is running on port $webp"
  echo
}

deploy_webs_server() {
  local name="webs_server"
  local dir="$DEMOS_DIR/$name"
  if [ ! -d "$dir" ]; then
    echo "❌ Directory not found: $dir"
    exit 1
  fi

  echo "📂 Deploying $name (HTTP→$WEBS_PORT, DB→$WEBS_PG_PORT)..."
  pushd "$dir" > /dev/null

    docker compose -p "$name" down --volumes || true

    WEB_PORT="$WEBS_PORT" POSTGRES_PORT="$WEBS_PG_PORT" \
      docker compose -p "$name" up -d --build

  popd > /dev/null
  echo "✅ $name is running on HTTP→localhost:$WEBS_PORT, DB→localhost:$WEBS_PG_PORT"
  echo
}

# 8. Execute

case "$WEB_DEMO" in
  movies)
    deploy_project "web_1_demo_movies" "$WEB_PORT" "$POSTGRES_PORT" "movies_${WEB_PORT}"
    ;;
  books)
    deploy_project "web_2_demo_books" "$WEB_PORT" "$POSTGRES_PORT" "books_${WEB_PORT}"
    ;;
  autozone)
    deploy_project "web_3_autozone" "$WEB_PORT" "" "autozone_${WEB_PORT}"
    deploy_webs_server
    ;;
  autodining)
    deploy_project "web_4_autodining" "$WEB_PORT" "" "autodining_${WEB_PORT}"
    deploy_webs_server
    ;;
  autocrm)
    deploy_project "web_5_autocrm" "$WEB_PORT" "" "autocrm_${WEB_PORT}"
    deploy_webs_server
    ;;
  automail)
    deploy_project "web_6_automail" "$WEB_PORT" "" "automail_${WEB_PORT}"
    deploy_webs_server
    ;;
  autocalender)
    deploy_project "web_11_autocalendar" "$WEB_PORT" "" "autocalendar_${WEB_PORT}"
    deploy_webs_server
    ;;
  all)
    deploy_project "web_1_demo_movies" "$WEB_PORT" "$POSTGRES_PORT" "movies_${WEB_PORT}"
    deploy_project "web_2_demo_books" "$((WEB_PORT + 1))" "$((POSTGRES_PORT + 1))" "books_$((WEB_PORT + 1))"
    deploy_project "web_3_autozone" "$((WEB_PORT + 2))" "" "autozone_$((WEB_PORT + 2))"
    deploy_project "web_4_autodining" "$((WEB_PORT + 3))" "" "autodining_$((WEB_PORT + 3))"
    deploy_project "web_5_autocrm" "$((WEB_PORT + 4))" "" "autocrm_$((WEB_PORT + 4))"
    deploy_project "web_6_automail" "$((WEB_PORT + 5))" "" "automail_$((WEB_PORT + 5))"
    deploy_project "web_11_autocalendar" "$((WEB_PORT + 10))" "" "autocalender_$((WEB_PORT + 10))"
    deploy_webs_server
    ;;
  *)
    echo "❌ Invalid demo option: $WEB_DEMO. Use 'movies', 'books', 'autozone', 'autodining', 'autocrm', 'automail', 'autocalender', or 'all'."
    exit 1
    ;;
esac

echo "🎉 Deployment complete!"
