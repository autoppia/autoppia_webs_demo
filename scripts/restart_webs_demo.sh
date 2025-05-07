#!/bin/bash

set -e

echo "Updating and Restarting All Running Containers..."

BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" == "HEAD" ]; then
  echo "⚠️ Detached HEAD detected! Switching to main branch..."
  git checkout main
fi

echo "Pulling latest changes from Git..."
git pull origin main || { echo "❌ Git pull failed!"; exit 1; }

RUNNING_CONTAINERS=$(sudo docker ps --format "{{.Names}}")

if [ -z "$RUNNING_CONTAINERS" ]; then
  echo "⚠️ No running containers found!"
  exit 1
fi

echo "♻️ Restarting containers..."
for container in $RUNNING_CONTAINERS; do
  echo "🔄 Restarting $container..."
  sudo docker restart "$container"
done

echo "✅ All running containers have been restarted!"
