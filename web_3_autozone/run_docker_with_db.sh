#!/bin/sh
set -e

REPO_URL="https://github.com/autoppia/autoppia_iwa.git"
BRANCH_NAME="web-3-and-4-events"
TARGET_DIR="autoppia_iwa"

log_message() {
  echo ">>> $1"
}

error_exit() {
  echo "!!! ERROR: $1" >&2
  exit 1
}

# --- Step 1: Start root-level Docker containers ---
log_message "Starting root-level Docker containers..."
docker-compose up --build -d || error_exit "Failed to start root-level Docker containers."

# --- Step 2: Clone the repository if it doesn't exist ---
if [ -d "$TARGET_DIR" ]; then
  log_message "Directory '$TARGET_DIR' already exists. Skipping clone."
  git -C $TARGET_DIR checkout $BRANCH_NAME
else
  log_message "Cloning branch '$BRANCH_NAME' from '$REPO_URL'..."
  git clone -b "$BRANCH_NAME" "$REPO_URL" || error_exit "Git clone failed."
fi

# --- Step 3: Navigate to the web server directory ---
cd "$TARGET_DIR/modules/webs_server/" || error_exit "Failed to enter 'modules/webs_server' directory."

# --- Step 4: Start Docker containers in the web server directory ---
docker-compose up --build -d || error_exit "Failed to start Docker containers in 'webs_server'."

log_message "All services started successfully!"
