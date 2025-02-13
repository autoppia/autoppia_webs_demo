#!/bin/bash
# Docker Installation and Project Deployment Script
# ----------------------------------------------
# This script automates:
# - Docker installation
# - Docker Compose v2 setup
# - User Docker group configuration
# - Project deployment

# Halt script on any error
set -e

# --------------------------------------------------
# 1. Install Docker if not already present
# --------------------------------------------------
install_docker() {
    if ! command -v docker &> /dev/null; then
        echo "🔧 Installing Docker..."
        sudo apt-get update -y
        sudo apt-get install -y docker.io
        sudo systemctl enable docker
        sudo systemctl start docker
    else
        echo "✅ Docker is already installed."
    fi
}

# --------------------------------------------------
# 2. Configure Docker user permissions
# --------------------------------------------------
configure_docker_permissions() {
    if ! groups "$USER" | grep -q "docker"; then
        echo "🔒 Adding user to Docker group..."
        sudo usermod -aG docker "$USER"
        echo "⚠️ Please log out and log back in or run: newgrp docker"
    else
        echo "✅ User already has Docker group permissions."
    fi
}

# --------------------------------------------------
# 3. Remove Docker Compose v1 if present
# --------------------------------------------------
remove_docker_compose_v1() {
    if command -v docker-compose &> /dev/null; then
        echo "🗑️ Removing Docker Compose v1..."
        sudo apt-get remove -y docker-compose
    else
        echo "✅ Docker Compose v1 already removed."
    fi
}

# --------------------------------------------------
# 4. Install Docker Compose v2
# --------------------------------------------------
install_docker_compose_v2() {
    sudo apt-get update -y
    sudo apt-get install -y docker-compose-plugin

    echo "🔍 Installed Docker Compose version:"
    docker compose version || true
}

# --------------------------------------------------
# 5. Deploy Project
# --------------------------------------------------
deploy_project() {
    local project_dir="$1"
    cd "$project_dir" || exit

    echo "🚀 Deploying project in: $project_dir"
    sudo docker compose up -d --build
}

# --------------------------------------------------
# Main Execution
# --------------------------------------------------
main() {
    install_docker
    configure_docker_permissions
    remove_docker_compose_v1
    install_docker_compose_v2

    # Ensure Docker service is running
    sudo systemctl enable docker
    sudo systemctl start docker

    # Deploy specific project (modify path as needed)
    deploy_project "web_1_demo_django_jobs"

    echo "✨ Deployment complete! Project is running in the background."
}

# Run the main function
main