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
├── web_1_demo_movies/
├── web_2_demo_books/
├── web_3_autozone/
├── web_4_autodining/
├── web_5_autocrm/
├── web_6_automail/
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

* 🌐 **Web Server Port** (`--web_port`) - Django or Next.js application
* 🗄️ **Database Port** (`--postgres_port`) - PostgreSQL database (if applicable)

### **Default Port Assignments**

| Demo            | Web Port | DB Port | Notes                                   |
|-----------------|----------|---------|-----------------------------------------|
| **Movies**      | 8000     | 5434    | Django + PostgreSQL                     |
| **Books**       | 8001     | 5435    | Django + PostgreSQL                     |
| **AutoZone**    | 8002     | —       | Next.js, no database required           |
| **AutoDining**  | 8003     | —       | Next.js, no database required           |
| **AutoCRM**     | 8004     | —       | Next.js, no database required           |
| **AutoMail**    | 8005     | —       | Next.js, no database required           |
| **webs_server** | 8090     | 5437    | API service used for event logging      |

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
./scripts/setup.sh --demo=movies --web_port=8000 --postgres_port=5435
```

#### **📚 Deploy Books Demo**

```bash
./scripts/setup.sh --demo=books --web_port=8001 --postgres_port=5436
```

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

> ⚠️ **Note:** Autozone and Autodining run **standalone Next.js** apps. The `--postgres_port` flag is ignored if provided.

---


#### **Custom Port Configuration**

```bash
# Custom ports for specific deployment
./scripts/setup.sh --demo=movies --web_port=9000 --postgres_port=6000
```

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

| Demo Application    | URL                     | Description                     |
|---------------------|-------------------------|---------------------------------|
| **Movies Demo**     | `http://localhost:8000` | Movie database interface        |
| **Books Demo**      | `http://localhost:8001` | Book catalog system             |
| **Autozone Demo**   | `http://localhost:8002` | Online Shopping for Electronics |
| **Autodining Demo** | `http://localhost:8003` | Restaurant Reservation UI       |
| **AutoCRM Demo**    | `http://localhost:8004` | Customer Relation Management UI |
| **AutoMail Demo**   | `http://localhost:8005` | Modern Email Client UI          |

---

### **Custom Port Access**

If you used custom ports, access via: `http://localhost:[your_web_port]`

---

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
