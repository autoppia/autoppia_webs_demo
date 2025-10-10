# Dynamic HTML Structure Guide

## Overview

The **Dynamic HTML Structure System** in `web_5_autocrm` enables all text content and element IDs across the application to dynamically change based on the `seed-structure` query parameter (range: 1-300).

This system provides 10 distinct structural variations that cycle through the seed range, allowing for extensive testing and variation in content presentation.

---

## 🎯 How It Works

### URL Parameter

The system reads the `seed-structure` query parameter from the URL:

```
http://localhost:3000/?seed-structure=42
http://localhost:3000/clients?seed-structure=155
http://localhost:3000/matters?seed-structure=300
```

### Mapping Formula

The system maps any seed value (1-300) to one of 10 variations using:

```typescript
mappedVariation = ((seedStructure - 1) % 10) + 1
```

**Examples:**
- `seed-structure=1` → Variation 1
- `seed-structure=11` → Variation 1
- `seed-structure=50` → Variation 10
- `seed-structure=155` → Variation 5
- `seed-structure=300` → Variation 10

---

## 📁 File Structure

```
web_5_autocrm/
├── src/
│   ├── context/
│   │   └── DynamicStructureContext.tsx    # Context provider and hooks
│   ├── data/
│   │   └── structureVariations.json       # 10 variations of text/IDs
│   └── app/
│       └── ClientProviders.tsx            # Client-side wrapper
├── scripts/
│   └── test_dynamic_structure.sh          # Test script
└── docs/
    ├── DYNAMIC_STRUCTURE_GUIDE.md         # This file
    ├── FINAL_IMPLEMENTATION_SUMMARY.md    # Implementation summary
    └── COMPLETE_GUIDE.md                  # Complete guide
```

---

## 🧩 Implementation Details

### 1. Context Provider

**File:** `src/context/DynamicStructureContext.tsx`

```typescript
import { useDynamicStructure } from "@/context/DynamicStructureContext";

const { getText, getId } = useDynamicStructure();
```

### 2. Structure Variations JSON

**File:** `src/data/structureVariations.json`

Contains 10 variations with:
- **70+ text keys** (e.g., `dashboard_title`, `add_new_client`, `search_placeholder`)
- **15+ element ID keys** (e.g., `dashboard_link`, `search_input`, `add_client_button`)

### 3. Usage in Components

```tsx
import { useDynamicStructure } from "@/context/DynamicStructureContext";

export default function MyComponent() {
  const { getText, getId } = useDynamicStructure();
  
  return (
    <>
      <h1>{getText("dashboard_title")}</h1>
      <button id={getId("add_client_button")}>
        {getText("add_new_client")}
      </button>
      <input 
        id={getId("search_input")}
        placeholder={getText("search_placeholder")}
      />
    </>
  );
}
```

---

## 🔑 Available Text Keys

Here are some commonly used text keys:

### Navigation & Titles
- `dashboard_title`
- `clients_title`
- `matters_title`
- `calendar_title`
- `documents_title`
- `billing_title`
- `settings_title`

### Actions
- `add_new_client`
- `add_new_matter`
- `add_event`
- `save_button`
- `cancel_button`
- `edit_button`
- `delete_button`

### Forms
- `client_name`
- `client_email`
- `client_phone`
- `matter_name`
- `matter_status`
- `search_placeholder`

### Common Fields
- `first_name`
- `last_name`
- `company_name`
- `notes`
- `tags`
- `priority`

---

## 🆔 Available Element ID Keys

- `dashboard_link`
- `clients_link`
- `matters_link`
- `calendar_link`
- `documents_link`
- `billing_link`
- `settings_link`
- `add_client_button`
- `add_matter_button`
- `search_input`
- `save_button`
- `cancel_button`
- `edit_button`
- `delete_button`
- `main_container`
- `sidebar_container`
- `header_container`

---

## ✅ Testing

Run the test script:

```bash
cd web_5_autocrm
chmod +x scripts/test_dynamic_structure.sh
./scripts/test_dynamic_structure.sh
```

### Manual Testing

Visit these URLs to see variations:

1. **Variation 1:** `/?seed-structure=1`
2. **Variation 5:** `/?seed-structure=5`
3. **Variation 10:** `/?seed-structure=10`
4. **Cycling test:** `/?seed-structure=11` (should show Variation 1 again)
5. **Edge case:** `/?seed-structure=300` (should show Variation 10)

---

## 🎨 Variation Examples

### Variation 1 (Default)
- Dashboard Title: "Dashboard"
- Add Client Button: "Add New Client"
- Search Placeholder: "Search..."

### Variation 2
- Dashboard Title: "Control Panel"
- Add Client Button: "Create Client"
- Search Placeholder: "Find anything..."

### Variation 3
- Dashboard Title: "Overview"
- Add Client Button: "Register Client"
- Search Placeholder: "Type to search..."

---

## 🔧 Extending the System

### Adding New Text Keys

1. Open `src/data/structureVariations.json`
2. Add the new key to all 10 variations:

```json
{
  "variation1": {
    "texts": {
      "my_new_key": "My New Text",
      ...
    }
  },
  "variation2": {
    "texts": {
      "my_new_key": "Alternative Text",
      ...
    }
  }
}
```

3. Use in components:

```tsx
<span>{getText("my_new_key")}</span>
```

### Adding New Element IDs

Follow the same pattern in the `ids` section of each variation.

---

## 🐛 Troubleshooting

### Issue: Text not changing

**Check:**
1. Is `seed-structure` in the URL?
2. Is the component wrapped in `DynamicStructureProvider`?
3. Is `useDynamicStructure()` imported and used correctly?

### Issue: Console warnings

If you see warnings about missing keys, ensure all variations in `structureVariations.json` have the same keys.

---

## 📚 Related Documentation

- [FINAL_IMPLEMENTATION_SUMMARY.md](./FINAL_IMPLEMENTATION_SUMMARY.md) - Implementation details
- [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md) - Complete usage guide

---

## 💡 Best Practices

1. **Consistency:** Always use the same key names across all variations
2. **Fallbacks:** The system returns the key name if not found
3. **Testing:** Test with multiple seed values to ensure all variations work
4. **Documentation:** Keep this guide updated when adding new keys

---

**Last Updated:** October 2025

