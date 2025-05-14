
# Autozon – Fullstack E-Commerce UI (Next.js)

This is a fullstack e-commerce website built with **Next.js**, styled using **TailwindCSS**, and designed to capture frontend interaction event logs into a backend JSON file (`event-log.json`).  

The app integrates both frontend UI and backend API routes within a single Next.js application.

---

## Getting Started

Clone the repository and use the provided entry script to set up and run the project.

### Installation & Run

In your terminal:

```bash
./entrypoint.sh
```

## What `entrypoint.sh` Does

The `entrypoint.sh` script performs the following:

- Loads `nvm` and ensures **Node.js v20** is installed
- Clears previous installations and cache
- Installs project dependencies
- Starts the development server using `npm run dev`

---
## Event-log.json
- All the events will be stored in the file which is named as event-log.json

## Prerequisites

Ensure the following tools are installed:

- **Node.js v20+** (use [nvm](https://github.com/nvm-sh/nvm) for version management)
- **npm v9+** or **yarn**
- **Git**
- **Unix-like shell** (macOS, Linux, or WSL on Windows)
- **Permission** to execute scripts (`chmod +x entrypoint.sh`)

**Optional but recommended:**

- **VS Code** with [TailwindCSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- **Postman** or any HTTP client for API testing

---

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: TailwindCSS
- **Backend**: Node.js API Routes in Next.js
- **Event Logging**: Writes interaction events to `event-log.json`
- **State Management**: React Context API
- **Icons**: Lucide
