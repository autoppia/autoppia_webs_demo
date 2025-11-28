# Unified Seed System - Complete Guide

**Version:** 2.0  
**Last Updated:** November 2024  
**Status:** ✅ Fully Implemented Across All Webs (1-13)

---

## 📖 Table of Contents

1. [What is the Unified Seed System?](#what-is-the-unified-seed-system)
2. [How It Works](#how-it-works)
3. [Common Architecture](#common-architecture)
4. [URL Parameters](#url-parameters)
5. [Version Control (v1, v2, v3)](#version-control-v1-v2-v3)
6. [File Structure](#file-structure)
7. [Code Organization](#code-organization)
8. [Code Examples](#code-examples)
9. [Testing](#testing)
10. [Guarantees](#guarantees)
11. [Troubleshooting](#troubleshooting)

---

## What is the Unified Seed System?

The **Unified Seed System** is a centralized mechanism that allows **all web applications (1-13)** to:

1. Use a **single URL parameter** (`?seed=X`) to control multiple aspects of the application
2. Derive **version-specific seeds** (v1, v2, v3) from a base seed using centralized formulas
3. Apply different variations for:
   - **v1** → Layout/Structure (common across all webs)
   - **v2** → Data loading (specific per web)
   - **v3** → Text/Style variants (specific per web)
4. **Preserve the seed** across all navigation without losing it

### Key Benefits:

✅ **Clean URLs** - Only `?seed=23` instead of `?seed=23&v2-seed=237&seed-structure=37`  
✅ **Centralized Logic** - Formulas in one place (`webs_server`)  
✅ **Consistent Behavior** - All 13 webs work the same way  
✅ **Easy Testing** - Change one seed to test different configurations  
✅ **Maintainable** - Common code, no duplication

---

## How It Works

### Basic Flow:

```
User visits: http://localhost:8004/?seed=23

    ↓

1. SeedContext reads seed=23 from URL
    ↓

2. Calls webs_server: GET /seeds/resolve?seed=23&v1_enabled=true&v2_enabled=true
    ↓

3. Server calculates (deterministic formulas):
   • v1 = (23 × 29 + 7) % 300 + 1 = 74
   • v2 = (23 × 53 + 17) % 300 + 1 = 237
   • v3 = (23 × 71 + 3) % 100 + 1 = 37
    ↓

4. Returns: {base: 23, v1: 74, v2: 237, v3: 37}
    ↓

5. SeedContext stores and syncs:
   • resolvedSeeds = {base: 23, v1: 74, v2: 237, v3: 37}
   • window.__*V2Seed = 237  (for data loaders)
    ↓

6. Application applies:
   • v1=74  → Layout variant #5 (of 10)
   • v2=237 → Load data subset with seed 237
   • v3=37  → Text variant #8 (of 10)
    ↓

7. Navigation preserves seed:
   • All <Link> → SeedLink (auto-adds ?seed=23)
   • All router.push → useSeedRouter (auto-adds ?seed=23)
```

---

## Common Architecture

**ALL 13 webs (web_1 through web_13) follow this EXACT structure:**

```
my-web/
├── src/
│   ├── shared/
│   │   └── seed-resolver.ts          ← Calls /seeds/resolve API
│   │
│   ├── context/
│   │   └── SeedContext.tsx            ← Manages seeds, syncs to window
│   │
│   ├── components/ui/
│   │   └── SeedLink.tsx               ← Link wrapper (preserves seed)
│   │
│   ├── hooks/
│   │   └── useSeedRouter.ts           ← Router wrapper (preserves seed)
│   │
│   ├── data/
│   │   └── *-enhanced.ts              ← Data loaders (read from window)
│   │
│   ├── library/ or utils/
│   │   ├── useSeedLayout.ts           ← Uses resolvedSeeds.v1 for layout
│   │   └── textVariants.ts            ← Uses resolvedSeeds.v3 for text
│   │
│   └── app/
│       └── layout.tsx                 ← Wraps app in <SeedProvider>
```

---

## URL Parameters

### Primary Parameter: `?seed=X`

**Format:** `?seed=23`  
**Range:** 1-999  
**Required:** No (defaults to 1)  
**Persisted:** Yes (localStorage + URL priority)

**Example URLs:**

```
http://localhost:8004/?seed=1      → Base configuration
http://localhost:8004/?seed=23     → Variation #23
http://localhost:8004/?seed=100    → Variation #100
```

### Optional Parameter: `?enable_dynamic=v1,v2,v3`

**Format:** `?enable_dynamic=v1,v2` or `?enable_dynamic=v1,v2,v3`  
**Options:** `v1`, `v2`, `v3` (comma-separated)  
**Priority:** URL > Environment Variables > Default (all disabled)

**Example URLs:**

```
?seed=23&enable_dynamic=v1         → Only layout changes
?seed=23&enable_dynamic=v2         → Only data changes
?seed=23&enable_dynamic=v1,v2      → Layout + data change
?seed=23&enable_dynamic=v1,v2,v3   → Everything changes
?seed=23                           → Uses deployment env vars
```

---

## Version Control (v1, v2, v3)

### v1 - Layout/Structure (COMMON across all webs)

**What it does:** Changes the HTML structure and layout  
**Derived from:** `v1 = (baseSeed × 29 + 7) % 300 + 1`  
**Maps to:** Layout variant 1-10  
**Mapping formula (SAME in all webs):** `layoutIndex = ((v1 % 30) + 1) % 10 || 10`

**Example:**

```
seed=23 → v1=74 → layout=((74 % 30) + 1) % 10 = 5 → Layout Variant #5
```

**Used by:**

- `useSeedLayout.ts`
- `LayoutContext.tsx`
- `DynamicStructureContext.tsx`

**Common:** ✅ Same formula in ALL webs

---

### v2 - Data (SPECIFIC per web)

**What it does:** Changes which data is loaded from master datasets  
**Derived from:** `v2 = (baseSeed × 53 + 17) % 300 + 1`  
**Range:** 1-300

**Example:**

```
seed=23 → v2=237

web_3: Loads products with seed=237
web_5: Loads clients with seed=237
web_11: Loads calendar events with seed=237
```

**Data Flow:**

```typescript
// 1. SeedContext syncs to window
window.__autocrmV2Seed = 237;

// 2. Data loader reads from window
const getRuntimeV2Seed = () => window.__autocrmV2Seed;
const v2Seed = getRuntimeV2Seed() ?? 1;

// 3. Fetches data
fetchSeededSelection({
  projectKey: "web_5_autocrm",
  entityType: "clients",
  seedValue: v2Seed, // 237
  limit: 100,
});
```

**Specific:** ✅ Each web loads its own entities (movies, books, clients, emails, hotels, etc.)

---

### v3 - Text/Style Variants (SPECIFIC per web)

**What it does:** Changes text content and dynamic styles  
**Derived from:** `v3 = (baseSeed × 71 + 3) % 100 + 1`  
**Range:** 1-100  
**Maps to:** Text variant 1-10 (usually)

**Example:**

```
seed=23 → v3=37 → textVariant=((37-1) % 10) + 1 = 7 → Text Variant #7
```

**Used by:**

- `DynamicStructureContext.tsx`
- `textVariants.ts`
- `textVariants.json`

**Specific:** ✅ Each web has its own text variations

---

## File Structure

### 1. `seed-resolver.ts` (Client-side API client)

**Location:** `src/shared/seed-resolver.ts`  
**Purpose:** Calls `/seeds/resolve` endpoint, provides local fallback

**Key functions:**

```typescript
// Async call to server (with fallback)
export async function resolveSeeds(baseSeed: number): Promise<ResolvedSeeds>;

// Sync version (immediate, uses local formula)
export function resolveSeedsSync(baseSeed: number): ResolvedSeeds;

// Get enabled flags from URL or env
export function getEnabledFlags(): { v1: boolean; v2: boolean; v3: boolean };
```

**Same in ALL webs:** ✅ Identical code

---

### 2. `SeedContext.tsx` (React Context Provider)

**Location:** `src/context/SeedContext.tsx`  
**Purpose:** Manages seed state, resolves seeds, syncs to window

**Key responsibilities:**

- Reads `?seed=X` from URL (priority) or localStorage
- Calls `resolveSeeds()` to get derived seeds
- Syncs `v2Seed` to `window.__*V2Seed` for data loaders
- Provides `getNavigationUrl()` to preserve seed in URLs
- Persists seed to localStorage

**Provides:**

```typescript
interface SeedContextType {
  seed: number; // Base seed
  setSeed: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
  resolvedSeeds: ResolvedSeeds; // {base, v1, v2, v3}
}
```

**Same in ALL webs:** ✅ Identical pattern

---

### 3. `SeedLink.tsx` (Link Wrapper)

**Location:** `src/components/ui/SeedLink.tsx`  
**Purpose:** Automatically preserves seed in `<Link>` components

**Usage:**

```typescript
// Instead of:
<Link href="/profile">Profile</Link>

// Use:
<SeedLink href="/profile">Profile</SeedLink>
// → Automatically: /profile?seed=23&enable_dynamic=v1,v2
```

**Same in ALL webs:** ✅ Identical component

---

### 4. `useSeedRouter.ts` (Router Wrapper)

**Location:** `src/hooks/useSeedRouter.ts`  
**Purpose:** Automatically preserves seed in programmatic navigation

**Usage:**

```typescript
// Instead of:
const router = useRouter();
router.push("/profile");

// Use:
const router = useSeedRouter();
router.push("/profile");
// → Automatically: /profile?seed=23&enable_dynamic=v1,v2
```

**Same in ALL webs:** ✅ Identical hook

---

### 5. Data Loaders (`*-enhanced.ts`)

**Location:** `src/data/*-enhanced.ts`  
**Purpose:** Load data from webs_server using v2 seed

**Pattern (SAME in all webs):**

```typescript
// 1. Define getRuntimeV2Seed to read from window
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__autocrmV2Seed; // or __autocinemaV2Seed, etc.
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 300
  ) {
    return value;
  }
  return null;
};

// 2. Initialize data function
export async function initializeClients(
  v2Seed?: number | null
): Promise<Client[]> {
  const dbModeEnabled = isDbLoadModeEnabled();

  if (dbModeEnabled) {
    // Wait for SeedContext to sync
    if (typeof window !== "undefined") {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    // Get seed from param OR window, default to 1
    const effectiveSeed = v2Seed ?? getRuntimeV2Seed() ?? 1;
  }

  // Fetch data with seed
  const data = await fetchSeededSelection({
    projectKey: "web_5_autocrm",
    entityType: "clients",
    seedValue: effectiveSeed,
    limit: 100,
  });

  return data;
}
```

**Specific per web:** Each web loads different entities (movies, books, clients, hotels, etc.)

---

### 6. Layout Management

**Location:** `src/library/useSeedLayout.ts` or `src/contexts/LayoutContext.tsx`  
**Purpose:** Apply layout variations based on v1 seed

**Pattern (SAME in all webs):**

```typescript
// 1. Get v1 seed from SeedContext
const { resolvedSeeds } = useSeedContext();
const layoutSeed = resolvedSeeds.v1 ?? resolvedSeeds.base;

// 2. Map v1 (1-300) to layout (1-10) - COMMON FORMULA
const layoutIndex = ((layoutSeed % 30) + 1) % 10 || 10;

// 3. Apply layout
const layout = getSeedLayout(layoutIndex);
```

**Common:** ✅ Same formula in ALL webs

---

## Code Organization

### Physical Structure

All webs (3-13) follow the **same physical structure** for dynamic functionality. Everything dynamic is organized under `src/dynamic/`:

```
web_X/src/
  ├── dynamic/                    ← ALL dynamic functionality
  │   ├── v1-layouts/             ← V1: Layout variations (common)
  │   │   ├── layouts.ts          → 10 layout definitions
  │   │   ├── layout-variants.ts  → Layout variants
  │   │   └── index.ts            → Exports
  │   │
  │   ├── v2-data/                ← V2: Data loading (specific)
  │   │   ├── data-provider.ts    → Main provider
  │   │   ├── [entity]-loader.ts  → Entity-specific loaders
  │   │   └── index.ts            → Exports
  │   │
  │   ├── v3-dynamic/             ← V3: Anti-scraping (specific)
  │   │   ├── data/
  │   │   │   ├── semantic-ids.json      → 15-21 types × 10 variants
  │   │   │   ├── class-variants.json    → 11 types × 10 variants
  │   │   │   ├── text-variants.json     → 13-90+ keys × 10 variants
  │   │   │   └── textVariants.json      → (optional, advanced webs)
  │   │   ├── hooks/
  │   │   │   ├── useV3Attributes.ts     → Main V3 hook
  │   │   │   └── useSeedLayout.ts       → (optional, advanced webs)
  │   │   ├── utils/
  │   │   │   ├── id-generator.ts        → Generate semantic IDs
  │   │   │   ├── text-selector.ts       → Select text variants
  │   │   │   ├── class-selector.ts      → Select class variants
  │   │   │   └── textVariants.ts        → (optional, advanced webs)
  │   │   └── index.ts                   → Exports
  │   │
  │   └── index.ts                ← Central export (v1+v2+v3)
  │
  ├── seed-system/                ← Seed infrastructure
  │   ├── context/
  │   │   └── SeedContext.tsx     → Seed management
  │   ├── resolver/
  │   │   └── seed-resolver.ts    → Seed resolution logic
  │   ├── navigation/
  │   │   ├── SeedLink.tsx        → Link with seed preservation
  │   │   ├── useSeedRouter.ts    → Router with seed
  │   │   └── routing-utils.ts    → Routing helpers
  │   └── index.ts                → Exports
  │
  ├── app/                        ← Pages (non-dynamic)
  ├── components/                 ← Business components (non-dynamic)
  ├── context/                    ← Other contexts
  └── ...
```

### Why This Structure?

**Clear Separation:**
- **Core web code** (app/, components/) vs **Dynamic code** (dynamic/)
- **V1** (layouts) vs **V2** (data) vs **V3** (anti-scraping)
- Easy to find: "Where's the V3 anti-scraping?" → `dynamic/v3-dynamic/`

**Reusable:**
- V1 layouts are common → can be shared
- V2 and V3 are web-specific → kept separate
- Same structure across all 11 webs → easy to understand

**Maintainable:**
- Add new variants? → Edit JSON files in `v3-dynamic/data/`
- Change V3 logic? → Edit hooks/utils in `v3-dynamic/`
- Everything in one place

### Import Patterns

All imports use the `@/dynamic/*` path:

```typescript
// Simple webs (3, 4, 7, 8, 9) - Direct V3 attributes
import { useV3Attributes } from '@/dynamic/v3-dynamic';

const MyComponent = () => {
  const { getText, getId, getClass, getElementAttributes } = useV3Attributes();
  
  return (
    <button
      {...getElementAttributes('book-button', 0)}
      className={getClass('button-primary', 'btn-primary')}
    >
      {getText('book_now', 'Book Now')}
    </button>
  );
};
```

```typescript
// Advanced webs (10, 11, 12, 13) - Layout + V3
import { useSeedLayout } from '@/dynamic/v3-dynamic';

const MyComponent = () => {
  const { layout, getText, getId, getElementAttributes } = useSeedLayout();
  
  // layout object contains V1 configuration
  const buttonPosition = layout.buttonPositions?.submit || 'right';
  
  return (
    <button
      {...getElementAttributes('submit-button', 0)}
      className={buttonPosition === 'left' ? 'ml-0' : 'ml-auto'}
    >
      {getText('submit', 'Submit')}
    </button>
  );
};
```

### V3 Anti-Scraping System Details

The `v3-dynamic/` folder contains a **robust anti-scraping system** that:

1. **Semantic IDs** - Not predictable patterns
   - ❌ Bad: `button-1`, `button-2`, `button-seed-23`
   - ✅ Good: `book-btn`, `reserve-btn`, `submit-booking` (changes with seed)

2. **Dynamic Classes** - CSS selectors break
   - Changes: `btn-primary` → `button-main` → `action-button` (based on seed)
   - 10 variants per class type

3. **Text Variations** - Text-based selectors break
   - Changes: "Add to Cart" → "Add to Basket" → "Include in Cart" (based on seed)
   - 10 variants per text key

4. **Data Attributes** - XPath changes
   - Adds: `data-seed`, `data-variant`, `data-xpath`
   - Makes scrapers fragile

**Example semantic-ids.json:**
```json
{
  "search-input": [
    "search-input",
    "query-box",
    "filter-input",
    "product-search",
    "item-search",
    "search-field",
    "lookup-input",
    "find-input",
    "type-to-search",
    "search-box"
  ]
}
```

Each element type has **10 semantic variations**, selected deterministically by the v3 seed.

---

## Code Examples

### Example 1: Basic Usage

**URL:** `http://localhost:8004/?seed=23`

**What happens:**

1. SeedContext reads `seed=23`
2. Calls `/seeds/resolve?seed=23&v1_enabled=true&v2_enabled=true&v3_enabled=true`
3. Receives: `{base: 23, v1: 74, v2: 237, v3: 37}`
4. Applies:
   - Layout changes to variant #5
   - Loads data subset with seed 237
   - Applies text variant #8

---

### Example 2: Control Versions with URL

**URL:** `http://localhost:8004/?seed=23&enable_dynamic=v1`

**What happens:**

1. SeedContext reads `enable_dynamic=v1`
2. Calls `/seeds/resolve?seed=23&v1_enabled=true&v2_enabled=false&v3_enabled=false`
3. Receives: `{base: 23, v1: 74, v2: null, v3: null}`
4. Applies:
   - ✅ Layout changes to variant #5 (v1 enabled)
   - ❌ Data stays default (v2 disabled)
   - ❌ Text stays default (v3 disabled)

---

### Example 3: Using SeedLink in Components

```typescript
import { SeedLink } from "@/seed-system";

function MyComponent() {
  return (
    <div>
      {/* Automatically preserves ?seed=23&enable_dynamic=v1,v2 */}
      <SeedLink href="/profile">Go to Profile</SeedLink>

      {/* External links are left unchanged */}
      <SeedLink href="https://google.com">Google</SeedLink>
    </div>
  );
}
```

---

### Example 4: Programmatic Navigation

```typescript
import { useSeedRouter } from "@/seed-system";

function MyComponent() {
  const router = useSeedRouter();

  const handleClick = () => {
    // Automatically preserves ?seed=23&enable_dynamic=v1,v2
    router.push("/dashboard");
    // → Navigates to: /dashboard?seed=23&enable_dynamic=v1,v2
  };

  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

---

### Example 5: Using Resolved Seeds in Components

```typescript
import { useSeed } from "@/seed-system";

function MyComponent() {
  const { seed, resolvedSeeds } = useSeed();

  console.log("Base seed:", resolvedSeeds.base); // 23
  console.log("Layout seed:", resolvedSeeds.v1); // 74
  console.log("Data seed:", resolvedSeeds.v2); // 237
  console.log("Text seed:", resolvedSeeds.v3); // 37

  // Use v1 for layout
  const layoutSeed = resolvedSeeds.v1 ?? resolvedSeeds.base;

  // Use v2 for data loading (or read from window)
  const v2Seed = resolvedSeeds.v2;

  // Use v3 for text variants
  const textSeed = resolvedSeeds.v3 ?? resolvedSeeds.v1 ?? resolvedSeeds.base;

  return <div>Current seed: {seed}</div>;
}
```

---

## URL Parameters Reference

### `?seed=X` (Primary Parameter)

| Value | Range | Default | Persisted                |
| ----- | ----- | ------- | ------------------------ |
| X     | 1-999 | 1       | Yes (URL + localStorage) |

**Priority:**

1. URL parameter (highest)
2. localStorage backup
3. Default value (1)

---

### `?enable_dynamic=v1,v2,v3` (Control Parameter)

| Value      | v1  | v2  | v3  | Result                 |
| ---------- | --- | --- | --- | ---------------------- |
| `v1`       | ✅  | ❌  | ❌  | Only layout changes    |
| `v2`       | ❌  | ✅  | ❌  | Only data changes      |
| `v3`       | ❌  | ❌  | ✅  | Only text changes      |
| `v1,v2`    | ✅  | ✅  | ❌  | Layout + data          |
| `v1,v2,v3` | ✅  | ✅  | ✅  | Everything changes     |
| _(none)_   | env | env | env | Uses deployment config |

**Priority:**

1. URL parameter (user override)
2. Environment variables (deployment default)
3. All disabled (if no config)

---

## Version Details

### v1 - Layout/Structure

**Purpose:** Change HTML structure and layout organization  
**Formula:** `v1 = (baseSeed × 29 + 7) % 300 + 1`  
**Range:** 1-300  
**Maps to:** Layout variant 1-10  
**Mapping:** `layoutIndex = ((v1 % 30) + 1) % 10 || 10`

**Common:** ✅ **SAME formula in ALL webs**

**Example:**

```
seed=23 → v1=74 → layoutIndex=5 → Uses Layout #5 of 10
seed=50 → v1=212 → layoutIndex=3 → Uses Layout #3 of 10
```

**What changes:**

- Header organization
- Navigation position
- Content grid layout
- Card layouts
- Button styles
- Footer structure

---

### v2 - Data Selection

**Purpose:** Load different data subsets from master pools  
**Formula:** `v2 = (baseSeed × 53 + 17) % 300 + 1`  
**Range:** 1-300  
**No additional mapping:** Uses v2 directly as seed

**Specific:** ✅ **Each web loads different entities**

**Example:**

```
seed=23 → v2=237

web_1 (autocinema):  Loads movies #1-100 from pool with seed=237
web_2 (autobooks):   Loads books #1-100 from pool with seed=237
web_5 (autocrm):     Loads clients #1-100 from pool with seed=237
web_11 (calendar):   Loads events #1-200 from pool with seed=237
```

**How it works:**

1. **SeedContext** syncs to window: `window.__autocrmV2Seed = 237`
2. **Data loader** reads: `getRuntimeV2Seed()` → `237`
3. **Calls API:** `GET /datasets/load?seed=237&project=web_5&entity=clients`
4. **Server** returns deterministic subset based on seed

**What changes:**

- Which products/movies/clients/hotels are shown
- Order of items
- Data distribution across categories

---

### v3 - Text/Style Variants

**Purpose:** Change text content and dynamic styling  
**Formula:** `v3 = (baseSeed × 71 + 3) % 100 + 1`  
**Range:** 1-100  
**Maps to:** Text variant 1-10 (usually)  
**Mapping:** `textVariant = ((v3 - 1) % 10) + 1`

**Specific:** ✅ **Each web has its own text variations**

**Example:**

```
seed=23 → v3=37 → textVariant=7 → Uses Text Variant #7

web_5: Button says "Add Client" (variant 7)
web_11: Button says "Create Event" (variant 7)
```

**What changes:**

- Button labels
- Heading text
- Placeholder text
- Element IDs (for XPath)
- Dynamic class names

---

## Navigation & Seed Persistence

### How Seed is Preserved

**Problem:** Without the system, seed would be lost when clicking links.

**Solution:** All navigation automatically preserves seed.

---

### SeedLink Component

**Replaces:** Standard `<Link>` from Next.js

**Usage:**

```typescript
// ❌ OLD WAY (loses seed):
<Link href="/dashboard">Dashboard</Link>
// User at: /?seed=23
// Navigates to: /dashboard  ← SEED LOST!

// ✅ NEW WAY (preserves seed):
<SeedLink href="/dashboard">Dashboard</SeedLink>
// User at: /?seed=23&enable_dynamic=v1,v2
// Navigates to: /dashboard?seed=23&enable_dynamic=v1,v2  ← PRESERVED!
```

**Implementation (SAME in all webs):**

```typescript
export function SeedLink({
  href,
  preserveSeed = true,
  ...props
}: SeedLinkProps) {
  const { getNavigationUrl } = useSeed();
  const finalHref =
    !preserveSeed || href.startsWith("http") ? href : getNavigationUrl(href);
  return <Link href={finalHref} {...props} />;
}
```

---

### useSeedRouter Hook

**Replaces:** Standard `useRouter()` from Next.js

**Usage:**

```typescript
// ❌ OLD WAY (loses seed):
const router = useRouter();
router.push("/settings"); // → /settings (SEED LOST!)

// ✅ NEW WAY (preserves seed):
const router = useSeedRouter();
router.push("/settings"); // → /settings?seed=23&enable_dynamic=v1,v2
```

**Implementation (SAME in all webs):**

```typescript
export function useSeedRouter() {
  const router = useNextRouter();
  const { getNavigationUrl } = useSeed();

  const push = useCallback(
    (href: string, options?: NavigateOptions) => {
      const urlWithSeed = getNavigationUrl(href);
      return router.push(urlWithSeed, options);
    },
    [router, getNavigationUrl]
  );

  const replace = useCallback(
    (href: string, options?: NavigateOptions) => {
      const urlWithSeed = getNavigationUrl(href);
      return router.replace(urlWithSeed, options);
    },
    [router, getNavigationUrl]
  );

  return { ...router, push, replace };
}
```

---

## Testing

### Test Different Seeds

```bash
# Test different layout/data combinations
http://localhost:8004/?seed=1      # Configuration A
http://localhost:8004/?seed=50     # Configuration B
http://localhost:8004/?seed=100    # Configuration C
http://localhost:8004/?seed=250    # Configuration D
```

### Test Version Control

```bash
# Only layout changes
http://localhost:8004/?seed=23&enable_dynamic=v1

# Only data changes
http://localhost:8004/?seed=23&enable_dynamic=v2

# Layout + data
http://localhost:8004/?seed=23&enable_dynamic=v1,v2

# Everything
http://localhost:8004/?seed=23&enable_dynamic=v1,v2,v3
```

### Test Navigation Persistence

1. Visit: `http://localhost:8004/?seed=23`
2. Click on any internal link
3. ✅ Verify URL still has `?seed=23`
4. Navigate to profile, settings, any page
5. ✅ Verify seed persists across all pages

### Test API Endpoint Directly

```bash
# Test seed resolution endpoint
curl "http://localhost:8090/seeds/resolve?seed=23&v1_enabled=true&v2_enabled=true&v3_enabled=false"

# Response:
{
  "base": 23,
  "v1": 74,
  "v2": 237,
  "v3": null
}
```

---

## Guarantees

### ✅ Seed Never Lost

**Guaranteed:** Seed is preserved across ALL navigation

**How:**

- All `<Link>` use `SeedLink`
- All `router.push()` use `useSeedRouter()`
- `getNavigationUrl()` automatically appends seed
- localStorage backup if seed removed from URL

---

### ✅ Centralized Derivation

**Guaranteed:** All webs use same formulas

**Where:** `webs_server/src/seed_resolver.py` (single source of truth)

**Formulas:**

- `v1 = (seed × 29 + 7) % 300 + 1`
- `v2 = (seed × 53 + 17) % 300 + 1`
- `v3 = (seed × 71 + 3) % 100 + 1`

---

### ✅ Deterministic Behavior

**Guaranteed:** Same seed always produces same result

**Example:**

```
seed=23 (always):
  → v1=74  (always)
  → v2=237 (always)
  → v3=37  (always)
  → Layout #5 (always)
  → Same data subset (always)
```

---

### ✅ Homogeneous Code

**Guaranteed:** All 13 webs follow identical pattern

**Verified:**

- ✅ Same file structure
- ✅ Same seed-resolver code
- ✅ Same SeedContext pattern
- ✅ Same navigation helpers
- ✅ Same data loading pattern
- ✅ Same layout mapping formula

---

## Troubleshooting

### Seed is Lost After Navigation

**Symptoms:** After clicking a link, URL shows `/profile` instead of `/profile?seed=23`

**Causes:**

1. Using `<Link>` instead of `<SeedLink>`
2. Using `router.push()` instead of `useSeedRouter()`

**Fix:**

```typescript
// ❌ Wrong:
import Link from "next/link";
<Link href="/profile">Profile</Link>;

// ✅ Correct:
import { SeedLink } from "@/components/ui/SeedLink";
<SeedLink href="/profile">Profile</SeedLink>;
```

---

### Data Not Changing with Seed

**Symptoms:** Changing `?seed=X` doesn't change the data

**Causes:**

1. v2 not enabled: `?enable_dynamic=v1` (missing v2)
2. Data loader not reading from window
3. SeedContext not syncing to window

**Check:**

```typescript
// In browser console:
console.log(window.__autocrmV2Seed); // Should show a number

// If undefined, SeedContext is not syncing
```

**Fix:** Ensure SeedContext has this code:

```typescript
useEffect(() => {
  if (typeof window === "undefined") return;
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
  window.__autocrmV2Seed = v2Seed;
}, [resolvedSeeds.v2, resolvedSeeds.base]);
```

---

### Layout Not Changing with Seed

**Symptoms:** Changing `?seed=X` doesn't change the layout

**Causes:**

1. v1 not enabled: `?enable_dynamic=v2` (missing v1)
2. Layout code not reading `resolvedSeeds.v1`
3. Dynamic mode disabled in env vars

**Check:**

```typescript
// In browser console:
import { useSeed } from "@/context/SeedContext";
const { resolvedSeeds } = useSeed();
console.log(resolvedSeeds.v1); // Should show a number (1-300)
```

**Fix:** Ensure layout code reads from SeedContext:

```typescript
const { resolvedSeeds } = useSeedContext();
const layoutSeed = resolvedSeeds.v1 ?? resolvedSeeds.base;
```

---

### Multiple Renders / Performance Issues

**Symptoms:** Component re-renders multiple times, console shows repeated logs

**Causes:**

1. Missing cleanup in `useEffect`
2. Dependencies not properly set

**Fix:** SeedContext should have cleanup:

```typescript
useEffect(() => {
  let cancelled = false;

  resolveSeeds(seed).then((resolved) => {
    if (!cancelled) {
      setResolvedSeeds(resolved);
    }
  });

  return () => {
    cancelled = true; // ← CLEANUP
  };
}, [seed]);
```

---

## Deployment

### Environment Variables

**For enabling versions by default:**

```bash
# Docker compose or .env file
NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true              # Enable layout variations
NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE=true      # Enable data selection
NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true              # Enable text variants
NEXT_PUBLIC_API_URL=http://localhost:8090       # webs_server URL
```

**Deploy examples:**

```bash
# All versions enabled (default)
./scripts/setup.sh --demo=autodining --enabled_dynamic_versions=v1,v2,v3

# Only layout and data
./scripts/setup.sh --demo=autodining --enabled_dynamic_versions=v1,v2

# Only data
./scripts/setup.sh --demo=autodining --enabled_dynamic_versions=v2
```

---

## Summary

### The Unified Seed System provides:

1. **Single URL parameter** (`?seed=X`) controls everything
2. **Centralized derivation** (webs_server calculates v1, v2, v3)
3. **Common where it should be** (v1 layout formulas)
4. **Specific where it should be** (v2 data, v3 text per web)
5. **Automatic preservation** (seed never lost in navigation)
6. **Clean architecture** (homogeneous code across 13 webs)

### Key Principle:

> **One seed to rule them all**  
> From a single `?seed=23`, the system deterministically derives all variations needed for layout, data, and text across any web application.

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                       USER ACCESSES                              │
│                 ?seed=23&enable_dynamic=v1,v2                    │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                      SeedContext.tsx                             │
│                  (IDENTICAL in all 13 webs)                      │
│                                                                  │
│  1. Read seed=23 from URL                                        │
│  2. Read enable_dynamic=v1,v2 from URL                           │
│  3. Call webs_server/seeds/resolve                               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    webs_server (Python API)                      │
│                                                                  │
│  Receives: seed=23, v1_enabled=true, v2_enabled=true            │
│                                                                  │
│  Calculates:                                                     │
│    v1 = (23 × 29 + 7) % 300 + 1 = 74                            │
│    v2 = (23 × 53 + 17) % 300 + 1 = 237                          │
│    v3 = null (disabled)                                          │
│                                                                  │
│  Returns: {base: 23, v1: 74, v2: 237, v3: null}                 │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                      SeedContext.tsx                             │
│                                                                  │
│  Stores: resolvedSeeds = {base: 23, v1: 74, v2: 237, v3: null} │
│  Syncs:  window.__*V2Seed = 237                                 │
│  Persists: localStorage.setItem("*_seed_base", "23")            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    ┌───v1──┐           ┌────v2────┐         ┌────v3────┐
    │ v1=74 │           │ v2=237   │         │ v3=null  │
    └───────┘           └──────────┘         └──────────┘
        │                     │                     │
        ↓                     ↓                     ↓
┌─────────────┐    ┌──────────────────┐    ┌──────────────┐
│   LAYOUT    │    │      DATA        │    │     TEXT     │
│             │    │                  │    │              │
│ Common:     │    │ Specific:        │    │ Specific:    │
│ Formula     │    │ Each web loads   │    │ Each web has │
│ identical   │    │ its entities     │    │ its variants │
│ in all webs │    │ (movies, books,  │    │              │
│             │    │  clients, etc.)  │    │              │
│             │    │                  │    │              │
│ layoutIndex │    │ getRuntimeV2Seed │    │ textVariants │
│ = ((74%30)  │    │ → window.__*Seed │    │ .json        │
│   +1)%10    │    │ fetchSeeded...   │    │              │
│ = 5         │    │ (seed=237)       │    │              │
│             │    │                  │    │              │
│ Layout #5   │    │ Subset 237       │    │ (default)    │
└─────────────┘    └──────────────────┘    └──────────────┘
```

---

## Quick Reference

### For Developers

**Adding a new link:**

```typescript
import { SeedLink } from "@/components/ui/SeedLink";
<SeedLink href="/page">Go</SeedLink>;
```

**Programmatic navigation:**

```typescript
import { useSeedRouter } from "@/hooks/useSeedRouter";
const router = useSeedRouter();
router.push("/page");
```

**Reading current seeds:**

```typescript
import { useSeed } from "@/context/SeedContext";
const { seed, resolvedSeeds } = useSeed();
console.log("Base:", resolvedSeeds.base);
console.log("Layout:", resolvedSeeds.v1);
console.log("Data:", resolvedSeeds.v2);
console.log("Text:", resolvedSeeds.v3);
```

**Creating a data loader:**

```typescript
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__mywebV2Seed;
  return typeof value === "number" ? value : null;
};

export async function initializeMyData(v2Seed?: number | null) {
  const dbMode = isDbLoadModeEnabled();
  let effectiveSeed = 1;

  if (dbMode) {
    if (typeof window !== "undefined") {
      await new Promise((r) => setTimeout(r, 100)); // Wait for sync
    }
    effectiveSeed = v2Seed ?? getRuntimeV2Seed() ?? 1;
  }

  return await fetchSeededSelection({
    projectKey: "my_web",
    entityType: "my_entity",
    seedValue: effectiveSeed,
    limit: 100,
  });
}
```

---

## Webs Inventory

| #   | Name         | Port | v1 (Layout) | v2 (Data)      | v3 (Text) | Status      |
| --- | ------------ | ---- | ----------- | -------------- | --------- | ----------- |
| 1   | autocinema   | 8001 | ✅          | ✅ movies      | ✅        | ✅ Standard |
| 2   | autobooks    | 8002 | ✅          | ✅ books       | ✅        | ✅ Standard |
| 3   | autozone     | 8003 | ✅          | ✅ products    | ✅        | ✅ Standard |
| 4   | autodining   | 8004 | ✅          | ✅ restaurants | ✅        | ✅ Standard |
| 5   | autocrm      | 8005 | ✅          | ✅ clients     | ✅        | ✅ Standard |
| 6   | automail     | 8006 | ✅          | ✅ emails      | ✅        | ✅ Standard |
| 7   | autodelivery | 8007 | ✅          | ✅ restaurants | ✅        | ✅ Standard |
| 8   | autolodge    | 8008 | ✅          | ✅ hotels      | ✅        | ✅ Standard |
| 9   | autoconnect  | 8009 | ✅          | ✅ connections | ✅        | ✅ Standard |
| 10  | autowork     | 8010 | ✅          | ✅ experts     | ✅        | ✅ Standard |
| 11  | autocalendar | 8011 | ✅          | ✅ events      | ✅        | ✅ Standard |
| 12  | autolist     | 8012 | ✅          | ✅ tasks       | ✅        | ✅ Standard |
| 13  | autodrive    | 8013 | ✅          | ✅ trips       | ✅        | ✅ Standard |

**All 13 webs:** ✅ Fully standardized and homogeneous

---

## Version History

### v2.0 (Current)

- ✅ Unified seed system with single `?seed=X` parameter
- ✅ Centralized seed resolution in `webs_server`
- ✅ Homogeneous implementation across all 13 webs
- ✅ `enable_dynamic` URL parameter support
- ✅ Automatic seed preservation in navigation
- ✅ Common layout formula across all webs

### v1.0 (Legacy)

- ❌ Multiple URL parameters (`?seed=X&v2-seed=Y&seed-structure=Z`)
- ❌ Each web calculated its own seeds
- ❌ Inconsistent formulas
- ❌ Seed sometimes lost in navigation

---

## Contact & Support

For questions about the Unified Seed System:

1. Check this README first
2. Review the code examples above
3. Test with different seed values
4. Verify `webs_server` is running on port 8090

---

**Remember:** All 13 webs work **exactly the same way**. If you understand one, you understand them all! 🎯
