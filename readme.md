# 🌐 Web Agents Subnet: Demo Webs

This repository contains a collection of demo web applications designed for testing and evaluating the **Bittensor Subnet 36** validators. Each web application serves as a **testing ground** for web interaction and **analysis capabilities**.

---

## 📋 Overview

The demo webs are **containerized applications**, each with its own Docker configuration. They are designed to run independently and serve as **validation targets** for the subnet's validators.

### **Key Features**

- 🐳 **Fully containerized** with Docker
- 🎯 **Independent deployment** capabilities
- 🔧 **Configurable ports** for flexible setup
- 🧪 **Testing environments** for web agents

---

## 💻 System Requirements

| Component     | Requirement                | Recommended   |
| ------------- | -------------------------- | ------------- |
| **OS**        | Ubuntu/Debian-based system | Ubuntu 22.04+ |
| **Container** | Docker + Docker Compose v2 | Latest stable |
| **Memory**    | 8GB RAM minimum            | 16GB+         |
| **Storage**   | 20GB free disk space       | 50GB+         |
| **CPU**       | 2+ cores                   | 4+ cores      |

---

## 📁 Project Structure

```
demo-webs/
├── web_1_autocinema/
├── web_2_autobooks/
├── web_3_autozone/
├── web_4_autodining/
├── web_5_autocrm/
├── web_6_automail/
├── web_7_autodelivery/
├── web_8_autolodge/
├── web_9_autoconnect/
├── web_10_autowork/
├── web_11_autocalendar/
├── web_12_autolist/
├── web_13_autodrive/
├── web_14_autohealth/
├── web_16_autodiscord/
├── webs_server/
└── scripts/
    ├── install_docker.sh
    ├── setup.sh
    └── restart_webs_demo.sh
```

---

## 🔌 Port Configuration

The demo webs run on **consecutive ports**, starting from values you specify via CLI flags. Each demo uses **two ports**:

### **Port Structure**

- 🌐 **Web Server Port** (`--web_port`) - Django or Next.js application
- 🗄️ **Database Port** (`--postgres_port`) - PostgreSQL database (if applicable)

### **Default Port Assignments**

| Demo | Web Port | DB Port | Notes |
|------------------|----------| ------- | ---------------------------------- |
| **Movies (Autocinema)** | 8000 | — | Next.js + webs_server dataset |
| **Books (Autobooks)** | 8001 | — | Next.js + webs_server dataset |
| **AutoZone** | 8002 | — | Next.js, no database required |
| **AutoDining** | 8003 | — | Next.js, no database required |
| **AutoCRM** | 8004 | — | Next.js, no database required |
| **AutoMail** | 8005 | — | Next.js, no database required |
| **AutoDelivery** | 8006 | — | Next.js, no database required |
| **AutoLodge** | 8007 | — | Next.js, no database required |
| **AutoConnect** | 8008 | — | Next.js, no database required |
| **AutoWork** | 8009 | — | Next.js, no database required |
| **AutoCalendar** | 8010 | — | Next.js, no database required |
| **AutoList** | 8011 | — | Next.js, no database required |
| **AutoDrive** | 8012 | — | Next.js, no database required |
| **AutoHealth** | 8013 | — | Next.js, no database required |
| **AutoDiscord** | 8015 | — | Next.js, Discord-like chat (mocked) |
| **webs_server** | 8090 | 5437 | API service used for event logging |


---

## 🚀 Installation & Deployment

### **Step 1: Install Docker**

Install Docker and Docker Compose:

```bash
chmod +x scripts/install_docker.sh
./scripts/install_docker.sh
```

**What this script does:**

- ✅ Installs Docker Engine
- ✅ Installs Docker Compose v2
- ✅ Sets up user permissions
- ✅ Starts Docker service

### **Step 2: Deploy Demo Webs**

Use the setup script with flexible deployment options:

#### **Make setup.sh executable**

```bash
chmod +x ./scripts/setup.sh
```

#### **🎯 Deploy All Demos** (Recommended)

```bash
./scripts/setup.sh --demo=all
```

> 💡 **Note**: When using `--demo=all`, the system automatically assigns ports to prevent conflicts.

#### **🎬 Deploy Movies Demo**

```bash
./scripts/setup.sh --demo=movies --web_port=8000
```

This starts `web_1_autocinema` (Next.js) and automatically brings up `webs_server` so the `/datasets/load` endpoint is available.

#### **📚 Deploy Books Demo**

```bash
./scripts/setup.sh --demo=books --web_port=8001
```

The command launches `web_2_autobooks` and the shared `webs_server` instance, mirroring the original Django data experience without the local Postgres container.

#### **📦 Deploy AutoZone Demo**

```bash
./scripts/setup.sh --demo=autozone --web_port=8002
```

#### **📦 Deploy AutoDining Demo**

