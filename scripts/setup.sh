#!/usr/bin/env bash
# setup.sh - Deploy web demo projects with optional custom ports using .env
# Before deploying, remove all Docker volumes, images, and prune networks to avoid stale data conflicts.

set -euo pipefail

echo "🚀 Setting up web demos..."
# 0. Remove all containers
echo "[INFO] Removing all containers..."
docker ps -aq | xargs -r docker rm -f || echo "[WARN] No containers to remove."
# 1. Prune Docker environment
echo "[INFO] Removing all Docker volumes, images and pruning networks..."
# Remove all volumes
docker volume rm $(docker volume ls -q) || echo "[WARN] No volumes to remove or failure occurred."
# Remove all images
docker rmi $(docker images -q) --force || echo "[WARN] No images to remove or failure occurred."
# Prune networks
docker network prune -f || echo "[WARN] Network prune failed or no unused networks."

echo "[INFO] Docker environment cleaned."

# 2. Determine directories
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEMOS_DIR="$( dirname "$SCRIPT_DIR" )"

echo "📂 Script location: $SCRIPT_DIR"
echo "📂 Looking for demos in: $DEMOS_DIR"

# 3. Default ports and options
WEB_PORT_DEFAULT=8000
POSTGRES_PORT_DEFAULT=5434
WEB_DEMO="all"
FORCE_DELETE=false

# 4. Parse arguments
for ARG in "$@"; do
  case $ARG in
    --web_port=*)      WEB_PORT="${ARG#*=}"; shift ;;  
    --postgres_port=*) POSTGRES_PORT="${ARG#*=}"; shift ;;  
    --demo=*)          WEB_DEMO="${ARG#*=}"; shift ;;    
    -y|--yes)          FORCE_DELETE=true; shift ;;       
    *) ;; # ignore unknown
  esac
done

WEB_PORT="${WEB_PORT:-$WEB_PORT_DEFAULT}"
POSTGRES_PORT="${POSTGRES_PORT:-$POSTGRES_PORT_DEFAULT}"

echo "Selected demo: $WEB_DEMO"
echo "Using web port: $WEB_PORT"
echo "Using Postgres port: $POSTGRES_PORT"

# 5. Docker prerequisites
if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Please install Docker first."
  exit 1
fi

if ! docker info &> /dev/null; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
else
  echo "✅ Docker is running"
fi

# 6. Deploy webs_server if needed
deploy_webs_server() {
  local project_path="$DEMOS_DIR/webs_server"
  local project_name="webs_server"

  echo "📂 Deploying $project_name from $project_path..."

  if [ -d "$project_path" ]; then
    pushd "$project_path" > /dev/null

    # Check if the project is already running
    local running_containers
    running_containers=$(docker ps --filter "name=${project_name}" --format "{{.Names}}")

    if [ -n "$running_containers" ]; then
      echo "⚠️ Docker containers for '$project_name' are already running:"
      echo "$running_containers"
      read -p "🔁 Do you want to redeploy (stop and rebuild)? [y/N]: " confirm
      if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "🚫 Skipping redeployment of $project_name."
        popd > /dev/null
        return
      fi

      echo "🛑 Stopping and removing existing containers for $project_name..."
      docker compose -p "$project_name" down --volumes
    fi

    echo "🚀 Starting new deployment for $project_name..."
    docker compose -p "$project_name" up -d --build

    popd > /dev/null
  else
    echo "❌ webs_server directory not found at $project_path"
  fi
}

# This function deploys the specified project folder
deploy_project() {
  local project_name="$1"
  local project_web_port="$2"
  local project_postgres_port="$3"
  local compose_project_name="$4"

  local project_dir="$DEMOS_DIR/$project_name"

  if [ -d "$project_dir" ]; then
    echo "📂 Deploying $project_dir..."

    # Create .env file, ensuring POSTGRES_PORT is only added if not empty
    {
      echo "WEB_PORT=$project_web_port"
      if [ -n "$project_postgres_port" ]; then
        echo "POSTGRES_PORT=$project_postgres_port"
      fi
    } > "$project_dir/.env"


    # Check for existing containers
    if docker compose -p "$compose_project_name" ps &>/dev/null; then
      existing_containers=$(docker compose -p "$compose_project_name" ps -q | wc -l)
      if [ "$existing_containers" -gt 0 ]; then
        echo "⚠️ Detected existing containers for $compose_project_name."

        if [ "$FORCE_DELETE" = true ]; then
          echo "🗑 Force-deleting existing containers..."
          docker compose -p "$compose_project_name" down --volumes
        else
          read -rp "Remove existing containers for $compose_project_name? (y/n) " choice
          case "$choice" in
            [Yy]*) echo "🗑 Removing existing containers..."; docker compose -p "$compose_project_name" down --volumes ;;  
            *)     echo "Skipping removal. May fail if ports busy." ;;  
          esac
        fi
      fi
    fi

    # Start containers
    echo "🔧 Starting containers for $project_name..."
    pushd "$project_dir" > /dev/null
    docker compose -p "$compose_project_name" up -d --build
    popd > /dev/null
    echo "✅ $project_name deployed on port $project_web_port"
  else
    echo "⚠️ Project directory $project_dir not found."
    echo "Available in $DEMOS_DIR:"; ls -1 "$DEMOS_DIR" || true
  fi
}

# 7. Execute deployments
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
  all)
    deploy_project "web_1_demo_movies" "$WEB_PORT" "$POSTGRES_PORT" "movies_${WEB_PORT}"
    deploy_project "web_2_demo_books" "$((WEB_PORT+1))" "$((POSTGRES_PORT+1))" "books_$((WEB_PORT+1))"
    deploy_project "web_3_autozone" "$((WEB_PORT+2))" "" "autozone_$((WEB_PORT+2))"
    deploy_webs_server
    ;;
  *)
    echo "❌ Unknown demo type: $WEB_DEMO. Use 'movies', 'books', 'autozone', or 'all'."
    exit 1
    ;;
esac

echo "✨ Deployment complete!"
