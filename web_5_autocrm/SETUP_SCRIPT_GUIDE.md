# Setup Script Guide - Dynamic HTML Structure

## Overview

The `scripts/setup.sh` script now supports enabling/disabling the Dynamic HTML Structure system via the `--enable_dynamic_html` parameter. This allows you to control whether the dynamic structure is active when deploying with Docker.

---

## Usage

### Basic Deployment

Deploy web_5_autocrm with default settings (dynamic structure **enabled**):

```bash
bash scripts/setup.sh --demo=autocrm --web_port=8004
```

### Enable Dynamic Structure (Explicit)

```bash
bash scripts/setup.sh --demo=autocrm --web_port=8004 --enable_dynamic_html=true
```

### Disable Dynamic Structure

```bash
bash scripts/setup.sh --demo=autocrm --web_port=8004 --enable_dynamic_html=false
```

---

## Parameters

### --demo=autocrm

Specifies which demo to deploy. Use `autocrm` for web_5_autocrm.

**Options:**
- `movies` - Deploy web_1_demo_movies
- `books` - Deploy web_2_demo_books
- `autozone` - Deploy web_3_autozone
- `autodining` - Deploy web_4_autodining
- `autocrm` - Deploy web_5_autocrm
- `automail` - Deploy web_6_automail
- `autodelivery` - Deploy web_7_autodelivery
- `autolodge` - Deploy web_8_autolodge
- `autoconnect` - Deploy web_9_autoconnect
- `autowork` - Deploy web_10_autowork
- `all` - Deploy all demos

### --web_port=PORT

Port for the web application.

**Default:** `8000`  
**Example:** `--web_port=8004`

### --enable_dynamic_html=VALUE

Enable or disable Dynamic HTML (legacy parameter, kept for compatibility).

**Values:**
- `true` - Enable (default)
- `false` - Disable

**Default:** `true`

### --dynamic_html_structure=VALUE

Enable or disable Dynamic HTML Structure system (recommended parameter).

**Values:**
- `true` - Enable dynamic structure (default)
- `false` - Disable dynamic structure

**Default:** `true`

**Note:** This is the primary parameter for controlling the Dynamic HTML Structure system in web_5_autocrm.

---

## Examples

### Example 1: Deploy with Dynamic Structure Enabled

```bash
bash scripts/setup.sh \
  --demo=autocrm \
  --web_port=8004 \
  --dynamic_html_structure=true
```

**Result:**
- Application runs on `http://localhost:8004`
- Visit `http://localhost:8004/?seed-structure=1` → Shows "Dashboard", "Clients"
- Visit `http://localhost:8004/?seed-structure=2` → Shows "Control Panel", "Customer Base"
- Seed-structure parameter changes content

### Example 2: Deploy with Dynamic Structure Disabled

```bash
bash scripts/setup.sh \
  --demo=autocrm \
  --web_port=8004 \
  --dynamic_html_structure=false
```

**Result:**
- Application runs on `http://localhost:8004`
- Visit `http://localhost:8004/?seed-structure=1` → Shows "Dashboard", "Clients"
- Visit `http://localhost:8004/?seed-structure=2` → Shows "Dashboard", "Clients" (same)
- Seed-structure parameter is ignored

### Example 3: Deploy All Demos with Dynamic Structure

```bash
bash scripts/setup.sh \
  --demo=all \
  --web_port=8000 \
  --dynamic_html_structure=true
```

**Result:**
- All demos deployed with dynamic structure enabled
- web_5_autocrm on port 8004
- Dynamic structure active for all applicable demos

---

## How It Works

### Environment Variable Flow

```
scripts/setup.sh
    ↓
--dynamic_html_structure=true
    ↓
DYNAMIC_HTML_STRUCTURE=true
    ↓
docker-compose.yml
    ↓
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true
    ↓
Dockerfile (build args)
    ↓
Next.js build with env variable
    ↓
DynamicStructureContext reads env variable
    ↓
Dynamic structure enabled/disabled
```

**Legacy parameter flow:**
```
--enable_dynamic_html=true → ENABLE_DYNAMIC_HTML=true
(kept for backward compatibility with other demos)
```

### Files Involved

1. **scripts/setup.sh**
   - Parses `--dynamic_html_structure` parameter (primary)
   - Parses `--enable_dynamic_html` parameter (legacy)
   - Sets `DYNAMIC_HTML_STRUCTURE` environment variable
   - Sets `ENABLE_DYNAMIC_HTML` environment variable
   - Passes both to docker-compose

2. **docker-compose.yml**
   - Receives `DYNAMIC_HTML_STRUCTURE` from setup script
   - Maps to `NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE`
   - Passes to Dockerfile and runtime

