# Web Agents Subnet: Demo Webs

This repository contains a collection of demo web applications designed for testing and evaluating the **Bittensor Subnet 36** validators. Each web application serves as a **testing ground** for web interaction and **analysis capabilities**.

## Overview

The demo webs are containerized applications, each with its own Docker configuration. They are designed to run independently and serve as validation targets for the subnet's validators.

## Requirements

- Ubuntu/Debian-based system
- Docker and Docker Compose v2
- Minimum 8GB RAM recommended
- Minimum 20GB free disk space
- Processor: 2+ cores recommended

## Project Structure

Each web demo is contained in its own directory with a complete Docker setup:
```
demo-webs/
├── web_1_demo_django_jobs/
│   ├── docker-compose.yml
│   └── ...
├── web_2_demo_.../
│   ├── docker-compose.yml
│   └── ...
└── scripts/
    ├── install_docker.sh
    └── setup.sh
```

## Port Configuration

The demo webs are configured to run on consecutive ports, starting from the values you specify via CLI flags. Each demo uses two ports:

* One for the Django web server (`--web_port`)
* One for the PostgreSQL database (`--postgres_port`)

Defaults if not overridden:

* Movies demo: `8000` (web) and `5435` (db)
* Books demo: `8001` (web) and `5436` (db)

## Installation & Deployment

### 1. Install Docker

First, install Docker and Docker Compose:

```bash
chmod +x scripts/install_docker.sh
./scripts/install_docker.sh
```

### 2. Deploy Demo Webs

Use the setup script to deploy the desired demo(s). You can specify the type of demo with the `--demo` flag:

#### Deploy Movies Demo

```bash
./scripts/setup.sh --demo=movies --web_port=8000 --postgres_port=5435
```

#### Deploy Books Demo

```bash
./scripts/setup.sh --demo=books --web_port=8001 --postgres_port=5436
```

#### Deploy Both Demos (Movies + Books)

```bash
./scripts/setup.sh --demo=all
```

> When using `--demo=all`, the second demo's ports will automatically be offset.

### 3. Verify Installation

Verify that all containers are running:

```bash
docker ps
```

You should see each demo web listed with its respective port mapping.

## Accessing the Demo Webs

After deployment, the demo webs will be available at:
- Web 1: `http://localhost:8000`
- Web 2: `http://localhost:8001`
- etc...

## Troubleshooting

If you encounter any issues:

1. Check container status:
```bash
docker ps -a
```

2. View container logs:
```bash
docker logs <container_name>
```

3. Ensure all required ports are available and not in use by other services.

## Support

If you need assistance:
- Open an issue in this repository
- Contact the Subnet 36 team:
  - **@Daryxx** on Discord
  - **@Riiveer** on Discord
  - **@Miguelik** on Discord
