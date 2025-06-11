
# Autozon – Fullstack E-Commerce (Next.js)

Autozon is a fullstack e-commerce web application built using **Next.js** (App Router), styled with **TailwindCSS**, and equipped with a custom event logging system that captures frontend interactions and writes them to a database.

This version is fully Dockerized, allowing seamless setup and deployment with minimal local dependencies.

---
## Prerequisites

Ensure the following tools are installed:

* **Node.js v20+** (recommended: use [nvm](https://github.com/nvm-sh/nvm) for easy version management)
* **npm v9+** or **Yarn**
* **Git**
* **Unix-like shell** (macOS, Linux, or Windows with WSL)
* **Executable permissions** for shell scripts:

  ```bash
  chmod +x entrypoint.sh
  ```

- **VS Code** with [TailwindCSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- **Postman** or any HTTP client for API testing

---

## Run Using Docker with Database Support

Clone the repo and run Docker to start both the database and web server:

```bash
bash run_docker_with_db.sh
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/autoppia/autoppia_webs_demo.git
cd web_3_autozone
```

### 2. Build & Run with Docker

```bash
docker-compose down -v && docker-compose up --build
```

---


## Entrypoint Script – entrypoint.sh
This script is executed automatically when the container starts. It:
- **Removes old build artifacts (.next, package-lock.json)**
- **Installs dependencies via npm install**
- **Launches the Next.js dev server on port 8002**
