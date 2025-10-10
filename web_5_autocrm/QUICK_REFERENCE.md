# Dynamic HTML Structure - Quick Reference

## 🚀 Deployment

```bash
# Enable (default)
bash scripts/setup.sh --demo=autocrm --web_port=8004

# Explicitly enable
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=true

# Disable
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=false
```

---

## 💻 Development

```bash
# Enable (default)
npm run dev

# Disable
NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run dev
```

---

## 🧪 Testing

```bash
# Test enabled
bash scripts/test_dynamic_structure_enabled.sh

# Test disabled
bash scripts/test_dynamic_structure_disabled.sh

# Interactive menu
bash scripts/test_dynamic_structure_toggle.sh
```

---

## 🌐 Test URLs

```
Enabled:
  /?seed-structure=1   → "Dashboard", "Clients"
  /?seed-structure=2   → "Control Panel", "Customer Base"
  /?seed-structure=10  → "Mission Control", "Stakeholder Hub"

Disabled:
  /?seed-structure=1   → "Dashboard", "Clients"
  /?seed-structure=2   → "Dashboard", "Clients" (same)
  /?seed-structure=100 → "Dashboard", "Clients" (same)
```

---

## 🔍 Verification

```bash
# Check container environment
docker exec autocrm_8004-web-1 printenv | grep DYNAMIC

# View logs
docker logs autocrm_8004-web-1
```

---

## 📝 Component Usage

```tsx
import { useDynamicStructure } from "@/context/DynamicStructureContext";

const { getText, getId } = useDynamicStructure();

<h1>{getText("dashboard_title")}</h1>
<button id={getId("add_client_button")}>
  {getText("add_new_client")}
</button>
```

---

## 🎯 Seed Mapping

```
Formula: ((seed - 1) % 10) + 1

Seeds 1-10   → Variation 1
Seeds 11-20  → Variation 2
Seeds 21-30  → Variation 3
...
Seeds 91-100 → Variation 10
Seeds 101-110 → Variation 1 (cycles)
```

---

## 📚 Documentation

- `SETUP_SCRIPT_GUIDE.md` - Setup script usage
- `DYNAMIC_STRUCTURE_OVERVIEW.md` - System overview
- `docs/COMPLETE_GUIDE.md` - Comprehensive guide
- `ENV_VARIABLES.md` - Environment variables

---

## ⚡ Quick Commands

```bash
# Deploy with enabled
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=true

# Deploy with disabled
bash scripts/setup.sh --demo=autocrm --web_port=8004 --dynamic_html_structure=false

# Stop
docker compose -p autocrm_8004 down

# Check env
docker exec autocrm_8004-web-1 printenv | grep DYNAMIC
```

