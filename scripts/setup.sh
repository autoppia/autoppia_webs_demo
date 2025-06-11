#!/bin/bash
# setup.sh - Deploy web demo projects with optional custom ports using .env

set -e

echo "🚀 Setting up web demos..."

# Get script directory (where setup.sh is located)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Demos are in the parent directory of scripts/
DEMOS_DIR="$(dirname "$SCRIPT_DIR")"

echo "📂 Script location: $SCRIPT_DIR"
echo "📂 Looking for demos in: $DEMOS_DIR"

# Default ports
WEB_PORT_DEFAULT=8000
POSTGRES_PORT_DEFAULT=5434
WEB_DEMO="all"
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
    --demo=*)
      WEB_DEMO="${ARG#*=}"
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

WEB_PORT="${WEB_PORT:-$WEB_PORT_DEFAULT}"
POSTGRES_PORT="${POSTGRES_PORT:-$POSTGRES_PORT_DEFAULT}"

echo "Selected demo: $WEB_DEMO"
echo "Using web port: $WEB_PORT"
echo "Using Postgres port: $POSTGRES_PORT"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Please install Docker first."
  exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
else
  echo "✅ Docker is running"
fi

deploy_web3() {
  local project_dir="$DEMOS_DIR/web_3_autozone"
  if [ -d "$project_dir" ]; then
    echo "📦 Deploying web_3_autozone..."
    pushd "$project_dir" > /dev/null
    bash run_docker_with_db.sh
    popd > /dev/null
  else
    echo "❌ web_3_autozone directory not found at $project_dir"
  fi
}
# This function deploys the specified project folder
deploy_project() {
  local project_name="$1"
  local project_web_port="$2"
  local project_postgres_port="$3"
  local compose_project_name="$4"
  
  # Use absolute path relative to script location
  local project_dir="$DEMOS_DIR/$project_name"

  if [ -d "$project_dir" ]; then
    echo "📂 Deploying $project_dir..."

    # Create or overwrite a .env file inside the project directory
    cat <<EOF > "$project_dir/.env"
WEB_PORT=$project_web_port
POSTGRES_PORT=$project_postgres_port
EOF

    # Check for existing containers
    if sudo docker compose -p "$compose_project_name" ps &>/dev/null; then
      existing_containers=$(sudo docker compose -p "$compose_project_name" ps -q | wc -l)
      if [ "$existing_containers" -gt 0 ]; then
        echo "⚠️ Detected existing containers for $compose_project_name."

        if [ "$FORCE_DELETE" = true ]; then
          echo "🗑  Force-deleting existing containers for $compose_project_name..."
          sudo docker compose -p "$compose_project_name" down --volumes
        else
          read -p "Do you want to remove existing containers for $compose_project_name? (y/n) " choice
          case "$choice" in
            [Yy]* ) 
              echo "🗑  Removing existing containers..."
              sudo docker compose -p "$compose_project_name" down --volumes
              ;;
            * )
              echo "Skipping removal of existing containers. Deployment may fail if ports are in use."
              ;;
          esac
        fi
      fi
    fi

    # Spin up containers (navigate to project directory first)
    echo "🔧 Starting containers for $project_name..."
    pushd "$project_dir" > /dev/null
    sudo docker compose -p "$compose_project_name" up -d --build
    popd > /dev/null
    
    echo "✅ $project_name deployed successfully on port $project_web_port"
  else
    echo "⚠️ Project directory $project_dir not found."
    echo "Available directories in $DEMOS_DIR:"
    ls -la "$DEMOS_DIR" || echo "Directory not accessible"
  fi
}

echo "🔄 Deploying selected demo(s)..."

case "$WEB_DEMO" in
  movies)
    deploy_project "web_1_demo_movies" "$WEB_PORT" "$POSTGRES_PORT" "movies_${WEB_PORT}"
    ;;
  books)
    deploy_project "web_2_demo_books" "$WEB_PORT" "$POSTGRES_PORT" "books_${WEB_PORT}"
    ;;
  autozone)
    deploy_web3
    ;;
  all)
    deploy_project "web_1_demo_movies" "$WEB_PORT" "$POSTGRES_PORT" "movies_${WEB_PORT}"
    deploy_project "web_2_demo_books" "$((WEB_PORT+1))" "$((POSTGRES_PORT+1))" "books_$((WEB_PORT+1))"
    deploy_web3
    ;;

  *)
    echo "❌ Unknown demo type: $WEB_DEMO. Use 'movies', 'books', or 'all'."
    exit 1
    ;;
esac

echo "✨ Deployment complete!"
