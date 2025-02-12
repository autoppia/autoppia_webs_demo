#!/bin/bash
# setup.sh

# Stop the script on first error
set -e

# Check and install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# Check and install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose not found. Installing Docker Compose..."
    sudo apt-get update
    sudo apt-get install -y docker-compose
fi

echo "=== Levantando Proyecto 1 (web_1_demo_django_jobs) ==="
cd web_1_demo_django_jobs
EXTERNAL_PORT=8001 INTERNAL_PORT=8001 docker-compose up -d --build

echo "=== Levantando Proyecto 2 (web_2_demo_angular_django_personal_management) ==="
cd ../web_2_demo_angular_django_personal_management
docker-compose up -d --build

echo "=== Listo: Ambos proyectos están en ejecución en segundo plano. ==="
