#!/bin/sh

echo "Installing dependencies..."
npm install || exit 1

echo "Building app..."
npm run build || exit 1

echo "Starting app..."
npm start
