# Dynamic Structure Toggle Guide

## Overview

The Dynamic HTML Structure system can be **enabled or disabled** using an environment variable. This allows you to:

- Test with and without dynamic structure
- Compare baseline behavior vs. dynamic behavior
- Disable the system in specific environments
- Debug issues by isolating dynamic structure functionality

---

## Environment Variable

### NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE

**Default:** `true` (enabled if not set)

**Values:**
- `true` or `1` - Dynamic structure **ENABLED**
- `false` or `0` - Dynamic structure **DISABLED**

---

## Behavior Comparison

### When ENABLED (Default)

```bash
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true npm run dev
```

**Behavior:**
- ✅ `seed-structure` parameter is read from URL
- ✅ Content changes based on seed value
- ✅ 10 variations cycle through 1-300 seed range
- ✅ Different IDs and text for different seeds

**Example:**
```
/?seed-structure=1   → "Dashboard", "Clients", "Add New Client"
/?seed-structure=2   → "Control Panel", "Customer Base", "Create Client"
/?seed-structure=10  → "Mission Control", "Stakeholder Hub", "Recruit Client"
```

### When DISABLED

```bash
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run dev
```

**Behavior:**
- ❌ `seed-structure` parameter is **ignored**
- ✅ Always uses **variation 1** (default)
- ✅ Content remains **constant** across all URLs
- ✅ Same IDs and text regardless of seed

**Example:**
```
/?seed-structure=1   → "Dashboard", "Clients", "Add New Client"
/?seed-structure=2   → "Dashboard", "Clients", "Add New Client" (same)
/?seed-structure=100 → "Dashboard", "Clients", "Add New Client" (same)
```

---

## How to Toggle

### Development Server

```bash
# Enable (default)
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true npm run dev

# Disable
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run dev
```

**Important:** You must restart the dev server for changes to take effect!

### Production Build

```bash
# Build with enabled
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true npm run build
npm start

# Build with disabled
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run build
npm start
```

### Docker

**docker-compose.yml:**
```yaml
services:
  web:
    environment:
      - NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true
```

**Build command:**
```bash
docker compose up -d --build
```

---

## Testing

### Test Scripts

Three test scripts are available:

1. **test_dynamic_structure_enabled.sh** - Tests enabled state
2. **test_dynamic_structure_disabled.sh** - Tests disabled state
3. **test_dynamic_structure_toggle.sh** - Interactive menu

### Testing Enabled State

```bash
# Terminal 1: Start server with ENABLED
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true npm run dev

# Terminal 2: Run tests
bash scripts/test_dynamic_structure_enabled.sh
```

**Expected Results:**
- Different seed values produce different content
- Variation 1 shows "Dashboard", "Clients"
- Variation 2 shows "Control Panel", "Customer Base"
- Element IDs change between variations

### Testing Disabled State

```bash
# Terminal 1: Start server with DISABLED
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run dev

# Terminal 2: Run tests
bash scripts/test_dynamic_structure_disabled.sh
```

**Expected Results:**
- All seed values produce same content
- Always shows "Dashboard", "Clients" (variation 1)
- Element IDs remain constant
- Console shows: "Dynamic HTML Structure is DISABLED"

### Interactive Testing

```bash
bash scripts/test_dynamic_structure_toggle.sh
```

This launches an interactive menu to:
- Test enabled state
- Test disabled state
- Show current status
- View quick reference
- Exit

---

## Verification

### Check Current State

**Method 1: Browser Console**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for message:
   - If disabled: `"Dynamic HTML Structure is DISABLED - using default variation"`
   - If enabled: No special message

**Method 2: Visual Check**

1. Open two tabs:
   - Tab A: `http://localhost:3000/?seed-structure=1`
   - Tab B: `http://localhost:3000/?seed-structure=2`

2. Compare content:
   - **Enabled:** Tab A shows "Dashboard", Tab B shows "Control Panel"
   - **Disabled:** Both tabs show "Dashboard"

