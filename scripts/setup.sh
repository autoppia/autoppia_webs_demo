#!/bin/bash
# setup.sh - Deploy web demo projects with optional custom ports using .env

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
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Check if Docker is running
if ! systemctl is-active --quiet docker; then
    echo "🔄 Starting Docker service..."
    sudo systemctl start docker
fi

# This function deploys the specified project folder
deploy_project() {
    local project_dir="$1"

    if [ -d "$project_dir" ]; then
        echo "📂 Deploying $project_dir..."

        # Step 1: Create or overwrite a .env file inside the project directory
        cat <<EOF > "$project_dir/.env"
WEB_PORT=$WEB_PORT
POSTGRES_PORT=$POSTGRES_PORT
EOF

        # Step 2: Run Docker Compose with a unique project name, so we can run multiple instances side by side
        local project_name="movies_${WEB_PORT}"

        # Step 3: Spin up containers
        cd "$project_dir"
        sudo docker compose -p "$project_name" up -d --build
        cd ..
    else
        echo "⚠️ Project directory $project_dir not found."
    fi
}

echo "🔄 Deploying web demos..."

cd ..

# Deploy web_1_demo_movies (add additional calls here if you have more projects)
deploy_project "web_1_demo_movies"

cd scripts

echo "✨ Web demos deployment complete!"
