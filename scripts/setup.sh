#!/bin/bash
# setup.sh - Deploy web demo projects with optional custom ports using .env

set -e

echo "🚀 Setting up web demos..."

# Default ports
WEB_PORT_DEFAULT=8000
POSTGRES_PORT_DEFAULT=5434

# Flags
FORCE_DELETE=false

# Parse command line arguments
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
    -y|--yes)
      FORCE_DELETE=true
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

# Check if Docker is running (systemd-based check)
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

    # Step 2: Use a unique project name
    local project_name="movies_${WEB_PORT}"

    # Step 3: Check if containers for this project already exist
    # If they do, prompt or force-delete them
    if sudo docker compose -p "$project_name" ps &>/dev/null; then
      # Check if there's at least one container running or stopped
      existing_containers=$(sudo docker compose -p "$project_name" ps -q | wc -l)
      if [ "$existing_containers" -gt 0 ]; then
        echo "⚠️ Detected existing containers for project $project_name."

        if [ "$FORCE_DELETE" = true ]; then
          echo "🗑  Force-deleting existing containers for $project_name..."
          sudo docker compose -p "$project_name" down --volumes
        else
          read -p "Do you want to remove existing containers for $project_name? (y/n) " choice
          case "$choice" in
            [Yy]* ) 
              echo "🗑  Removing existing containers..."
              sudo docker compose -p "$project_name" down --volumes
              ;;
            * )
              echo "Skipping removal of existing containers. Deployment may fail if ports are in use."
              ;;
          esac
        fi
      fi
    fi

    # Step 4: Spin up containers
    cd "$project_dir"
    sudo docker compose -p "$project_name" up -d --build
    cd ..
  else
    echo "⚠️ Project directory $project_dir not found."
  fi
}

echo "🔄 Deploying web demos..."

# If your `scripts/` folder is inside the project structure, 
# make sure you adjust paths as needed
cd ..

# Deploy web_1_demo_movies
deploy_project "web_1_demo_movies"

cd scripts

echo "✨ Web demos deployment complete!"
