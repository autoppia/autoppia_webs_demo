# 🛍️ Autozon Demo – Fullstack E-Commerce UI (Next.js)

This is a fullstack e-commerce demo project built with **Next.js**, styled using **TailwindCSS**, and designed to capture rich frontend interaction **event logs** into a backend JSON file (`event-log.json`).  

It supports both frontend (UI) and backend (API routes) inside the same Next.js app.

---

## 🚀 Getting Started

Clone the repository and use the provided entry script to set up the project.

### 📦 Install & Run

Run the following in your terminal:

```bash
./entrypoint.sh

The entrypoint.sh script does the following:

Loads nvm and ensures Node.js v20 is installed and used.

Clears old installs and cache.

Installs dependencies.

Starts the dev server with npm run dev.

🧱 Tech Stack
Framework: Next.js 14

Styling: TailwindCSS

Backend: API Routes (Node.js within Next.js)

Event Logging: Custom logger writes to event-log.json

State Management: React Context API

Icons: Lucide

🔧 Prerequisites
Ensure the following are installed before running the project:

Node.js v20+ (managed via nvm recommended)

npm v9+ or yarn (used by entrypoint.sh)

Git (for cloning the repository)

Unix-like shell (e.g. macOS, Linux, or WSL on Windows) – required for entrypoint.sh

Permissions to execute shell scripts (chmod +x entrypoint.sh if needed)

Optional but useful:

VS Code with the TailwindCSS IntelliSense extension

Postman or any HTTP client for testing API routes