```bash
./scripts/setup.sh --demo=autodining --web_port=8003
```

#### **📦 Deploy AutoCRM Demo**

```bash
./scripts/setup.sh --demo=autocrm --web_port=8004
```

#### **📦 Deploy AutoMail Demo**

```bash
./scripts/setup.sh --demo=automail --web_port=8005
```

#### **📦 Deploy AutoDelivery Demo**

```bash
./scripts/setup.sh --demo=autodelivery --web_port=8006
```

#### **📦 Deploy AutoLodge Demo**

```bash
./scripts/setup.sh --demo=autolodge --web_port=8007
```

#### **📦 Deploy AutoDrive Demo**

```bash
./scripts/setup.sh --demo=autodrive --web_port=8012
```

#### **📦 Deploy AutoConnect Demo**

```bash
./scripts/setup.sh --demo=autoconnect --web_port=8008
```

#### **📦 Deploy AutoWork Demo**

```bash
./scripts/setup.sh --demo=autowork --web_port=8009
```

#### **📦 Deploy AutoCalendar Demo**

```bash
./scripts/setup.sh --demo=autocalendar --web_port=8010
```

#### **📦 Deploy AutoList Demo**

```bash
./scripts/setup.sh --demo=autolist --web_port=8011
```

#### **📦 Deploy AutoDrive Demo**

```bash
./scripts/setup.sh --demo=autodrive --web_port=8012
```

#### **📦 Deploy AutoHealth Demo**

```bash
./scripts/setup.sh --demo=autohealth --web_port=8013
```

#### **💬 Deploy AutoDiscord Demo**

```bash
./scripts/setup.sh --demo=autodiscord --web_port=8015
```

Starts `web_16_autodiscord` (Discord-like chat UI) and the shared `webs_server` for dataset API.

#### **🎨 Dynamic Features (Enabled by Default)**

All demo webs support dynamic features for anti-scraping protection. **By default, v1 and v3 are enabled**, which provides:

- 🔀 **Layout variants** based on URL seed parameter (1-300) - v1
- 🎯 **Dynamic HTML structure** changes (classes, IDs) - v3
- 🆔 **Seed preservation** across navigation - v1
- 🎨 **CSS variables** for layout variations - v1
- 🔒 **Anti-fingerprinting** protection - v3

**Testing different layouts:**
```
http://localhost:8005/?seed=1    # Layout variant 1
http://localhost:8005/?seed=180  # Layout variant 10
http://localhost:8005/?seed=200  # Different HTML structure
```

**To customize dynamic features:**
```bash
# Use default (v1,v3 enabled)
./scripts/setup.sh --demo=automail

# Enable only v1 (seeds + layouts, no HTML structure changes)
./scripts/setup.sh --demo=automail --enabled_dynamic_versions=v1

# Enable all versions
./scripts/setup.sh --demo=automail --enabled_dynamic_versions=v1,v2,v3,v4

# Disable all dynamic features
./scripts/setup.sh --demo=automail --enabled_dynamic_versions=""
```

