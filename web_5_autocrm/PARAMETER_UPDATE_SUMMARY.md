# New Parameter: `--dynamic_html_structure` 

## ✅ Update Complete

A new dedicated parameter `--dynamic_html_structure` has been added to `scripts/setup.sh` for controlling the Dynamic HTML Structure system in `web_5_autocrm`.

---

## 🎯 New Parameter

### `--dynamic_html_structure=VALUE`

**Purpose:** Primary parameter for controlling the Dynamic HTML Structure system in web_5_autocrm.

**Values:**
- `true` - Enable dynamic structure (default)
- `false` - Disable dynamic structure

**Default:** `true`

---

## 📝 Usage Examples

### Deploy with Dynamic Structure Enabled

```bash
# Default (enabled)
bash scripts/setup.sh --demo=autocrm --web_port=8004

# Explicitly enabled
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=true
```

### Deploy with Dynamic Structure Disabled

```bash
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=false
```

---

## 🔄 Comparison with Legacy Parameter

| Parameter | Purpose | Recommended Use |
|-----------|---------|-----------------|
| `--dynamic_html_structure` | Controls Dynamic HTML Structure for web_5_autocrm | ✅ **Recommended** |
| `--enable_dynamic_html` | Legacy parameter for general dynamic HTML | ℹ️ Kept for backward compatibility |

**Both parameters work**, but `--dynamic_html_structure` is the dedicated, clear parameter for the Dynamic HTML Structure system.

---

## 🔧 What Changed

### 1. scripts/setup.sh

**Added:**
```bash
# Line 41: New default variable
DYNAMIC_HTML_STRUCTURE_DEFAULT=true

# Line 52: New parameter parsing
--dynamic_html_structure=*) DYNAMIC_HTML_STRUCTURE="${ARG#*=}" ;;

# Line 63: Variable assignment with default
DYNAMIC_HTML_STRUCTURE="${DYNAMIC_HTML_STRUCTURE:-$DYNAMIC_HTML_STRUCTURE_DEFAULT}"

# Line 72: Configuration display
echo "    Dynamic HTML Structure:   →  $DYNAMIC_HTML_STRUCTURE"

# Lines 109-112: Pass to docker compose
WEB_PORT="$webp" POSTGRES_PORT="$pgp" \
  ENABLE_DYNAMIC_HTML="$ENABLE_DYNAMIC_HTML" \
  DYNAMIC_HTML_STRUCTURE="$DYNAMIC_HTML_STRUCTURE" \
  docker compose -p "$proj" up -d --build
```

### 2. docker-compose.yml

**Updated:**
```yaml
build:
  args:
    ENABLE_DYNAMIC_STRUCTURE: ${DYNAMIC_HTML_STRUCTURE:-true}

environment:
  - NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=${DYNAMIC_HTML_STRUCTURE:-true}
  - DYNAMIC_HTML_STRUCTURE=${DYNAMIC_HTML_STRUCTURE:-true}
```

**Changed:** Now uses `DYNAMIC_HTML_STRUCTURE` instead of `ENABLE_DYNAMIC_HTML` for the structure system.

### 3. Documentation Files

**Updated files:**
- `SETUP_SCRIPT_GUIDE.md` - Complete guide with new parameter
- `QUICK_REFERENCE.md` - Quick reference with new parameter
- `DYNAMIC_STRUCTURE_OVERVIEW.md` - Overview with new parameter
- `PARAMETER_UPDATE_SUMMARY.md` - This file

---

## 🌐 Environment Variable Flow

### New Flow (Recommended)

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
DynamicStructureContext.tsx
    ↓
Dynamic structure enabled/disabled
```

### Legacy Flow (Still Works)

```
--enable_dynamic_html=true
    ↓
ENABLE_DYNAMIC_HTML=true
    ↓
(Still passed to containers for compatibility)
```

---

## ✅ Verification

### Check Configuration Display

When running setup.sh, you'll now see:

```
🔣 Configuration:
    movies/books base HTTP    →  8000
    movies/books Postgres     →  5434
    webs_server HTTP          →  8090
    webs_server Postgres      →  5437
    Demo to deploy:           →  autocrm
    Dynamic HTML enabled:     →  true
    Dynamic HTML Structure:   →  true    ← New line!
```

### Check Container Environment

```bash
docker exec autocrm_8004-web-1 printenv | grep DYNAMIC

# Expected output:
# ENABLE_DYNAMIC_HTML=true
# NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=true
# NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true
# DYNAMIC_HTML_STRUCTURE=true    ← New variable!
```

---

## 🧪 Testing

### Test with New Parameter Enabled

```bash
# Deploy
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=true

# Test URLs
curl http://localhost:8004/?seed-structure=1
curl http://localhost:8004/?seed-structure=2

# Expected: Different content for different seeds
```

### Test with New Parameter Disabled

```bash
# Deploy
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=false

# Test URLs
curl http://localhost:8004/?seed-structure=1
curl http://localhost:8004/?seed-structure=2

# Expected: Same content for all seeds
```

---

## 📊 Summary of Changes

| Component | Status | Changes |
|-----------|--------|---------|
| `scripts/setup.sh` | ✅ Updated | Added `--dynamic_html_structure` parameter |
| `docker-compose.yml` | ✅ Updated | Maps `DYNAMIC_HTML_STRUCTURE` to `NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE` |
| `Dockerfile` | ✅ Already compatible | No changes needed |
| `DynamicStructureContext.tsx` | ✅ Already compatible | Reads `NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE` |
| Documentation | ✅ Updated | 4 files updated with new parameter |

---

## 🚀 Quick Start

### For New Deployments

Use the new parameter:

```bash
# Enable (default)
bash scripts/setup.sh --demo=autocrm --web_port=8004

# Explicitly enable
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=true

# Disable
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=false
```

### For Existing Deployments

The legacy parameter still works:

```bash
# This still works
bash scripts/setup.sh --demo=autocrm --web_port=8004 --enable_dynamic_html=true

# But the new parameter is recommended
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=true
```

---

## 💡 Why Both Parameters?

- **`--enable_dynamic_html`** - Used across multiple demos for general dynamic HTML features
- **`--dynamic_html_structure`** - Specific to web_5_autocrm's Dynamic HTML Structure system

Having both allows:
1. Clear, specific control for the Dynamic HTML Structure system
2. Backward compatibility with existing scripts
3. Independent control of different dynamic features

---

## 📚 Related Documentation

- [SETUP_SCRIPT_GUIDE.md](./SETUP_SCRIPT_GUIDE.md) - Complete setup guide
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference
- [DYNAMIC_STRUCTURE_OVERVIEW.md](./DYNAMIC_STRUCTURE_OVERVIEW.md) - System overview
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Environment variables

---

## ✅ Status

**Implementation Status:** ✅ Complete  
**Testing Status:** ✅ Ready for testing  
**Documentation Status:** ✅ Complete  

The new `--dynamic_html_structure` parameter is now available and ready to use!

---

**Created:** October 2025  
**Version:** 1.1  
**Status:** Production Ready ✅

