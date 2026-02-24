#!/bin/bash

set -e

echo "Updating and Restarting Webs Demo..."

BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" == "HEAD" ]; then
  echo "⚠️ Detached HEAD detected! Switching to main branch..."
  git checkout main
fi

echo "Pulling latest changes from Git..."
git pull origin main || { echo "❌ Git pull failed!"; exit 1; }

echo "🛑 Stopping all running containers..."
RUNNING_CONTAINERS=$(sudo docker ps --format "{{.Names}}")

if [ -z "$RUNNING_CONTAINERS" ]; then
  echo "⚠️ No running containers found!"
else
  for container in $RUNNING_CONTAINERS; do
    echo "🛑 Stopping $container..."
    sudo docker stop "$container"
  done
fi

echo "🧹 Removing previous Webs Demo containers..."
DEMO_PREFIXES=(
  "webs_server"
  "autocinema"
  "autobooks"
  "autozone"
  "autodining"
  "autocrm"
  "automail"
  "autodelivery"
  "autolodge"
  "autoconnect"
  "autowork"
  "autocalendar"
  "autolist"
  "autodrive"
  "autohealth"
)

DEMO_CONTAINERS=$(sudo docker ps -a --format "{{.Names}}" | grep -E "^(webs_server|autocinema|autobooks|autozone|autodining|autocrm|automail|autodelivery|autolodge|autoconnect|autowork|autocalendar|autolist|autodrive|autohealth)($|_)" || true)

if [[ -n "$DEMO_CONTAINERS" ]]; then
  for container in $DEMO_CONTAINERS; do
    echo "🗑️ Removing $container..."
    sudo docker rm -f "$container"
  done
else
  echo "ℹ️ No Webs Demo containers found to remove."
fi

echo "🧹 Removing previous Webs Demo volumes..."
DEMO_VOLUMES=$(sudo docker volume ls --format "{{.Name}}" | grep -E "^(webs_server|autocinema|autobooks|autozone|autodining|autocrm|automail|autodelivery|autolodge|autoconnect|autowork|autocalendar|autolist|autodrive|autohealth)($|_)" || true)
if [[ -n "$DEMO_VOLUMES" ]]; then
  for volume in $DEMO_VOLUMES; do
    echo "🗑️ Removing volume $volume..."
    sudo docker volume rm "$volume" || true
  done
else
  echo "ℹ️ No Webs Demo volumes found to remove."
fi

echo "🧹 Removing previous Webs Demo images..."
DEMO_IMAGES=$(sudo docker images --format "{{.Repository}} {{.ID}}" | grep -E "^(webs_server|autocinema|autobooks|autozone|autodining|autocrm|automail|autodelivery|autolodge|autoconnect|autowork|autocalendar|autolist|autodrive|autohealth)\\b" | awk '{print $2}' || true)
if [[ -n "$DEMO_IMAGES" ]]; then
  for image in $DEMO_IMAGES; do
    echo "🗑️ Removing image $image..."
    sudo docker rmi -f "$image" || true
  done
else
  echo "ℹ️ No Webs Demo images found to remove."
fi

echo "✅ Webs Demo containers, volumes, and images cleared. You can run setup to start the stack."
