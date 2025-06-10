#!/bin/sh
# set -e

# --- Configuration Variables ---
NODE_VERSION="v20"
APP_NAME="autobtlab-app"
APP_PORT="5006"
APP_HOST="0.0.0.0"
PYTHON_APP_NAME="python-api"
PYTHON_APP_PORT="8000"
NVM_INSTALL_SCRIPT="https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh"


log_message() {
  echo ">>> $1"
}

error_exit() {
  echo "!!! ERROR: $1" >&2
  exit 1
}

# --- Pre-flight Checks ---

log_message "Starting Next.js application deployment..."

# Check for curl
if ! command -v curl >/dev/null 2>&1; then
  error_exit "curl is not installed. Please install it to proceed."
fi

# Check for npm
if ! command -v npm >/dev/null 2>&1; then
  error_exit "npm is not installed. This script requires npm."
fi

# --- NVM Installation and Setup ---

if [ ! -d "$HOME/.nvm" ]; then
  log_message "NVM not found. Installing NVM..."
  curl -o- "$NVM_INSTALL_SCRIPT" | bash || error_exit "Failed to install NVM."
else
  log_message "NVM already installed."
fi

# Load NVM (ensure this works in both login and non-login shells)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"

# Verify NVM loaded
if ! command -v nvm >/dev/null 2>&1; then
  error_exit "NVM failed to load. Check NVM installation."
fi

# Install and use the specified Node.js version
log_message "Installing and using Node.js $NODE_VERSION (latest patch version)..."
nvm install "$NODE_VERSION" || error_exit "Failed to install Node.js $NODE_VERSION."
nvm use "$NODE_VERSION" || error_exit "Failed to use Node.js $NODE_VERSION."
nvm alias default "$NODE_VERSION" || error_exit "Failed to set default Node.js version."

# Print Node and NPM versions for verification
log_message "Node.js version: $(node -v)"
log_message "NPM version: $(npm -v)"

# --- Application Preparation ---

# Clean build artifacts (but not node_modules)
log_message "Cleaning build artifacts..."
rm -rf .next out package-lock.json || log_message "No .next, out, or package-lock.json to remove." # Added 'out' for static exports

# Reinstall dependencies
log_message "Reinstalling Node.js dependencies..."
npm install || error_exit "Failed to install Node.js dependencies."

# Build the Next.js app for production (important!)
log_message "Building the Next.js application for production..."
npm run build || error_exit "Failed to build the Next.js application."

# --- PM2 Management ---

log_message "Checking for existing PM2 process '$APP_NAME'..."
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  log_message "Stopping and deleting existing PM2 process '$APP_NAME'..."
  pm2 stop "$APP_NAME" && pm2 delete "$APP_NAME" || log_message "Failed to stop/delete PM2 process, but continuing."
else
  log_message "No existing PM2 process '$APP_NAME' found."
fi

# Start the app using PM2
log_message "Starting the Next.js application with PM2 on port $APP_PORT..."
# Using 'npm run start' after 'npm run build' is the correct way for Next.js production.
pm2 start npm --name "$APP_NAME" -- run start -- -p "$APP_PORT" -H "$APP_HOST" || error_exit "Failed to start application with PM2."


# --- Python Application Setup and PM2 Management ---

log_message "Navigating to Python server directory..."
cd python_server || error_exit "Failed to change to python_server directory. Does 'python_server' exist?"

log_message "Ensuring python3-pip and python3-venv are installed..."
sudo apt update || error_exit "Failed to update apt packages."
sudo apt install -y python3-pip python3-venv || error_exit "Failed to install python3-pip or python3-venv. Please check your system's package manager."

log_message "Creating Python virtual environment..."
python3 -m venv venv || error_exit "Failed to create Python virtual environment."

# Define paths to venv executables
VENV_PYTHON="./venv/bin/python3"
VENV_PIP="./venv/bin/pip"
VENV_UVICORN="./venv/bin/uvicorn"

# Verify venv Python exists
if [ ! -f "$VENV_PYTHON" ]; then
  error_exit "Virtual environment Python executable not found at $VENV_PYTHON. Venv creation might have failed."
fi

"$VENV_PIP" install --upgrade pip || error_exit "Failed to upgrade pip in venv."

# Install requirements
if [ -f "requirements.txt" ]; then
  log_message "Installing Python dependencies from requirements.txt..."
  "$VENV_PIP" install -r requirements.txt || error_exit "Failed to install Python dependencies from requirements.txt."
else
  log_message "No requirements.txt found in python_server. Skipping Python dependency installation."
fi

# Check for existing PM2 process for Python app
log_message "Checking for existing PM2 process '$PYTHON_APP_NAME'..."
if pm2 describe "$PYTHON_APP_NAME" > /dev/null 2>&1; then
  log_message "Stopping and deleting existing PM2 process '$PYTHON_APP_NAME'..."
  pm2 stop "$PYTHON_APP_NAME" && pm2 delete "$PYTHON_APP_NAME" || log_message "Failed to stop/delete Python PM2 process, but continuing."
else
  log_message "No existing PM2 process '$PYTHON_APP_NAME' found."
fi

log_message "Starting the Python API with PM2 on port $PYTHON_APP_PORT..."
pm2 start "$VENV_PYTHON" --name "$PYTHON_APP_NAME" -- -m uvicorn app:app --port "$PYTHON_APP_PORT" --host "$APP_HOST" || error_exit "Failed to start Python API with PM2."
cd .. || error_exit "Failed to return to parent directory. Is 'python_server' still the current directory?"

# Save PM2 process list and enable startup on boot
log_message "Saving PM2 process list and enabling startup on boot..."
pm2 save || log_message "Failed to save PM2 process list. Manual save might be needed."

log_message "Deployment completed successfully. Application '$APP_NAME' should be running on http://$APP_HOST:$APP_PORT"
pm2 list
