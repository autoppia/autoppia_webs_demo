#!/bin/bash

# Load nvm if installed
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node 20
nvm use 20 || { nvm install 20 && nvm use 20; }

# Clean and install
rm -rf node_modules package-lock.json .next
npm cache clean --force

# Install and run
npm install && npm run dev
