#!/bin/bash
# setup.sh - Deploy web demo projects with optional custom ports

set -e

echo "🚀 Setting up web demos..."

# Default ports
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

# If not provided, use defaults
WEB_PORT="${WEB_PORT:-$WEB_PORT_DEFAULT}"
POSTGRES_PORT="${POSTGRES_PORT:-$POSTGRES_PORT_DEFAULT}"

echo "Using web port: $WEB_PORT"
echo "Using Postgres port: $POSTGRES_PORT"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please run install_docker.sh first"
    exit 1
fi

# Check if Docker is running
if ! systemctl is-active --quiet docker; then
    echo "🔄 Starting Docker service..."
    sudo systemctl start docker
fi

# Export environment variables so docker-compose can use them
export WEB_PORT
export POSTGRES_PORT

# Function to deploy a project directory
deploy_project() {
    local project_dir="$1"
    if [ -d "$project_dir" ]; then
        echo "📂 Deploying $project_dir..."
        cd "$project_dir"
        sudo docker compose up -d --build
        cd ..
    else
        echo "⚠️ Project directory $project_dir not found."
    fi
}

echo "🔄 Deploying web demos..."

# Go up one level to find project directories
cd ..

# Deploy your web_1_demo_movies (you can add more deploy_project calls below)
deploy_project "web_1_demo_movies"

# Return to scripts directory
cd scripts

echo "✨ Web demos deployment complete!"
