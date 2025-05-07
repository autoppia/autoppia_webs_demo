#!/bin/bash
# setup.sh - Deploy web demo projects with optional custom ports using .env

set -e

echo "🚀 Setting up web demos..."

# Default ports
WEB_PORT_DEFAULT=8000
POSTGRES_PORT_DEFAULT=5434
DEMO="all"
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
      DEMO="${ARG#*=}"
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

echo "Selected demo: $DEMO"
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
  local project_web_port="$2"
  local project_postgres_port="$3"
  local project_name="$4"

  if [ -d "$project_dir" ]; then
    echo "📂 Deploying $project_dir..."

    # Create or overwrite a .env file inside the project directory
    cat <<EOF > "$project_dir/.env"
WEB_PORT=$project_web_port
POSTGRES_PORT=$project_postgres_port
EOF

    # Check for existing containers
    if sudo docker compose -p "$project_name" ps &>/dev/null; then
      existing_containers=$(sudo docker compose -p "$project_name" ps -q | wc -l)
      if [ "$existing_containers" -gt 0 ]; then
        echo "⚠️ Detected existing containers for $project_name."

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

    # Spin up containers
    pushd "$project_dir" > /dev/null
    sudo docker compose -p "$project_name" up -d --build
    popd > /dev/null
  else
    echo "⚠️ Project directory $project_dir not found."
  fi
}

echo "🔄 Deploying selected demo(s)..."
cd ..

case "$DEMO" in
  movies)
    deploy_project "web_1_demo_movies" "$WEB_PORT" "$POSTGRES_PORT" "movies_${WEB_PORT}"
    ;;
  books)
    deploy_project "web_2_demo_books" "$WEB_PORT" "$POSTGRES_PORT" "books_${WEB_PORT}"
    ;;
  all)
    deploy_project "web_1_demo_movies" "$WEB_PORT" "$POSTGRES_PORT" "movies_${WEB_PORT}"
    deploy_project "web_2_demo_books" "$((WEB_PORT+1))" "$((POSTGRES_PORT+1))" "books_$((WEB_PORT+1))"
    ;;
  *)
    echo "❌ Unknown demo type: $DEMO. Use 'movies', 'books', or 'all'."
    exit 1
    ;;
esac

echo "✨ Deployment complete!"
