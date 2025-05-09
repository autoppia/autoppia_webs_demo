#!/bin/bash

# Load nvm if installed
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use Node.js v20
nvm install 20
nvm use 20

# Set registry
npm config set registry https://registry.npmjs.org/

# Clean installs
rm -rf node_modules package-lock.json
chmod -R u+x node_modules/.bin 2>/dev/null || true
npm cache clean --force

# Install and run
npm install && npm run dev
