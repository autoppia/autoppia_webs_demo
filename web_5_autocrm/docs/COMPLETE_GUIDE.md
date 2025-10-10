# Complete Guide: Dynamic HTML Structure System

## 📚 Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Getting Started](#getting-started)
4. [API Reference](#api-reference)
5. [Implementation Guide](#implementation-guide)
6. [Variation Reference](#variation-reference)
7. [Testing](#testing)
8. [Advanced Usage](#advanced-usage)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Introduction

### What is the Dynamic HTML Structure System?

The Dynamic HTML Structure System is a powerful feature in `web_5_autocrm` that allows all text content and HTML element IDs to dynamically change based on a URL query parameter called `seed-structure`.

### Why Use This System?

- **Testing:** Test how different text variations affect user behavior
- **A/B Testing:** Compare different terminology sets
- **Flexibility:** Easy to change UI text without code modifications
- **Consistency:** Centralized text management across the app

### How It Works

1. User visits URL with `seed-structure` parameter (e.g., `/?seed-structure=42`)
2. System maps the seed (1-300) to one of 10 variations
3. Components use `getText()` and `getId()` to retrieve dynamic content
4. UI renders with variation-specific text and IDs

---

## System Architecture

### Core Components

```
┌─────────────────────────────────────────┐
│  URL: /?seed-structure=42               │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  DynamicStructureContext                │
│  • Reads seed-structure parameter       │
│  • Maps to variation: ((42-1)%10)+1=2   │
│  • Loads variation2 data                │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  structureVariations.json               │
│  • Contains 10 variations               │
│  • Each with texts & ids objects        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Component: useDynamicStructure()       │
│  • getText("dashboard_title")           │
│  • getId("add_client_button")           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Rendered UI with Dynamic Content       │
└─────────────────────────────────────────┘
```

### File Structure

```
web_5_autocrm/
├── src/
│   ├── context/
│   │   └── DynamicStructureContext.tsx
│   ├── data/
│   │   └── structureVariations.json
│   ├── app/
│   │   ├── ClientProviders.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── clients/
│   │       └── page.tsx
│   └── components/
│       └── Sidebar.tsx
├── scripts/
│   └── test_dynamic_structure.sh
└── docs/
    ├── DYNAMIC_STRUCTURE_GUIDE.md
    ├── FINAL_IMPLEMENTATION_SUMMARY.md
    └── COMPLETE_GUIDE.md
```

---

## Getting Started

### Quick Start

1. **Visit the app with a seed parameter:**
   ```
   http://localhost:3000/?seed-structure=1
   ```

2. **In your component, import the hook:**
   ```tsx
   import { useDynamicStructure } from "@/context/DynamicStructureContext";
   ```

3. **Use the hook:**
   ```tsx
   const { getText, getId } = useDynamicStructure();
   ```

4. **Apply to your UI:**
   ```tsx
   <h1>{getText("dashboard_title")}</h1>
   <button id={getId("add_client_button")}>
     {getText("add_new_client")}
   </button>
   ```

### Seed-to-Variation Mapping

The system uses this formula to map seeds to variations:

```typescript
mappedVariation = ((seedStructure - 1) % 10) + 1
```

**Quick Reference:**

| Seed | Variation | Seed | Variation | Seed | Variation |
|------|-----------|------|-----------|------|-----------|
| 1    | 1         | 11   | 1         | 21   | 1         |
| 2    | 2         | 12   | 2         | 22   | 2         |
| 3    | 3         | 13   | 3         | 23   | 3         |
| 4    | 4         | 14   | 4         | 24   | 4         |
| 5    | 5         | 15   | 5         | 25   | 5         |
| 6    | 6         | 16   | 6         | 26   | 6         |
| 7    | 7         | 17   | 7         | 27   | 7         |
| 8    | 8         | 18   | 8         | 28   | 8         |
| 9    | 9         | 19   | 9         | 29   | 9         |
| 10   | 10        | 20   | 10        | 30   | 10        |

---

## API Reference

### Hook: `useDynamicStructure()`

```tsx
const { getText, getId, currentVariation, seedStructure } = useDynamicStructure();
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `getText` | `(key: string) => string` | Get dynamic text by key |
| `getId` | `(key: string) => string` | Get dynamic element ID by key |
| `currentVariation` | `number` | Current variation number (1-10) |
| `seedStructure` | `number \| null` | Current seed value from URL |

#### Methods

##### `getText(key: string): string`

Returns the text content for the given key based on the current variation.

```tsx
getText("dashboard_title")  // Returns: "Dashboard" or "Control Panel" etc.
```

**Fallback:** If key is not found, returns the key itself and logs a warning.

##### `getId(key: string): string`

Returns the element ID for the given key based on the current variation.

```tsx
getId("add_client_button")  // Returns: "add-client-btn" or "create-client-button" etc.
```

**Fallback:** If key is not found, returns the key itself and logs a warning.

---

## Implementation Guide

### Step 1: Ensure Provider is Set Up

The `DynamicStructureProvider` should already be set up in `layout.tsx`:

```tsx
// src/app/layout.tsx
import ClientProviders from "./ClientProviders";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClientProviders>
          {/* Your app content */}
        </ClientProviders>
      </body>
    </html>
  );
}
```

### Step 2: Use in Components

```tsx
// src/components/MyComponent.tsx
"use client";
import { useDynamicStructure } from "@/context/DynamicStructureContext";

export default function MyComponent() {
  const { getText, getId } = useDynamicStructure();
  
  return (
    <div>
      <h1>{getText("dashboard_title")}</h1>
      <button id={getId("add_client_button")}>
        {getText("add_new_client")}
      </button>
    </div>
  );
}
```

### Step 3: Test with Different Seeds

Visit your component with different seeds:

```
http://localhost:3000/my-component?seed-structure=1
http://localhost:3000/my-component?seed-structure=11
http://localhost:3000/my-component?seed-structure=50
```

---

## Variation Reference

### Text Keys (70+ available)

#### Navigation & Titles
- `dashboard_title`
- `clients_title`
- `matters_title`
- `calendar_title`
- `documents_title`
- `billing_title`
- `settings_title`

#### Actions
- `add_new_client`
- `add_new_matter`
- `add_event`
- `save_button`
- `cancel_button`
- `edit_button`
- `delete_button`
- `view_details`

#### Client Fields
- `client_name`
- `client_email`
- `client_phone`
- `client_address`
- `first_name`
- `last_name`
- `company_name`

#### Matter Fields
- `matter_name`
- `matter_status`
- `matter_type`
- `matter_description`
- `case_number`
- `court_date`

#### Billing Fields
- `billing_rate`
- `hours_logged`
- `total_amount`
- `invoice_number`
- `due_date`
- `payment_status`

#### Status Values
- `active_status`
- `inactive_status`
- `pending_status`
- `completed_status`
- `draft_status`

#### Common Fields
- `search_placeholder`
- `filter_by`
- `sort_by`
- `notes`
- `tags`
- `priority`
- `created_date`
- `modified_date`

### Element ID Keys (15+ available)

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

## Variation Examples

### Variation 1 (Default)
```json
{
  "dashboard_title": "Dashboard",
  "clients_title": "Clients",
  "add_new_client": "Add New Client",
  "search_placeholder": "Search..."
}
```

### Variation 2
```json
{
  "dashboard_title": "Control Panel",
  "clients_title": "Customer Base",
  "add_new_client": "Create Client",
  "search_placeholder": "Find anything..."
}
```

### Variation 3
```json
{
  "dashboard_title": "Overview",
  "clients_title": "Contacts",
  "add_new_client": "Register Client",
  "search_placeholder": "Type to search..."
}
```

### Variation 10
```json
{
  "dashboard_title": "Mission Control",
  "clients_title": "Stakeholder Hub",
  "add_new_client": "Recruit Client",
  "search_placeholder": "Discover..."
}
```

---

## Testing

### Manual Testing

1. **Test variation cycling:**
   ```
   /?seed-structure=1   (Variation 1)
   /?seed-structure=11  (Variation 1 - should be same)
   /?seed-structure=21  (Variation 1 - should be same)
   ```

2. **Test all 10 variations:**
   ```
   /?seed-structure=1   (Variation 1)
   /?seed-structure=2   (Variation 2)
   ...
   /?seed-structure=10  (Variation 10)
   ```

3. **Test edge cases:**
   ```
   /?seed-structure=300 (Variation 10)
   /?seed-structure=155 (Variation 5)
   /                    (Default - Variation 1)
   ```

### Automated Testing

Run the test script:

```bash
cd web_5_autocrm
chmod +x scripts/test_dynamic_structure.sh
./scripts/test_dynamic_structure.sh
```

---

## Advanced Usage

### Conditional Rendering Based on Variation

```tsx
const { getText, currentVariation } = useDynamicStructure();

return (
  <div>
    <h1>{getText("dashboard_title")}</h1>
    {currentVariation <= 5 && (
      <p>You're seeing an early variation!</p>
    )}
  </div>
);
```

### Checking Seed Value

```tsx
const { seedStructure } = useDynamicStructure();

if (seedStructure && seedStructure > 200) {
  // Special handling for high seed values
}
```

### Dynamic Styling Based on Variation

```tsx
const { currentVariation } = useDynamicStructure();

const bgColor = currentVariation <= 5 ? 'bg-blue-100' : 'bg-green-100';

return <div className={bgColor}>Content</div>;
```

---

## Troubleshooting

### Problem: Text Not Changing

**Possible Causes:**
1. No `seed-structure` parameter in URL
2. Component not wrapped in provider
3. Using hardcoded text instead of `getText()`

**Solution:**
```tsx
// ❌ Wrong
<h1>Dashboard</h1>

// ✅ Correct
<h1>{getText("dashboard_title")}</h1>
```

### Problem: Console Warnings

**Warning:** "Text key 'X' not found in variation Y"

**Causes:**
- Key doesn't exist in `structureVariations.json`
- Typo in key name

**Solution:**
1. Check `structureVariations.json` for the key
2. Verify spelling
3. Add key to all 10 variations if missing

### Problem: IDs Not Unique

**Issue:** Same ID appears multiple times

**Solution:**
Use index or unique identifier:
```tsx
{items.map((item, index) => (
  <div id={`${getId("item_container")}-${item.id}`}>
    {/* content */}
  </div>
))}
```

### Problem: Hydration Errors

**Cause:** Server-side render doesn't match client-side

**Solution:**
Ensure `ClientProviders` uses Suspense:
```tsx
<Suspense fallback={<div>{children}</div>}>
  <DynamicStructureProvider>{children}</DynamicStructureProvider>
</Suspense>
```

---

## FAQ

### Q: How many variations can I create?

**A:** Currently 10 variations (variation1 through variation10). The system cycles through these for all 300 seed values.

### Q: Can I add more text keys?

**A:** Yes! Add new keys to all 10 variations in `structureVariations.json`, then use `getText("your_new_key")` in your components.

### Q: What happens if I don't provide seed-structure in the URL?

**A:** The system defaults to Variation 1.

### Q: Can I use this system for internationalization (i18n)?

**A:** While possible, this system is designed for A/B testing different English terminology. For full i18n, consider dedicated i18n libraries.

### Q: Does this affect SEO?

**A:** Since content changes dynamically on the client side, search engines will see the default variation (Variation 1).

### Q: Can I use dynamic structure in Server Components?

**A:** The `useDynamicStructure` hook requires client components ("use client"). For server components, pass dynamic text as props.

### Q: How do I test all variations quickly?

**A:** Use the test script: `./scripts/test_dynamic_structure.sh`

### Q: What's the performance impact?

**A:** Minimal. JSON is loaded once per variation and cached. Context prevents unnecessary re-renders.

---

## Best Practices

### 1. Consistent Key Naming

Use descriptive, consistent key names:

```tsx
// ✅ Good
getText("add_new_client")
getText("client_email_address")

// ❌ Bad
getText("btn1")
getText("email")
```

### 2. Complete Variation Coverage

Ensure all 10 variations have the same keys:

```json
// Each variation should have:
{
  "texts": {
    "dashboard_title": "...",
    "clients_title": "...",
    // ... all keys
  },
  "ids": {
    "dashboard_link": "...",
    // ... all keys
  }
}
```

### 3. Semantic Key Names

Use semantic names that describe the content:

```tsx
// ✅ Good
getText("save_changes_button")
getText("client_first_name_label")

// ❌ Bad
getText("button_text_1")
getText("label_2")
```

### 4. Document New Keys

When adding keys, update this documentation:

1. Add to "Text Keys" or "Element ID Keys" section
2. Add example in "Variation Examples"
3. Document in code comments

---

## Migration Guide

### Migrating Existing Components

**Before:**
```tsx
export default function MyComponent() {
  return (
    <div>
      <h1>Clients</h1>
      <button id="add-client">Add New Client</button>
    </div>
  );
}
```

**After:**
```tsx
"use client";
import { useDynamicStructure } from "@/context/DynamicStructureContext";

export default function MyComponent() {
  const { getText, getId } = useDynamicStructure();
  
  return (
    <div>
      <h1>{getText("clients_title")}</h1>
      <button id={getId("add_client_button")}>
        {getText("add_new_client")}
      </button>
    </div>
  );
}
```

---

## Changelog

### Version 1.0 (October 2025)
- ✅ Initial implementation
- ✅ 10 variations with 70+ text keys
- ✅ 15+ element ID keys
- ✅ React Context provider
- ✅ Complete documentation
- ✅ Test script

---

## Contributing

### Adding New Text Keys

1. Open `src/data/structureVariations.json`
2. Add key to all 10 variations
3. Test with `./scripts/test_dynamic_structure.sh`
4. Update documentation

### Reporting Issues

- Check console for warnings
- Verify key exists in all variations
- Test with multiple seed values

---

## Resources

- [DYNAMIC_STRUCTURE_GUIDE.md](./DYNAMIC_STRUCTURE_GUIDE.md) - Quick start guide
- [FINAL_IMPLEMENTATION_SUMMARY.md](./FINAL_IMPLEMENTATION_SUMMARY.md) - Technical details
- [structureVariations.json](../src/data/structureVariations.json) - Data source

---

## Support

For issues or questions:
1. Check this guide's Troubleshooting section
2. Review console warnings
3. Test with `./scripts/test_dynamic_structure.sh`
4. Verify implementation against examples

---

**Last Updated:** October 2025  
**Version:** 1.0  
**Status:** Production Ready ✅

