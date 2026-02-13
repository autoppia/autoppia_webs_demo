#!/bin/sh
set -e

# Clean build artifacts (but not node_modules)
rm -rf package-lock.json .next

# Reinstall (or verify) dependencies
npm install

# Run the dev server
npm run dev -- -p 8004
