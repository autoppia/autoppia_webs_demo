#!/bin/bash

# Ensure secure npm registry
npm config set registry https://registry.npmjs.org/

# Clean previous installs
rm -rf node_modules package-lock.json

# Fix permissions just in case
chmod -R u+x node_modules/.bin 2>/dev/null || true

# Clean npm cache
npm cache clean --force

# Install & run
npm install && npm run dev