3. **Dockerfile**
   - Accepts `ENABLE_DYNAMIC_STRUCTURE` build argument
   - Sets during build time
   - Bakes into Next.js build

4. **DynamicStructureContext.tsx**
   - Reads `NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE`
   - Enables/disables dynamic structure logic

---

## Verification

### Check if Dynamic Structure is Enabled

After deployment, verify the setting:

```bash
# Check container environment variables
docker exec autocrm_8004-web-1 printenv | grep DYNAMIC

# Expected output when enabled:
# NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true
# ENABLE_DYNAMIC_HTML=true
```

### Visual Verification

1. **Deploy with enabled:**
   ```bash
   bash scripts/setup.sh --demo=autocrm --web_port=8004 --enable_dynamic_html=true
   ```

2. **Test URLs:**
   - Visit `http://localhost:8004/?seed-structure=1`
   - Note the text: Should show "Dashboard", "Clients"
   - Visit `http://localhost:8004/?seed-structure=2`
   - Note the text: Should show "Control Panel", "Customer Base" (different)

3. **If disabled:**
   - Both URLs show the same content ("Dashboard", "Clients")

---

## Troubleshooting

### Problem: Dynamic Structure Not Working

**Symptom:** seed-structure parameter doesn't change content

**Check:**
1. Verify deployment command included `--dynamic_html_structure=true`
2. Check container environment:
   ```bash
   docker exec autocrm_8004-web-1 printenv | grep DYNAMIC
   ```
3. Rebuild if needed:
   ```bash
   bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=true
   ```

### Problem: Always Shows Same Content

**Symptom:** Different seed values show identical content

**Possible Cause:** Dynamic structure is disabled

**Solution:**
```bash
# Redeploy with enabled
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=true
```

### Problem: Container Won't Start

**Symptom:** Docker container fails to start

**Check:**
1. Verify port is not in use:
   ```bash
   lsof -i :8004  # Linux/Mac
   netstat -ano | findstr :8004  # Windows
   ```
2. Check Docker logs:
   ```bash
   docker logs autocrm_8004-web-1
   ```

---

## Complete Deployment Examples

### Scenario 1: Development Testing

Deploy for development with dynamic structure enabled:

```bash
# Deploy
bash scripts/setup.sh \
  --demo=autocrm \
  --web_port=8004 \
  --dynamic_html_structure=true

# Test
curl http://localhost:8004/?seed-structure=1
curl http://localhost:8004/?seed-structure=2

# Check logs
docker logs autocrm_8004-web-1
```

### Scenario 2: Baseline Testing

Deploy for baseline testing with dynamic structure disabled:

```bash
# Deploy
bash scripts/setup.sh \
  --demo=autocrm \
  --web_port=8004 \
  --dynamic_html_structure=false

# Test (all should return same content)
curl http://localhost:8004/?seed-structure=1
curl http://localhost:8004/?seed-structure=2
curl http://localhost:8004/?seed-structure=100
```

### Scenario 3: Multiple Instances

Deploy two instances for comparison:

```bash
# Instance 1: Enabled on port 8004
bash scripts/setup.sh \
  --demo=autocrm \
  --web_port=8004 \
  --dynamic_html_structure=true

# Instance 2: Disabled on port 8005
bash scripts/setup.sh \
  --demo=autocrm \
  --web_port=8005 \
  --dynamic_html_structure=false

# Compare
# Port 8004: http://localhost:8004/?seed-structure=2 shows "Control Panel"
# Port 8005: http://localhost:8005/?seed-structure=2 shows "Dashboard"
```

---

## Related Documentation

- [DYNAMIC_HTML_STRUCTURE_README.md](./DYNAMIC_HTML_STRUCTURE_README.md) - Main overview
- [DYNAMIC_STRUCTURE_TOGGLE_GUIDE.md](./DYNAMIC_STRUCTURE_TOGGLE_GUIDE.md) - Toggle guide
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Environment variables
- [docs/COMPLETE_GUIDE.md](./docs/COMPLETE_GUIDE.md) - Comprehensive guide

---

## Quick Reference

### Deploy with Enabled (Default)
```bash
bash scripts/setup.sh --demo=autocrm --web_port=8004
# or explicitly
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=true
```

### Deploy with Disabled
```bash
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=false
```

### Check Status
```bash
docker exec autocrm_8004-web-1 printenv | grep DYNAMIC
```

### View Logs
```bash
docker logs autocrm_8004-web-1
```

### Stop Container
```bash
docker compose -p autocrm_8004 down
```

### Rebuild
```bash
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=true
```

---

**Last Updated:** October 2025  
**Status:** Production Ready ✅

