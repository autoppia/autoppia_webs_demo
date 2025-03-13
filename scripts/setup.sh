#!/bin/bash
# setup.sh - Deploy web demo projects with optional custom ports

set -e

echo "🚀 Setting up web demos..."

WEB_PORT_DEFAULT=8000
POSTGRES_PORT_DEFAULT=5434

# Parse command line arguments for --web_port and --postgres_port
for ARG in "$@"; do
  case $ARG in
    --web_port=*)
      WEB_PORT="${ARG#*=}"
      shift
      ;;
    --postgres_port=*)
      POSTGRES_PORT="${ARG#*=}"
      shift
      ;;
    *)
      # Unknown option; ignore or handle as needed
      ;;
  esac
done

# Defaults if not provided
WEB_PORT="${WEB_PORT:-$WEB_PORT_DEFAULT}"
POSTGRES_PORT="${POSTGRES_PORT:-$POSTGRES_PORT_DEFAULT}"

echo "Using web port: $WEB_PORT"
echo "Using Postgres port: $POSTGRES_PORT"

# Check Docker installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found."
    exit 1
fi

# Check Docker running
if ! systemctl is-active --quiet docker; then
    echo "🔄 Starting Docker service..."
    sudo systemctl start docker
fi

# Export variables so Compose can read them
export WEB_PORT
export POSTGRES_PORT

# A unique project name based on the web port (could also include Postgres port)
PROJECT_NAME="movies_${WEB_PORT}"

deploy_project() {
    local project_dir="$1"
    if [ -d "$project_dir" ]; then
        echo "📂 Deploying $project_dir..."
        cd "$project_dir"
        
        # Use the -p flag so Compose creates unique containers/volumes
        sudo docker compose -p "$PROJECT_NAME" up -d --build
        
        cd ..
    else
        echo "⚠️ Project directory $project_dir not found."
    fi
}

echo "🔄 Deploying web demos..."

cd ..
deploy_project "web_1_demo_movies"
cd scripts

echo "✨ Web demos deployment complete!"