See the [Dynamic Versions](#dynamic-versions-shorthand) section below for detailed information.

> ⚠️ **Note:** Autozone and Autodining run **standalone Next.js** apps. The `--postgres_port` flag is ignored if provided.

---


#### **Available Setup Options**

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--demo=NAME` | Deploy specific demo or all | `all` | `--demo=automail` |
| `--web_port=PORT` | Base web server port | `8000` | `--web_port=9000` |
| `--postgres_port=PORT` | Base PostgreSQL port | `5434` | `--postgres_port=6000` |
| `--webs_port=PORT` | webs_server API port | `8090` | `--webs_port=8080` |
| `--webs_postgres=PORT` | webs_server DB port | `5437` | `--webs_postgres=5440` |
| `--enable_db_mode=BOOL` | Enable DB-backed mode for v2 (loads data from DB via ?v2-seed=X) | `false` | `--enable_db_mode=true` |
| `--enabled_dynamic_versions=[v1,v2,...]` | Enable one or more dynamic "versions" (see below) — accepts `v1,v2` or `[v1,v2]` formats | `v1,v3` | `--enabled_dynamic_versions=v1,v3` or `--enabled_dynamic_versions=[v1,v2]` |
| `--seed_value=INT` | Optional integer seed used by data generation / seed-based HTML features | `` | `--seed_value=42` |
| `--fast=BOOL` | Skip global Docker cleanup and use cached builds (true/false) | `false` | `--fast=true` |
| `-y, --yes` | Skip confirmation prompts / force Docker cleanup (convenience flag) | - | `-y` |
| `-h, --help` | Show help and exit | - | `-h` |

**Valid demo names:** `movies`, `books`, `autozone`, `autodining`, `autocrm`, `automail`, `autoconnect`, `autodelivery`, `autolodge`, `autowork`, `autocalendar`, `autolist`, `autodrive`, `autohealth`, `autodiscord`, `all`

---

### Dynamic versions (shorthand)

The `--enabled_dynamic_versions` flag provides a shorthand to enable multiple dynamic features at once. **By default, `v1,v3` are enabled** (seeds + layout variants + HTML structure changes).

Accepted formats:
- Comma-separated: `--enabled_dynamic_versions=v1,v2`
- Bracketed: `--enabled_dynamic_versions=[v1,v2]`

#### Version Details

| Version | Feature | What It Does | Dependencies |
|---------|---------|--------------|--------------|
| **v1** | Seeds + Layout Variants | ✅ Preserves seed values in URLs (e.g., `?seed=123`)<br>✅ Enables layout variants based on seed (1-300)<br>✅ Maps seeds to 10 distinct layout variants<br>❌ **If disabled:** Seeds are not preserved, layouts stay fixed | Independent - works alone or with others |
| **v2** | DB Mode | ✅ Loads pre-generated data from database via `?v2-seed=X` URL parameter<br>✅ Uses data from `data/` directory (more records)<br>❌ **If disabled:** Uses data from `original/` directory (high quality, fewer records) | Independent - works alone or with others |
| **v3** | HTML Structure Changes | ✅ Changes CSS classes, IDs, and HTML structure dynamically<br>✅ Anti-fingerprinting protection<br>✅ Modifies DOM structure based on seed<br>❌ **If disabled:** HTML structure stays static | Independent - works alone or with others |
| **v4** | Seed HTML | ✅ Enables seed-based HTML variations | Independent - works alone or with others |

#### How Versions Work Together

- **Versions are independent**: Each version can work alone or in combination with others
- **No dependencies**: v1, v2, v3, and v4 are completely independent
- **Default behavior**: With `v1,v3` enabled by default:
  - Seeds are preserved in URLs (`?seed=X`)
  - Layout variants change based on seed
  - HTML structure (classes, IDs) changes dynamically
  - Data is loaded from `original/` directory (v2 disabled)

#### Data Loading Behavior

**When v2 is DISABLED (default):**
- ✅ Data is copied from `original/` directory (high quality, fewer records)
- ✅ Data comes from `webs_server/initial_data/<project>/original/`
- ✅ Used for standard operation without DB mode

**When v2 is ENABLED:**
- ✅ Data is loaded from `data/` directory (more records)
- ✅ Data comes from `webs_server/initial_data/<project>/data/`
- ✅ Supports `?v2-seed=X` URL parameter for dynamic data selection
- ✅ Requires database connection to webs_server

#### Example Usages

**Default deployment (v1,v3 enabled):**
```bash
./scripts/setup.sh --demo=automail
# Seeds preserved, layout variants active, HTML structure changes active
# Data loaded from original/ directory
```

**Enable only v1 (seeds + layouts):**
```bash
./scripts/setup.sh --demo=automail --enabled_dynamic_versions=v1
# Seeds preserved, layout variants active
# HTML structure stays static (v3 disabled)
```

**Enable v1 + v2 (seeds + layouts + DB mode):**
```bash
./scripts/setup.sh --demo=automail --enabled_dynamic_versions=v1,v2
# Seeds preserved, layout variants active
# Data loaded from data/ directory (DB mode)
# Supports ?v2-seed=X URL parameter
```

**Enable all versions:**
```bash
./scripts/setup.sh --demo=automail --enabled_dynamic_versions=v1,v2,v3,v4
# All dynamic features enabled
```

**Disable all dynamic features:**
```bash
./scripts/setup.sh --demo=automail --enabled_dynamic_versions=""
# All versions disabled - static behavior
```

#### Notes

- **Default:** `v1,v3` are enabled by default (seeds + HTML structure changes)
- **Data storage:** If you enable `v2`, ensure `~/webs_data` exists and is writable
- **Flag normalization:** The script accepts `true/false`, `yes/no`, `1/0`, `y/n`
- **Fast mode:** Use `--fast=true` to skip Docker cleanup and reuse cached builds

📦 **Data generation storage (v2):** If you enable `v2` (DB mode), the webs-server mounts `~/webs_data` to `/app/data` to store generated datasets. Create it if missing:
```bash
mkdir -p ~/webs_data
```
Generated files will appear under `~/webs_data/<project_key>/data/...`.

---

### **Step 3: Verify Installation**

Check that all containers are running successfully:

```bash
docker ps
```

**Expected output:**

- ✅ Each demo web container running
- ✅ PostgreSQL database containers active
- ✅ Correct port mappings displayed

---

## 🌐 Accessing Demo Webs

After successful deployment, access your demo webs:

### **Default Access URLs**

| Demo Application    | URL                     | Description                       |
| ------------------- | ----------------------- | --------------------------------- |
| **Movies Demo**     | `http://localhost:8000` | Movie database interface          |
| **Books Demo**      | `http://localhost:8001` | Book catalog system               |
| **Autozone Demo**   | `http://localhost:8002` | Online Shopping for Electronics   |
| **Autodining Demo** | `http://localhost:8003` | Restaurant Reservation UI         |
| **AutoCRM Demo**    | `http://localhost:8004` | Customer Relation Management UI   |
| **AutoMail Demo**   | `http://localhost:8005` | Modern Email Client UI            |
| **AutoLodge Demo**  | `http://localhost:8007` | Book Hotels, Cabins & Retreats UI |
| **AutoDrive Demo**  | `http://localhost:8012` | Go anywhere with AutoDriver UI    |

---

### **Custom Port Access**

If you used custom ports, access via: `http://localhost:[your_web_port]`

---

## Accessing the Demo Webs

### Local Access

After deployment, access the demo webs locally at:

- Web 1 (Movies): `http://localhost:8000`
- Web 2 (Books): `http://localhost:8001`
- Web 3 (Autozone): `http://localhost:8002`
- Web 4 (Autodining): `http://localhost:8003`
- Web 5 (Autocrm): `http://localhost:8004`
- Web 6 (Automail): `http://localhost:8005`
- Web 7 (Autodelivery): `http://localhost:8006`
- Web 8 (Autolodge): `http://localhost:8007`
- Web 9 (Autoconnect): `http://localhost:8008`
- Web 10 (Autowork): `http://localhost:8009`
- Web 11 (Autocalendar): `http://localhost:8010`
- Web 12 (Autolist): `http://localhost:8011`
- Web 13 (Autodrive): `http://localhost:8012`
- Web 14 (Autohealth): `http://localhost:8013`
- Web 16 (AutoDiscord): `http://localhost:8015`

### Server Access

Publicly deployed demo webs:

- Autocinema: `https://autocinema.autoppia.com`
- Autobooks: `https://autobooks.autoppia.com`
- Autozone: `https://autozone.autoppia.com`
- Autodining: `https://autodining.autoppia.com`
- Autocrm: `https://autocrm.autoppia.com`
- Automail: `https://automail.autoppia.com`
- Autodelivery: `https://autodelivery.autoppia.com`
- Autolodge: `https://autolodge.autoppia.com`
- Autoconnect: `https://autoconnect.autoppia.com`
- Autowork: `https://autowork.autoppia.com`
- Autocalendar: `https://autocalendar.autoppia.com`
- Autolist: `https://autolist.autoppia.com`
- Autodrive: `https://autodrive.autoppia.com`
- Autohealth: `https://autohealth.autoppia.com`

## 🔧 Management Commands

### **Container Status**

```bash
# View all running containers
docker ps

# View all containers (including stopped)
docker ps -a
```

### **Logs and Debugging**

```bash
# View logs for specific container
docker logs <container_name>

# Follow logs in real-time
docker logs -f <container_name>
```

### **Container Management**

```bash
# Stop all demo containers
docker-compose down

# Restart containers
docker-compose restart

# Restart all demo webs using script
./scripts/restart_webs_demo.sh

# Remove containers and volumes
docker-compose down -v
```

---

## 🔍 Troubleshooting

### **Common Issues & Solutions**

| Issue                         | Cause                      | Solution                                                    |
| ----------------------------- | -------------------------- | ----------------------------------------------------------- |
| **Port conflicts**            | Port already in use        | Use different ports with `--web_port` and `--postgres_port` |
| **Container won't start**     | Docker service not running | Run `sudo systemctl start docker`                           |
| **Database connection error** | PostgreSQL not ready       | Wait 30 seconds and retry                                   |
| **Permission denied**         | User not in docker group   | Run `sudo usermod -aG docker $USER` and logout/login        |

### **Diagnostic Commands**

```bash
# Check Docker service status
sudo systemctl status docker

# Check available ports
netstat -tulpn | grep LISTEN

# Check Docker disk usage
docker system df

# Clean up unused containers/images
docker system prune
```

### **Port Availability Check**

```bash
# Check if port is available
lsof -i :8000
```

---

## 📊 Performance Monitoring

### **Resource Usage**

```bash
# Monitor container resource usage
docker stats

# Check system resources
htop
```

### **Health Checks**

```bash
# Test web application response
curl http://localhost:8000

# Check database connectivity
docker exec -it <postgres_container> psql -U postgres
```

---

## 🆘 Support & Contact

Need assistance with demo webs setup?

### **Contact Information**

- **@Daryxx** on Discord
- **@Riiveer** on Discord

### **Getting Help**

1. 📖 Check this documentation first
2. 🔍 Review container logs for errors
3. 💬 Contact support with specific error messages
4. 📝 Include system specs and Docker version
