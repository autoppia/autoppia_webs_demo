# Environment Variables

## Dynamic HTML Structure System

### NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE

Controls whether the Dynamic HTML Structure system is active.

**Values:**
- `true` - Enable dynamic structure (default)
- `false` - Disable dynamic structure
- `1` - Enable dynamic structure
- `0` - Disable dynamic structure
- (not set) - Defaults to enabled

**Usage:**

```bash
# Enable dynamic structure
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true npm run dev

# Disable dynamic structure
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run dev
```

---

## How It Works

### When ENABLED (`true`)

The system reads the `seed-structure` query parameter and changes content based on it:

```
URL: /?seed-structure=1   → Variation 1: "Dashboard", "Clients"
URL: /?seed-structure=2   → Variation 2: "Control Panel", "Customer Base"
URL: /?seed-structure=10  → Variation 10: "Mission Control", "Stakeholder Hub"
URL: /?seed-structure=11  → Variation 1 (cycles back)
```

**Formula:** `variation = ((seed-structure - 1) % 10) + 1`

### When DISABLED (`false`)

The system ignores the `seed-structure` parameter and always uses variation 1:

```
URL: /?seed-structure=1   → "Dashboard", "Clients"
URL: /?seed-structure=2   → "Dashboard", "Clients" (same)
URL: /?seed-structure=100 → "Dashboard", "Clients" (same)
```

All URLs return the same default content.

---

## Testing

### Test with Dynamic Structure Enabled

```bash
# Terminal 1: Start dev server
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true npm run dev

# Terminal 2: Run tests
bash scripts/test_dynamic_structure_enabled.sh
```

### Test with Dynamic Structure Disabled

```bash
# Terminal 1: Start dev server
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run dev

# Terminal 2: Run tests
bash scripts/test_dynamic_structure_disabled.sh
```

### Interactive Toggle Test

```bash
bash scripts/test_dynamic_structure_toggle.sh
```

---

## Docker Usage

### Docker Compose

Add to `docker-compose.yml`:

```yaml
services:
  web:
    environment:
      - NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true
```

### Dockerfile

Build with argument:

```dockerfile
ARG ENABLE_DYNAMIC_STRUCTURE=true
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=${ENABLE_DYNAMIC_STRUCTURE}
```

Build command:

```bash
docker build --build-arg ENABLE_DYNAMIC_STRUCTURE=true -t autocrm .
```

---

## Verification

### Check if Enabled

1. Start the application
2. Open browser console (F12)
3. Visit any page
4. Look for console message:
   - If enabled: No message (or see dynamic structure logs)
   - If disabled: "Dynamic HTML Structure is DISABLED - using default variation"

### Visual Verification

**Enabled:**
- Visit `/?seed-structure=1` → See "Dashboard"
- Visit `/?seed-structure=2` → See "Control Panel" (different)

**Disabled:**
- Visit `/?seed-structure=1` → See "Dashboard"
- Visit `/?seed-structure=2` → See "Dashboard" (same)

---

## Related Documentation

- [DYNAMIC_HTML_STRUCTURE_README.md](./DYNAMIC_HTML_STRUCTURE_README.md)
- [docs/DYNAMIC_STRUCTURE_GUIDE.md](./docs/DYNAMIC_STRUCTURE_GUIDE.md)
- [docs/COMPLETE_GUIDE.md](./docs/COMPLETE_GUIDE.md)

---

## Troubleshooting

### Changes Not Taking Effect

**Problem:** Changed the environment variable but still seeing old behavior.

**Solution:** 
1. Stop the dev server (Ctrl+C)
2. Set the environment variable
3. Start the dev server again

```bash
# Stop server, then:
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run dev
```

### Not Sure If It's Working

**Solution:** Run the test scripts:

```bash
# Test enabled state
bash scripts/test_dynamic_structure_enabled.sh

# Test disabled state
bash scripts/test_dynamic_structure_disabled.sh
```

---

**Last Updated:** October 2025

