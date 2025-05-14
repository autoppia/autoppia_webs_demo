#!/bin/bash

# --- Load Node Version Manager (nvm) ---
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

# --- Ensure Node v20 is used ---
NODE_VERSION="20"
if ! nvm use ${NODE_VERSION} &> /dev/null; then
  nvm install ${NODE_VERSION}
  nvm use ${NODE_VERSION} &> /dev/null
fi

# --- Clean project dependencies and build artifacts ---
rm -rf node_modules package-lock.json .next

# --- Install project dependencies ---
npm install

# --- Run the development server ---
npm run dev