**Method 3: Inspect Element IDs**

1. Visit `http://localhost:3000/?seed-structure=1`
2. Open DevTools, inspect sidebar link
3. Note the ID (e.g., `dashboard-nav-link`)
4. Visit `http://localhost:3000/?seed-structure=2`
5. Inspect same sidebar link
6. Compare IDs:
   - **Enabled:** Different ID (e.g., `control-panel-link`)
   - **Disabled:** Same ID (`dashboard-nav-link`)

---

## Use Cases

### Development

```bash
# Default: Test with dynamic structure
npm run dev

# Or explicitly enable
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true npm run dev
```

### Testing Baseline

```bash
# Disable to establish baseline behavior
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run dev
```

### Debugging

```bash
# If issues occur, disable to isolate problem
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run dev
```

### A/B Testing

```bash
# Control group (disabled)
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run dev

# Test group (enabled with specific seed)
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true npm run dev
# Visit: /?seed-structure=5
```

---

## Implementation Details

### In the Code

The `DynamicStructureContext` checks the environment variable:

```typescript
const isDynamicStructureEnabled = (): boolean => {
  const envValue = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE;
  return envValue === undefined || envValue === "true" || envValue === "1";
};
```

**Logic:**
- If `envValue` is undefined → **ENABLED** (default)
- If `envValue` is `"true"` or `"1"` → **ENABLED**
- If `envValue` is `"false"` or `"0"` → **DISABLED**

### When Disabled

When disabled, the context:
1. Logs: `"Dynamic HTML Structure is DISABLED - using default variation"`
2. Sets `currentVariation = 1`
3. Sets `seedStructure = null`
4. Loads only `variation1` data
5. Ignores URL `seed-structure` parameter

---

## Troubleshooting

### Problem: Changes Not Taking Effect

**Symptom:** Changed environment variable but still seeing old behavior

**Solution:**
1. **Stop** the dev server (Ctrl+C)
2. Set the environment variable
3. **Restart** the dev server

```bash
# Stop server with Ctrl+C, then:
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run dev
```

### Problem: Not Sure If It's Working

**Solution:** Run test scripts

```bash
# Test enabled
bash scripts/test_dynamic_structure_enabled.sh

# Test disabled
bash scripts/test_dynamic_structure_disabled.sh
```

### Problem: Console Warning

**Symptom:** See "Dynamic HTML Structure is DISABLED" but expect it enabled

**Solution:** Check your environment variable:

```bash
# Check if set in current shell
echo $NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE

# Make sure to set it when starting
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true npm run dev
```

---

## Quick Reference

| State | Environment Variable | Seed Behavior | Use Case |
|-------|---------------------|---------------|----------|
| **Enabled** | `true` or not set | Changes content | Normal development |
| **Disabled** | `false` | Ignored, variation 1 | Baseline testing |

**Test Scripts:**
```bash
bash scripts/test_dynamic_structure_enabled.sh     # Test enabled
bash scripts/test_dynamic_structure_disabled.sh    # Test disabled
bash scripts/test_dynamic_structure_toggle.sh      # Interactive menu
```

**URLs to Test:**
```
http://localhost:3000/?seed-structure=1    # Variation 1
http://localhost:3000/?seed-structure=2    # Variation 2 (or 1 if disabled)
http://localhost:3000/?seed-structure=10   # Variation 10 (or 1 if disabled)
```

---

## Related Documentation

- [DYNAMIC_HTML_STRUCTURE_README.md](./DYNAMIC_HTML_STRUCTURE_README.md) - Main overview
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Environment variable reference
- [docs/DYNAMIC_STRUCTURE_GUIDE.md](./docs/DYNAMIC_STRUCTURE_GUIDE.md) - Complete guide
- [docs/COMPLETE_GUIDE.md](./docs/COMPLETE_GUIDE.md) - Comprehensive reference

---

**Last Updated:** October 2025  
**Status:** Fully Operational ✅

