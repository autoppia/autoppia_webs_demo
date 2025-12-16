# Dynamic System Documentation

## Overview

The Dynamic System is a comprehensive anti-scraping solution that dynamically modifies web page structure and content based on a single numerical `seed` parameter from the URL. The system consists of three main components:

- **V1**: Modifies DOM structure (wrappers and decoys) to break XPath selectors
- **V2**: Provides dynamic data loading (currently disabled - uses original data)
- **V3**: Modifies attributes and text content (IDs, CSS classes, texts) to prevent selector memorization

V1 and V3 work independently and can be enabled/disabled via environment variables. V2 is currently disabled and will provide randomized data when enabled. The system is designed to be deterministic: the same seed always produces the same output, ensuring consistency while preventing scrapers from memorizing fixed selectors.

## Table of Contents

1. [Architecture](#architecture)
2. [Core Concepts](#core-concepts)
3. [V1: DOM Structure Modification](#v1-dom-structure-modification)
4. [V2: Dynamic Data Loading](#v2-dynamic-data-loading)
5. [V3: Attribute and Text Variation](#v3-attribute-and-text-variation)
6. [Implementation Details](#implementation-details)
7. [Usage Guide](#usage-guide)
8. [Configuration](#configuration)
9. [Best Practices](#best-practices)

---

## Architecture

### Directory Structure

```
src/dynamic/
  ├── v1/                    # V1: DOM structure (wrappers/decoy)
  │   ├── add-wrap-decoy.ts  # applyV1Wrapper function
  │   ├── change-order-elements.ts  # generateDynamicOrder function
  │   └── index.ts
  │
  ├── v2-data/               # V2: Data loading (separate system)
  │   ├── data-provider.ts
  │   └── index.ts
  │
  ├── v3/                    # V3: Attributes and texts
  │   ├── utils/
  │   │   └── variant-selector.ts  # Unified getVariant() function
  │   ├── data/              # Global variant JSON files
  │   │   ├── id-variants.json
  │   │   ├── class-variants.json
  │   │   └── text-variants.json
  │   └── index.ts
  │
  ├── shared/                # Shared utilities
  │   ├── core.ts            # Core functions + useDynamicSystem hook
  │   ├── flags.ts           # Feature flags (isV1Enabled, isV3Enabled)
  │   └── index.ts
  │
  └── index.ts               # Main export
```

### Key Components

1. **`useDynamicSystem()` Hook**: Central hook that provides access to all dynamic functionality
2. **`getVariant()` Function**: Unified function for selecting variants (IDs, classes, texts)
3. **`selectVariantIndex()` Function**: Core deterministic function that calculates variant indices
4. **`generateDynamicOrder()` Function**: Generates dynamic permutations for element ordering
5. **`applyV1Wrapper()` Function**: Applies V1 wrappers and decoys to elements
6. **`DynamicDataProvider`**: Singleton class that manages V2 data loading

---

## Core Concepts

### Seed System

The entire system is driven by a single numerical `seed` parameter extracted from the URL:

- **URL Format**: `/?seed=42` or `/search?seed=123`
- **Default**: If no seed is provided, defaults to `1`
- **Range**: Typically 1-999 (can be extended)
- **Deterministic**: Same seed always produces the same output

### Key Principle: `selectVariantIndex(seed, key, count)`

This is the core function that makes everything deterministic:

```typescript
selectVariantIndex(seed: number, key: string, count: number): number
```

**How it works:**
1. Combines `seed` and `key` into a unique string: `"${key}:${seed}"`
2. Generates a deterministic hash from this string
3. Returns an index between `0` and `count-1` using modulo operation

**Example:**
```typescript
selectVariantIndex(42, "movie-card", 3)  // → 1 (always 1 with seed 42)
selectVariantIndex(42, "search-button", 3)  // → 2 (different because key is different)
selectVariantIndex(100, "movie-card", 3)  // → 0 (different because seed is different)
```

**Why this matters:**
- Each component has its own independent variant selection
- The same component always gets the same variant with the same seed
- Different components can have different variants simultaneously

### Seed = 1: The Original Version

**Critical Rule**: `seed=1` always returns the first variant (index 0), which represents the "original" or "base" version of the website.

This ensures:
- The default/fallback version is always consistent
- Users can always access the "original" design with `?seed=1`
- The system gracefully degrades when V1/V3 are disabled

---

## V1: DOM Structure Modification

### Purpose

V1 breaks XPath selectors by adding invisible structural elements (wrappers and decoys) to the DOM. This prevents scrapers from using memorized XPath paths.

### How It Works

**Wrappers:**
- Adds `<div>` or `<span>` elements around components
- Always uses 2 variants: `0` = no wrapper, `1` = with wrapper
- Wrappers are visible but don't affect layout (use `w-full h-full` classes when needed)
- Automatically uses `<div>` for certain component keys (input-container, form, search, feature-card, genre-card, stats-card)

**Decoys:**
- Adds invisible `<span>` elements before or after components
- Always uses 3 variants: `0` = no decoy, `1` = decoy before, `2` = decoy after
- **Currently enabled** - Decoys are active and working
- Marked with `aria-hidden="true"` and `hidden` class
- Don't affect layout or visual appearance

### Implementation

```typescript
// Simple usage - always uses 2 wrapper variants (0=no wrapper, 1=with wrapper)
// and 3 decoy variants (0=no decoy, 1=decoy before, 2=decoy after)
{dyn.v1.addWrapDecoy("movie-card", <div>...</div>)}
```

**How it works:**
1. Always uses 2 wrapper variants: `0` = no wrapper, `1` = with wrapper
2. Always uses 3 decoy variants: `0` = no decoy, `1` = decoy before, `2` = decoy after
3. `selectVariantIndex(seed, "movie-card-wrapper", 2)` → Returns 0 or 1
4. `selectVariantIndex(seed, "movie-card-decoy", 3)` → Returns 0, 1, or 2
5. If `seed=1`: Always returns 0 for both (no wrappers, no decoys - original version)
6. If V1 is disabled: Returns children unchanged
7. **Decoys are enabled** - They add invisible elements before or after components

### Detailed Step-by-Step Process

When you call `dyn.v1.addWrapDecoy("button", <button>Click</button>)`, here's what happens:

#### Step 1: Check if V1 is enabled
```typescript
if (!isV1Enabled()) {
  return children;  // Returns <button>Click</button> unchanged
}
```
- If V1 is OFF → Returns the button unchanged
- If V1 is ON → Continues

#### Step 2: Check if seed = 1 (original version)
```typescript
if (seed === 1) {
  wrapperVariant = 0;  // No wrapper
  decoyVariant = 0;    // No decoy
}
```
- If `seed=1` → Returns button unchanged (original version)
- If `seed≠1` → Continues

#### Step 3: Calculate wrapper variant (always 2 options)
```typescript
const wrapperVariants = 2;  // Always 2
wrapperVariant = selectVariantIndex(seed, "button-wrapper", 2);
// Returns: 0 or 1
```

With `seed=42`:
- `selectVariantIndex(42, "button-wrapper", 2)` → Returns `0` or `1`
- If `0` → No wrapper
- If `1` → With wrapper

#### Step 4: Calculate decoy variant (always 3 options)
```typescript
const decoyVariants = 3;  // Always 3
decoyVariant = selectVariantIndex(seed, "button-decoy", 3);
// Returns: 0, 1, or 2
```

With `seed=42`:
- `selectVariantIndex(42, "button-decoy", 3)` → Returns `0`, `1`, or `2`
- If `0` → No decoy
- If `1` → Decoy before
- If `2` → Decoy after

#### Step 5: Apply wrapper (if needed)
```typescript
const shouldWrap = wrapperVariant > 0;  // If 1 → true, if 0 → false

if (shouldWrap) {
  // Adds wrapper
  return <span data-dyn-wrap="button"><button>Click me</button></span>
} else {
  // No wrapper
  return <button>Click me</button>
}
```

**Note**: Some component keys automatically use `<div>` instead of `<span>` for wrappers:
- Keys containing: `"input-container"`, `"form"`, `"search"`, `"feature-card"`, `"genre-card"`, `"stats-card"`
- These use `<div className="w-full h-full">` to prevent layout issues

#### Step 6: Apply decoy (if needed)
```typescript
const decoysEnabled = true;  // Decoys are enabled

if (decoyVariant === 0) {
  return core;  // Only returns wrapper (or button if no wrapper)
}

// Create invisible decoy element
const decoy = <span className="hidden" aria-hidden="true" data-decoy="..." />

if (decoyVariant === 1) {
  return [decoy, core];  // Decoy before
}

if (decoyVariant >= 2) {
  return [core, decoy];  // Decoy after
}
```

### Visual Examples

#### Example 1: `seed=1` (Original version)
```typescript
{dyn.v1.addWrapDecoy("button", <button>Click</button>)}
```
**Result:**
```html
<button>Click</button>
```
No wrapper, no decoy.

---

#### Example 2: `seed=42`, wrapper=0, decoy=0
```typescript
{dyn.v1.addWrapDecoy("button", <button>Click</button>)}
```
**Result:**
```html
<button>Click</button>
```
No wrapper, no decoy.

---

#### Example 3: `seed=42`, wrapper=1, decoy=0
```typescript
{dyn.v1.addWrapDecoy("button", <button>Click</button>)}
```
**Result:**
```html
<span data-dyn-wrap="button" data-v1="true" data-wrapper-variant="1">
  <button>Click</button>
</span>
```
With wrapper, no decoy.

---

#### Example 4: `seed=42`, wrapper=0, decoy=1 (decoy before)
```typescript
{dyn.v1.addWrapDecoy("button", <button>Click</button>)}
```
**Result:**
```html
<span class="hidden" aria-hidden="true" data-decoy="decoy-button-decoy-123" data-v1="true" data-decoy-variant="1"></span>
<button>Click</button>
```
No wrapper, decoy before (invisible).

---

#### Example 5: `seed=42`, wrapper=1, decoy=1 (wrapper + decoy before)
```typescript
{dyn.v1.addWrapDecoy("button", <button>Click</button>)}
```
**Result:**
```html
<span class="hidden" aria-hidden="true" data-decoy="decoy-button-decoy-123" data-v1="true" data-decoy-variant="1"></span>
<span data-dyn-wrap="button" data-v1="true" data-wrapper-variant="1">
  <button>Click</button>
</span>
```
With wrapper, decoy before.

---

#### Example 6: `seed=42`, wrapper=1, decoy=2 (wrapper + decoy after)
```typescript
{dyn.v1.addWrapDecoy("button", <button>Click</button>)}
```
**Result:**
```html
<span data-dyn-wrap="button" data-v1="true" data-wrapper-variant="1">
  <button>Click</button>
</span>
<span class="hidden" aria-hidden="true" data-decoy="decoy-button-decoy-123" data-v1="true" data-decoy-variant="2"></span>
```
With wrapper, decoy after.

---

#### Example 7: Special case - `componentKey` with "input-container"
```typescript
{dyn.v1.addWrapDecoy("search-input-container", <input />)}
```
**Result (if wrapper=1):**
```html
<div data-dyn-wrap="search-input-container" data-v1="true" data-wrapper-variant="1" class="w-full h-full">
  <input />
</div>
```
Uses `<div>` instead of `<span>` because the key includes "input-container".

### All Possible Combinations

With `seed≠1` and V1 enabled, there are **6 possible combinations**:

| Wrapper | Decoy | Result HTML |
|---------|-------|------------|
| 0 | 0 | `<button>Click</button>` |
| 0 | 1 | `<span hidden>...</span><button>Click</button>` |
| 0 | 2 | `<button>Click</button><span hidden>...</span>` |
| 1 | 0 | `<span><button>Click</button></span>` |
| 1 | 1 | `<span hidden>...</span><span><button>Click</button></span>` |
| 1 | 2 | `<span><button>Click</button></span><span hidden>...</span>` |

### Decoy Characteristics

- **Invisible**: Uses `className="hidden"` and `aria-hidden="true"`
- **Doesn't affect layout**: Hidden elements don't take up space
- **Breaks XPath**: Scrapers using fixed XPath will fail
- **Deterministic**: Same seed = same result always
- **Accessible**: Marked with `aria-hidden="true"` for screen readers

### Dynamic Ordering

V1 also provides dynamic reordering of element arrays:

```typescript
const orderedItems = useMemo(() => {
  const order = dyn.v1.changeOrderElements("my-items", items.length);
  return order.map((idx) => items[idx]);
}, [dyn.seed, items]);
```

**How it works:**
- `seed=1`: Returns original order `[0, 1, 2, ..., n-1]`
- Other seeds: Generates deterministic permutations using:
  - Rotations
  - Pair swaps
  - Partial reversals
  - Hash-based shuffling

---

## V2: Dynamic Data Loading

### Purpose

V2 provides dynamic data loading based on the seed. When enabled, it will return randomized data (different movies, different content) based on the seed value. Currently, V2 is **disabled** and the system uses the original data.

### Current Status

**V2 is currently disabled** - The system loads data from the original source (local JSON files).

### How It Works

**When V2 is Disabled (Current State):**
- Loads data from original source (local JSON files)
- Returns the same data regardless of seed
- Simple and predictable behavior

**When V2 is Enabled (Future):**
- Will load randomized data based on the seed
- Same seed will always return the same randomized data (deterministic)
- Different seeds will return different data sets
- Prevents scrapers from memorizing specific data patterns

### Implementation

The V2 system is implemented through the `DynamicDataProvider` class:

```typescript
import { getMovies, getFeaturedMovies, searchMovies } from "@/dynamic/v2-data";

// Get all movies (uses original data when V2 is disabled)
const movies = getMovies();

// Get featured movies (uses original data when V2 is disabled)
const featured = getFeaturedMovies(6);

// Search movies (uses original data when V2 is disabled)
const results = searchMovies("action");
```

### Data Provider API

The `DynamicDataProvider` provides the following methods:

- `getMovies()`: Returns all movies
- `getMovieById(id)`: Returns a specific movie by ID
- `getFeaturedMovies(count)`: Returns featured movies
- `getRelatedMovies(movieId, limit)`: Returns related movies
- `searchMovies(query, filters)`: Searches movies by query and filters
- `getMoviesByGenre(genre)`: Returns movies by genre
- `getAvailableGenres()`: Returns list of available genres
- `getAvailableYears()`: Returns list of available years
- `whenReady()`: Returns a promise that resolves when data is loaded

### Future Implementation

When V2 is enabled, the data provider will:
1. Use the seed to generate a deterministic randomization
2. Shuffle/filter data based on the seed
3. Return different data sets for different seeds
4. Maintain consistency: same seed = same data

**Example (Future Behavior):**
```typescript
// Seed 1: Original data
getMovies() // → [Movie1, Movie2, Movie3, ...]

// Seed 42: Randomized data (deterministic)
getMovies() // → [Movie5, Movie1, Movie8, ...] (same order for seed 42)

// Seed 100: Different randomized data
getMovies() // → [Movie3, Movie7, Movie2, ...] (same order for seed 100)
```

### Simple Explanation

**Current (V2 Disabled):**
- The website always shows the same movies and data
- Simple and predictable
- Uses original data from JSON files

**Future (V2 Enabled):**
- The website will show different movies/data based on the seed
- Same seed = same data (deterministic)
- Different seed = different data
- Prevents scrapers from memorizing which movies appear where

---

## V3: Attribute and Text Variation

### Purpose

V3 prevents selector memorization by dynamically changing:
- **HTML IDs**: `"movie-card"` → `"film-card"` (based on seed)
- **CSS Classes**: `"button"` → `"btn-primary"` (based on seed)
- **Text Content**: `"View Details"` → `"See More"` (based on seed)

### Unified `getVariant()` Function

**Key Innovation**: A single function handles all variant types (IDs, classes, texts) using the same logic and structure.

```typescript
getVariant(seed: number, key: string, variants?: Record<string, string[]>, fallback?: string): string
```

**Search Priority:**
1. If a `variants` dictionary is provided → Search there first
2. If no dictionary provided → Automatically search in:
   - `ID_VARIANTS_MAP` (from `id-variants.json`)
   - `CLASS_VARIANTS_MAP` (from `class-variants.json`)
   - `TEXT_VARIANTS_MAP` (from `text-variants.json`)
3. If not found → Return `fallback` or `key` itself

### Variant Organization

**Global Variants (JSON files):**
- Used for elements that are reused across multiple components
- Stored in `v3/data/*.json` files
- Examples: `"view_details"`, `"search_placeholder"`, `"button"`

**Local Variants (Component dictionaries):**
- Used for elements specific to a single component
- Defined as dictionaries within the component file
- Examples: `"hero-section"`, `"feature_1_title"`

**Naming Convention:**
- Local ID variants: `dynamicV3IdsVariants`
- Local class variants: `dynamicV3ClassVariants`
- Local text variants: `dynamicV3TextVariants`

### Usage Examples

```typescript
// IDs: Using local dictionary
const dynamicV3IdsVariants: Record<string, string[]> = {
  "section": ["hero-section", "main-hero", "primary-hero"],
};
<input id={dyn.v3.getVariant("section", dynamicV3IdsVariants)} />

// IDs: Using global JSON
<input id={dyn.v3.getVariant("search-input", ID_VARIANTS_MAP)} />

// Classes: Using global JSON
<button className={dyn.v3.getVariant("button", CLASS_VARIANTS_MAP)} />

// Texts: Automatic search in TEXT_VARIANTS_MAP
<label>{dyn.v3.getVariant("search_placeholder", undefined, "Search...")}</label>

// Texts: Using local dictionary
const dynamicV3TextVariants: Record<string, string[]> = {
  "feature_1_title": ["Smart Search", "Búsqueda Inteligente", ...],
};
<h3>{dyn.v3.getVariant("feature_1_title", dynamicV3TextVariants)}</h3>
```

### JSON File Structure

**`id-variants.json`** and **`class-variants.json`**:
```json
{
  "movie-card": ["movie-card", "film-card", "movie-tile"],
  "search-input": ["search-input", "query-box", "filter-input"]
}
```

**`text-variants.json`** (key-based array format):
```json
{
  "search_placeholder": ["Search...", "Find...", "Look for..."],
  "view_details": ["View Details", "See More", "More Info"]
}
```

**Important**: Each key can have a different number of variants. There's no requirement for all keys to have the same number of variants.

---

## Implementation Details

### Core Functions

#### `hashString(value: string): number`
Generates a deterministic 32-bit integer hash from a string. Used internally by `selectVariantIndex`.

#### `selectVariantIndex(seed: number, key: string, count: number): number`
Core function that calculates which variant index to use:
- Combines `seed` and `key` into `"${key}:${seed}"`
- Hashes the combined string
- Returns `hash % count` (ensuring result is 0 to count-1)

#### `generateId(seed: number, key: string, prefix = "dyn"): string`
Generates unique IDs for V1 decoys. Used internally by `applyV1Wrapper`.

### Hook: `useDynamicSystem()`

The central React hook that provides access to all dynamic functionality:

```typescript
const dyn = useDynamicSystem();

// Access seed
dyn.seed  // Current seed value

// V1: Structure
dyn.v1.addWrapDecoy(componentKey, children, reactKey?)
dyn.v1.changeOrderElements(key, count)

// V3: Variants
dyn.v3.getVariant(key, variants?, fallback?)

// Utility
dyn.selectVariantIndex(key, count)
```

**Key Features:**
- Automatically obtains `seed` from `SeedContext` (which reads from URL)
- No need to pass `seed` manually
- Works even when V1/V3 are disabled (graceful degradation)
- Uses `useMemo` for performance optimization

### Seed Context Integration

The system integrates with Next.js Server Components and client-side hydration:

1. **Server-Side**: `page.tsx` reads `seed` from `searchParams` and passes it to `SeedContext`
2. **Client-Side**: `SeedContext` provides `seed` to all components via React Context
3. **Hydration Safety**: `window.__INITIAL_SEED__` is injected in `layout.tsx` to prevent mismatches

---

## Usage Guide

### Basic Component Example

```typescript
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";

export function MovieCard({ movie }: { movie: Movie }) {
  const dyn = useDynamicSystem();
  
  // Local variants (component-specific)
  const dynamicV3IdsVariants: Record<string, string[]> = {
    "card": ["movie-card", "film-card", "movie-tile"],
  };
  
  return (
    <>
      {/* V1: Añade wrapper/decoy */}
      {dyn.v1.addWrapDecoy("movie-card", (
        <div 
          id={dyn.v3.getVariant("card", dynamicV3IdsVariants)}
          className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP)}
        >
          <h3>{movie.title}</h3>
          
          {dyn.v1.addWrapDecoy("movie-card-button", (
            <button
              id={dyn.v3.getVariant("view-details-btn", ID_VARIANTS_MAP)}
              className={dyn.v3.getVariant("button", CLASS_VARIANTS_MAP)}
            >
              {dyn.v3.getVariant("view_details", undefined, "View Details")}
            </button>
          ))}
        </div>
      ))}
    </>
  );
}
```

### Dynamic Ordering Example

```typescript
const features = [
  { key: "feature_1", title: "Smart Search", ... },
  { key: "feature_2", title: "Vast Collection", ... },
  { key: "feature_3", title: "Curated Picks", ... },
  { key: "feature_4", title: "Trending Now", ... },
];

// Generate dynamic order
const orderedFeatures = useMemo(() => {
  const order = dyn.v1.changeOrderElements("features", features.length);
  return order.map((idx) => features[idx]);
}, [dyn.seed, features]);

// Render in dynamic order
{orderedFeatures.map((feature, displayIndex) => (
  <FeatureCard key={feature.key} {...feature} />
))}
```

### Component-Specific Variants Example

```typescript
export function HomeContent() {
  const dyn = useDynamicSystem();
  
  // Local text variants (only used in this component)
  const dynamicV3TextVariants: Record<string, string[]> = {
    feature_1_title: ["Smart Search", "Búsqueda Inteligente", ...],
    feature_1_description: ["Find movies instantly...", ...],
    app_title: ["Autocinema", "Autocinema", ...],
    // ... more variants
  };
  
  return (
    <div>
      <h1>{dyn.v3.getVariant("app_title", dynamicV3TextVariants)}</h1>
      
      {features.map((feature, i) => (
        <div key={feature.key}>
          <h3>{dyn.v3.getVariant(`feature_${i+1}_title`, dynamicV3TextVariants)}</h3>
          <p>{dyn.v3.getVariant(`feature_${i+1}_description`, dynamicV3TextVariants)}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Configuration

### Environment Variables

Control V1 and V3 via environment variables:

```bash
# .env.local
NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true
NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true
```

**Behavior when disabled:**
- **V1 OFF**: `dyn.v1.addWrapDecoy()` returns children unchanged
- **V3 OFF**: `dyn.v3.getVariant()` returns fallback or key itself

### Adding New Variants

**Global Variants (reusable):**
1. Edit the appropriate JSON file in `v3/data/`:
   - `id-variants.json` for IDs
   - `class-variants.json` for classes
   - `text-variants.json` for texts
2. Add your key with an array of variants:
   ```json
   {
     "my-new-key": ["variant1", "variant2", "variant3"]
   }
   ```
3. Use in components:
   ```typescript
   dyn.v3.getVariant("my-new-key", ID_VARIANTS_MAP)
   ```

**Local Variants (component-specific):**
1. Define dictionary in component:
   ```typescript
   const dynamicV3TextVariants: Record<string, string[]> = {
     "my-local-key": ["variant1", "variant2"],
   };
   ```
2. Use in component:
   ```typescript
   dyn.v3.getVariant("my-local-key", dynamicV3TextVariants)
   ```

---

## Best Practices

### 1. Use Unique Keys

✅ **Correct:**
```typescript
dyn.v1.addWrapDecoy("movie-card", ...)        // Component-specific
dyn.v1.addWrapDecoy("movie-card-button", ...) // Button within card
dyn.v3.getVariant("movie-card", ID_VARIANTS_MAP)
```

❌ **Incorrect:**
```typescript
dyn.v1.addWrapDecoy("card", ...)  // Too generic, may collide
dyn.v3.getVariant("button", ID_VARIANTS_MAP)  // Too generic
```

### 2. Organize Variants Properly

- **Global JSONs**: For elements used in multiple components
- **Local dictionaries**: For elements specific to one component
- **Naming**: Use consistent naming (`dynamicV3IdsVariants`, `dynamicV3TextVariants`, etc.)

### 3. Always Provide Fallbacks

```typescript
// Good: Provides fallback
dyn.v3.getVariant("search_placeholder", undefined, "Search...")

// Also good: Uses key as fallback
dyn.v3.getVariant("my-key", variants)  // Returns key if not found
```

### 4. Use `useMemo` for Dynamic Ordering

```typescript
// Good: Memoized
const orderedItems = useMemo(() => {
  const order = dyn.v1.changeOrderElements("items", items.length);
  return order.map((idx) => items[idx]);
}, [dyn.seed, items]);

// Bad: Recalculates on every render
const orderedItems = dyn.v1.changeOrderElements("items", items.length).map(...);
```

### 5. Seed = 1 is the Original

Always ensure `seed=1` returns the first variant (index 0), which represents the original/base version. This is handled automatically by the system.

### 6. Test with Different Seeds

When developing, test with multiple seeds to ensure:
- Variants change correctly
- Layout doesn't break
- Functionality remains intact
- Seed=1 always matches the original

---

## Testing and Validation

### Automated Testing Script

The system includes a comprehensive test script (`test-dynamic-system.js`) that validates:

- ✅ File structure (all required files exist)
- ✅ Variant files (sufficient keys and variants)
- ✅ Determinism (same seed = same result)
- ✅ DOM usage (wrappers, decoys, IDs, classes in browser)

**How to Run:**

```bash
# From project root
node src/dynamic/test-dynamic-system.js
```

**Expected Output:**
```
✅ SISTEMA DINÁMICO: VALIDACIÓN EXITOSA
   El sistema cumple con todos los requisitos mínimos.
```

### Minimum Requirements

The test script validates these minimum requirements:

- **V1 Wrappers/Decoys**: Minimum 10 active elements
- **V1 Order Changes**: Minimum 3 dynamic orderings
- **V3 IDs**: Minimum 20 dynamic IDs
- **V3 Classes**: Minimum 15 dynamic classes
- **V3 Texts**: Minimum 15 dynamic texts
- **Variants**: Each key must have at least 3 variants

### Customizing Requirements

To adapt the test for different websites, modify `MIN_REQUIREMENTS` in `test-dynamic-system.js`:

```javascript
const MIN_REQUIREMENTS = {
  v1Wrappers: 10,      // Adjust for your website
  v1OrderChanges: 3,   // Adjust for your website
  v3Ids: 20,           // Adjust for your website
  v3Classes: 15,       // Adjust for your website
  v3Texts: 15,         // Adjust for your website
  minVariants: 3,      // Adjust for your website
};
```

For more details, see [TEST_VALIDATION.md](./TEST_VALIDATION.md).

---

## Performance Considerations

### Optimization Strategies

1. **Use `useMemo` for Dynamic Ordering**
   ```typescript
   const orderedItems = useMemo(() => {
     const order = dyn.v1.changeOrderElements("items", items.length);
     return order.map((idx) => items[idx]);
   }, [dyn.seed, items]);
   ```

2. **Cache Variant Lookups**
   - The `getVariant()` function is optimized with efficient hashing
   - No need to manually cache results - the hash function is fast

3. **Minimize Re-renders**
   - `useDynamicSystem()` uses `useMemo` internally
   - Only re-computes when `seed` changes

4. **Bundle Size**
   - JSON files are loaded at build time
   - No runtime network requests for variants
   - Minimal impact on bundle size

### Performance Metrics

- **Hash Function**: O(n) where n is string length (very fast)
- **Variant Selection**: O(1) after hash calculation
- **Memory**: Minimal - only stores variant arrays in memory
- **Bundle Impact**: ~5-10KB for typical variant files

---

## Common Pitfalls and Solutions

### Pitfall 1: Hydration Mismatches

**Problem:** Server renders with one seed, client hydrates with different seed.

**Solution:**
- Ensure `window.__INITIAL_SEED__` is set in `layout.tsx`
- Use Server Components to read seed from URL
- Wait for `isSeedReady` before rendering dynamic content

### Pitfall 2: Layout Breaking with Wrappers

**Problem:** V1 wrappers break CSS layouts (flexbox, grid).

**Solution:**
- Use `div` wrappers with `w-full h-full` for layout-sensitive components
- The system automatically uses `div` for keys containing: `"input-container"`, `"form"`, `"search"`, `"feature-card"`, `"genre-card"`, `"stats-card"`

### Pitfall 3: Too Few Variants

**Problem:** Scrapers can still memorize if there are only 2-3 variants.

**Solution:**
- Aim for 5-10 variants per key
- More variants = better protection
- Test script will warn if keys have < 3 variants

### Pitfall 4: Non-Deterministic Behavior

**Problem:** Same seed produces different results.

**Solution:**
- Never use `Math.random()` or `Date.now()` in variant selection
- Always use `selectVariantIndex()` for variant selection
- Test determinism with the test script

### Pitfall 5: Forgetting Seed=1 Special Case

**Problem:** Seed=1 doesn't return original version.

**Solution:**
- Always check `if (seed === 1)` before applying dynamic changes
- Seed=1 should return first variant (index 0) or original structure

### Pitfall 6: Generic Keys Colliding

**Problem:** Using generic keys like `"button"` or `"card"` causes collisions.

**Solution:**
- Use specific keys: `"movie-card"`, `"search-button"`, `"feature-card-1"`
- Include component context in key names

---

## Migration Guide

### Adding Dynamic System to a New Website

1. **Copy Core Files**
   ```bash
   cp -r src/dynamic /path/to/new/web/src/
   ```

2. **Install Dependencies**
   - Ensure React and Next.js are set up
   - No additional npm packages required

3. **Set Up Seed Context**
   - Copy `SeedContext` from existing website
   - Ensure `page.tsx` reads seed from `searchParams`

4. **Configure Environment Variables**
   ```env
   NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true
   NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true
   ```

5. **Add Variants**
   - Start with `id-variants.json`, `class-variants.json`, `text-variants.json`
   - Add variants as you implement components

6. **Run Test Script**
   ```bash
   node src/dynamic/test-dynamic-system.js
   ```

7. **Fix Issues**
   - Add missing variants
   - Increase usage of `dyn.v1.addWrapDecoy()` and `dyn.v3.getVariant()`
   - Adjust `MIN_REQUIREMENTS` if needed

### Adapting Test Script for Different Websites

1. **Copy Test Script**
   ```bash
   cp src/dynamic/test-dynamic-system.js /path/to/new/web/src/dynamic/
   ```

2. **Adjust File Paths** (if structure differs)
   ```javascript
   const FILE_PATHS = {
     idVariants: 'src/dynamic/v3/data/id-variants.json',
     // Adjust if your structure is different
   };
   ```

3. **Adjust Requirements**
   ```javascript
   const MIN_REQUIREMENTS = {
     v1Wrappers: 10,      // Adjust for your website size
     v3Ids: 20,          // Adjust for your website complexity
     // ...
   };
   ```

---

## FAQ (Frequently Asked Questions)

### Q: Why use a hash function instead of simple modulo?

**A:** Hash functions provide better distribution. With simple modulo, similar seeds might produce similar results. The hash ensures each `(seed, key)` combination produces a unique, well-distributed index.

### Q: Can I use the same key for different variant types?

**A:** Yes, but it's not recommended. Keys like `"button"` can exist in both `id-variants.json` and `class-variants.json`, but using specific keys like `"button-id"` and `"button-class"` is clearer.

### Q: What happens if a key doesn't exist in variants?

**A:** `getVariant()` returns the `fallback` parameter if provided, or the `key` itself if no fallback is given. This ensures the system never breaks - it gracefully degrades.

### Q: How many variants should each key have?

**A:** Minimum 3, recommended 5-10. More variants = better protection, but diminishing returns after ~10 variants.

### Q: Does V1 affect performance?

**A:** Minimal impact. Wrappers and decoys are lightweight DOM elements. Decoys are hidden and don't affect layout. The system uses React fragments efficiently.

### Q: Can I disable V1 or V3 for specific components?

**A:** Yes, simply don't use `dyn.v1.addWrapDecoy()` or `dyn.v3.getVariant()` for those components. The system gracefully handles missing usage.

### Q: How do I test if variants are working?

**A:** 
1. Run the test script: `node src/dynamic/test-dynamic-system.js`
2. Change seed in URL: `?seed=1` vs `?seed=42`
3. Compare IDs, classes, and texts - they should be different
4. Check browser console for V1 elements: `document.querySelectorAll('[data-v1="true"]').length`

### Q: What's the difference between global and local variants?

**A:** 
- **Global variants** (JSON files): Used across multiple components (e.g., `"button"`, `"card"`)
- **Local variants** (component dictionaries): Used only in one component (e.g., `"feature_1_title"`)

### Q: Can I add variants at runtime?

**A:** No, variants are defined at build time in JSON files or component dictionaries. This ensures determinism and performance.

### Q: How does seed=1 work?

**A:** Seed=1 is special - it always returns:
- V1: No wrappers, no decoys (original structure)
- V3: First variant (index 0) for all keys
- Order: Original order `[0, 1, 2, ...]`

This ensures the "original" version is always accessible.

---

## Summary

The Dynamic System provides a comprehensive, deterministic solution for preventing web scraping through:

1. **V1**: Structural changes (wrappers/decoy) that break XPath selectors
2. **V2**: Dynamic data loading (currently disabled - uses original data, will provide randomized data when enabled)
3. **V3**: Attribute and text variations that prevent selector memorization
4. **Unified API**: Single `getVariant()` function for all variant types
5. **Flexible Organization**: Global JSONs for reusable elements, local dictionaries for component-specific elements
6. **Deterministic**: Same seed always produces same output
7. **Graceful Degradation**: Works even when features are disabled

The system is designed to be:
- **Simple**: One hook (`useDynamicSystem`), one function (`getVariant`)
- **Scalable**: Easy to add new variants
- **Maintainable**: Clear separation between global and local variants
- **Performant**: Uses `useMemo` and efficient hashing algorithms

---

## Evolution of the System

### What We Built

1. **Started with separate functions**: `generateElementId()`, `getClassForElement()`, `getTextForElement()`
2. **Unified into single function**: `getVariant()` handles IDs, classes, and texts
3. **Organized variants**: Global JSONs for reusable elements, local dictionaries for component-specific elements
4. **Cleaned up**: Removed obsolete files (`id-generator.ts`, `class-selector.ts`, `text-selector.ts`)
5. **Simplified API**: Removed convenience wrappers (`dyn.v3.id()`, `dyn.v3.class()`, `dyn.v3.text()`)
6. **Renamed for clarity**: `useDynamic()` → `useDynamicSystem()`, `pickVariant()` → `selectVariantIndex()`

### Key Design Decisions

1. **Single `getVariant()` function**: Reduces API surface, makes code easier to understand
2. **Local vs Global variants**: Component-specific variants stay in components, reusable variants in JSONs
3. **Seed = 1 is original**: Ensures consistent fallback behavior
4. **Deterministic hashing**: Uses `hashString()` for better distribution than simple modulo
5. **Graceful degradation**: System works even when V1/V3 are disabled

---

## Conclusion

The Dynamic System is a production-ready solution for anti-scraping that:
- Prevents XPath memorization (V1)
- Provides dynamic data loading (V2 - currently disabled, uses original data)
- Prevents selector memorization (V3)
- Maintains consistent user experience (deterministic)
- Provides flexible variant management (global + local)
- Offers simple, unified API (`useDynamicSystem` + `getVariant`)

The system is designed to be maintainable, scalable, and easy to use while providing robust protection against web scraping.

### System Status Summary

- **V1**: ✅ Active - Modifies DOM structure (wrappers/decoy)
- **V2**: ⏸️ Disabled - Currently uses original data, will provide randomized data when enabled
- **V3**: ✅ Active - Modifies attributes and texts (IDs, classes, texts)

### Quick Reference

**Main Hook:**
```typescript
const dyn = useDynamicSystem();
```

**V1 Functions:**
- `dyn.v1.addWrapDecoy(componentKey, children, reactKey?)` - Add wrappers/decoy
- `dyn.v1.changeOrderElements(key, count)` - Change element order

**V3 Function:**
- `dyn.v3.getVariant(key, variants?, fallback?)` - Get variant (IDs, classes, texts)

**Testing:**
```bash
node src/dynamic/test-dynamic-system.js
```

**Documentation:**
- [Complete Documentation](./DYNAMIC_SYSTEM_DOCUMENTATION.md) - This file
- [Test Validation Guide](./TEST_VALIDATION.md) - How to validate the system
