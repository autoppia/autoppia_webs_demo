#!/bin/sh
set -e

REPO_URL="https://github.com/autoppia/autoppia_iwa.git"
BRANCH_NAME="web-3-and-4-events"
TARGET_DIR="autoppia_iwa"
ENV_FILE=".env"
ENV_TEMPLATE=".env.template"
DOCKER_NETWORK="app-network"

log_message() {
  echo ">>> $1"
}

error_exit() {
  echo "!!! ERROR: $1" >&2
  exit 1
}

# --- Step 0: Create Docker network if not exists ---
if ! docker network ls | grep -q "$DOCKER_NETWORK"; then
  log_message "Creating Docker network '$DOCKER_NETWORK'..."
  docker network create "$DOCKER_NETWORK" || error_exit "Failed to create Docker network."
else
  log_message "Docker network '$DOCKER_NETWORK' already exists."
fi

# --- Step 1: Start root-level Docker containers ---
log_message "Starting root-level Docker containers..."
docker-compose up --build -d || error_exit "Failed to start root-level Docker containers."

# --- Step 2: Clone the repository if it doesn't exist ---
if [ -d "$TARGET_DIR" ]; then
  log_message "Directory '$TARGET_DIR' already exists. Skipping clone."
else
  log_message "Cloning branch '$BRANCH_NAME' from '$REPO_URL'..."
  git clone -b "$BRANCH_NAME" "$REPO_URL" || error_exit "Git clone failed."
fi

# --- Step 3: Navigate to the web server directory ---
cd "$TARGET_DIR/modules/webs_server/" || error_exit "Failed to enter 'modules/webs_server' directory."

# --- Step 4: Create .env if missing ---
if [ -f "$ENV_FILE" ]; then
  log_message "'$ENV_FILE' already exists. Skipping copy."
else
  if [ -f "$ENV_TEMPLATE" ]; then
    log_message "📄 Copying '$ENV_TEMPLATE' to '$ENV_FILE'..."
    cp "$ENV_TEMPLATE" "$ENV_FILE" || error_exit "Failed to copy .env file."
  else
    error_exit "'$ENV_TEMPLATE' not found."
  fi
fi

# --- Step 5: Start Docker containers in the web server directory ---
log_message "Starting Docker services in 'webs_server'..."
docker-compose up --build -d || error_exit "Failed to start Docker containers in 'webs_server'."

log_message "All services started successfully!"
