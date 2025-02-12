#!/bin/bash
# setup.sh
# -----------------------------------------
# Installs Docker (if not already installed), removes Docker Compose v1,
# and installs Docker Compose v2 (docker-compose-plugin).
# Finally, it starts the projects using Docker Compose v2.

set -e  # Stop the script if an error occurs

echo "=== 1. Checking and installing Docker if not present ==="
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing..."
    sudo apt-get update -y
    sudo apt-get install -y docker.io
    sudo systemctl enable docker
    sudo systemctl start docker
else
    echo "Docker is already installed."
fi

echo "=== 2. Removing Docker Compose v1 (if present) ==="
if command -v docker-compose &> /dev/null; then
    echo "Found docker-compose v1. Removing..."
    sudo apt-get remove -y docker-compose
else
    echo "docker-compose v1 is not installed or has already been removed."
fi

echo "=== 3. Installing Docker Compose v2 (docker-compose-plugin) ==="
sudo apt-get update -y
sudo apt-get install -y docker-compose-plugin

# Verify the installed version of Docker Compose v2
echo "Installed Docker Compose version:"
docker compose version || true

# Ensure Docker is running and enabled at startup
sudo systemctl enable docker
sudo systemctl start docker

echo "=== 4. Starting Project 1 (web_1_demo_django_jobs) with Docker Compose v2 ==="
cd web_1_demo_django_jobs
docker compose up -d --build

# echo "=== 5. Starting Project 2 (web_2_demo_angular_django_personal_management) with Docker Compose v2 ==="
# cd ../web_2_demo_angular_django_personal_management
# docker compose up -d --build

echo "=== Done: Both projects are running in the background with Docker Compose v2. ==="
