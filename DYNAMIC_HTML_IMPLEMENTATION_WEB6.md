# Dynamic HTML Implementation in web_6_automail

## Overview

The `web_6_automail` application implements dynamic HTML with support for seeds 1-300, allowing the interface to dynamically change its layout, structure, and XPath selectors based on a seed parameter. The system is controlled by the `ENABLE_DYNAMIC_HTML` environment variable set in `scripts/setup.sh`.

---

## 1. Environment Variable Flow

### setup.sh Configuration
```bash
# scripts/setup.sh (lines 13, 56, 66, 76, 84, 121, 142)
--enable_dynamic_html=BOOL    # CLI option (default: false)
ENABLE_DYNAMIC_HTML_DEFAULT=false
ENABLE_DYNAMIC_HTML="${ENABLE_DYNAMIC_HTML:-$ENABLE_DYNAMIC_HTML_DEFAULT}"

# Passes to docker-compose:
WEB_PORT="$webp" POSTGRES_PORT="$pgp" ENABLE_DYNAMIC_HTML="$ENABLE_DYNAMIC_HTML" \
  docker compose -p "$proj" up -d --build
```

### docker-compose.yml Flow
```yaml
# web_6_automail/docker-compose.yml
services:
  web:
    build:
      args:
        ENABLE_DYNAMIC_HTML: ${ENABLE_DYNAMIC_HTML:-false}  # Build-time arg
    environment:
      - ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML:-false}  # Runtime env
      - NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML:-false}  # Client-side env
```

### Dockerfile Build Process
```dockerfile
# web_6_automail/Dockerfile
ARG ENABLE_DYNAMIC_HTML=false  # Accept build arg

# Set for build stage
ENV ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}

RUN npm run build  # Bakes values into build
```

### next.config.js Defaults
```javascript
// web_6_automail/next.config.js
const isLocalDev = process.env.NODE_ENV !== 'production' && !process.env.DOCKER_BUILD;

// For local development: ALWAYS true unless explicitly false
if (isLocalDev) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML = 'true';
} else if (!process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML) {
  process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML = 'false';
}

// Exposes to client-side code
env: {
  NEXT_PUBLIC_ENABLE_DYNAMIC_HTML: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML,
}
```

---

## 2. Seed System (1-300)

### Seed Extraction from URL
```typescript
// src/library/layoutVariants.ts
export function getSeedFromUrl(): number {
  const urlParams = new URLSearchParams(window.location.search);
  const seedParam = urlParams.get('seed');
  
  if (seedParam) {
    const seed = parseInt(seedParam, 10);
    if (seed >= 1 && seed <= 300) {
      return seed;
    }
  }
  
  return 1; // Default variant
}
```

### Effective Seed Validation
```typescript
// src/utils/dynamicDataProvider.ts
export function getEffectiveSeed(providedSeed: number = 1): number {
  if (!isDynamicModeEnabled()) {
    return 1; // Always return default when dynamic HTML is disabled
  }
  
  // Validate seed range (1-300)
  if (providedSeed < 1 || providedSeed > 300) {
    return 1;
  }
  
  return providedSeed;
}
```

---

## 3. Seed-to-Layout Mapping

### Layout Variant System (10 Base Layouts)
```typescript
// src/library/layoutVariants.ts
export const LAYOUT_VARIANTS: LayoutVariant[] = [
  { id: 1, name: "Classic Gmail", ... },      // Traditional layout
  { id: 2, name: "Right Sidebar", ... },      // Sidebar on right
  { id: 3, name: "Top Navigation", ... },     // Floating navigation
  { id: 4, name: "Split View", ... },         // Three-panel split
  { id: 5, name: "Card Layout", ... },        // Grid cards
  { id: 6, name: "Minimalist", ... },         // Clean interface
  { id: 7, name: "Dashboard Style", ... },    // Widget-based
  { id: 8, name: "Mobile First", ... },       // Mobile-optimized
  { id: 9, name: "Terminal Style", ... },     // Command-line inspired
  { id: 10, name: "Magazine Layout", ... }    // Magazine grid
];

// Maps seed (1-300) to variant (1-10)
export function getLayoutVariant(seed: number): LayoutVariant {
  const variantIndex = (seed - 1) % LAYOUT_VARIANTS.length;
  return LAYOUT_VARIANTS[variantIndex];
}
```

### Advanced Seed Configuration (20 Layout Configs)
```typescript
// src/utils/seedLayout.ts
export function getSeedLayout(seed?: number): SeedLayoutConfig {
  if (!seed || seed < 1 || seed > 300) {
    return getDefaultLayout();
  }

  // Special cases:
  // - Seeds 160-170 → Layout 3
  // - Seeds ending in 5 (5,15,25...295) → Layout 2
  // - Seed 8 → Layout 1
  // - Specific seeds (180,190,200,210,250,260,270) → Unique layouts (11-20)
  
  // Default mapping: seed % 30 → layout 1-10
  const layoutIndex = ((seed % 30) + 1) % 10 || 10;
  return getLayoutByIndex(layoutIndex);
}
```

**Layout Configuration Properties:**
- `headerOrder`: Order of logo, search, navigation
- `searchPosition`: left | center | right | full-width
- `navbarStyle`: top | side | hidden-top | floating
- `contentGrid`: default | reverse | centered | wide | narrow
- `cardLayout`: grid | row | column | masonry
- `buttonStyle`: default | rounded | outlined | minimal
- `footerStyle`: default | minimal | expanded | centered
- `spacing`: tight | normal | loose
- `borderRadius`: none | small | medium | large
- `colorScheme`: default | inverted | monochrome | accent

---

## 4. XPath Generation System

Each layout variant defines unique XPath selectors for automation:

```typescript
// src/library/layoutVariants.ts (example for Layout 1)
{
  id: 1,
  name: "Classic Gmail",
  xpaths: {
    emailItem: "//div[contains(@class, 'email-item-hover')]",
    starButton: "//button[contains(@class, 'opacity-0')]//*[name()='svg']",
    checkbox: "//input[@type='checkbox']",
    deleteButton: "//button[contains(text(), 'Delete')]",
    composeButton: "//button[contains(text(), 'Compose')]",
    searchInput: "//input[@placeholder*='Search']",
    themeToggle: "//button[contains(@class, 'theme-toggle')]",
    labelSelector: "//button[contains(text(), 'Labels')]",
    sendButton: "//button[contains(text(), 'Send')]",
    saveDraftButton: "//button[contains(text(), 'Save')]"
  }
}
```

**Different layouts use different XPath patterns:**
- Layout 1: `email-item-hover`, `opacity-0` classes
- Layout 2: `email-container`, `star-container` classes  
- Layout 3: `email-card`, `star-icon` classes
- Layout 4: `email-entry`, `star-element` elements
- Layout 5: `email-card`, `card-star` classes
- etc.

---

## 5. React Integration

### Context System

#### LayoutContext
```typescript
// src/contexts/LayoutContext.tsx
export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [seed, setSeed] = useState(getSeedFromUrl());
  const [currentVariant, setCurrentVariant] = useState(getLayoutVariant(seed));
  
  // Syncs seed with URL parameter
  useEffect(() => {
    const urlSeed = getSeedFromUrl();
    const effectiveSeed = getEffectiveSeed(urlSeed);
    if (effectiveSeed !== seed) {
      setSeed(effectiveSeed);
      setCurrentVariant(getLayoutVariant(effectiveSeed));
    }
  }, []);
  
  return (
    <LayoutContext.Provider value={{ currentVariant, seed, setSeed }}>
      {children}
    </LayoutContext.Provider>
  );
}
```

### useSeedLayout Hook
```typescript
// src/library/useSeedLayout.ts
export function useSeedLayout() {
  const [seed, setSeed] = useState(1);
  const [isDynamicEnabled, setIsDynamicEnabled] = useState(false);
  
  useEffect(() => {
    const dynamicEnabled = isDynamicModeEnabled();
    setIsDynamicEnabled(dynamicEnabled);
    
    const searchParams = new URLSearchParams(window.location.search);
    const seedParam = searchParams.get('seed');
    const rawSeed = seedParam ? parseInt(seedParam) : 1;
    const effectiveSeed = getEffectiveSeed(rawSeed);
    
    setSeed(effectiveSeed);
    
    if (dynamicEnabled) {
      setLayout(getLayoutVariant(effectiveSeed));
    } else {
      setLayout(getLayoutVariant(1)); // Always default when disabled
    }
  }, []);
  
  return {
    seed,
    layout,
    isDynamicEnabled,
    getElementAttributes,   // Generates dynamic IDs and data attributes
    getElementXPath,        // Generates XPath selectors
    reorderElements,        // Reorders arrays based on seed
    generateId,             // Creates seed-based IDs
    getLayoutClasses,       // Returns dynamic CSS classes
    applyCSSVariables,      // Applies CSS custom properties
    getLayoutInfo,          // Returns current layout metadata
    generateSeedClass,      // Creates seed-specific class names
    createDynamicStyles     // Creates dynamic style objects
  };
}
```

### DynamicLayout Component
```typescript
// src/components/DynamicLayout.tsx
export function DynamicLayout() {
  const { currentVariant, seed } = useLayout();
  const { currentEmail } = useEmail();
  
  // Renders different component trees based on variant.id
  switch (currentVariant.id) {
    case 1: // Classic Gmail
      return (
        <div className={currentVariant.styles.container}>
          <Toolbar />
          <div className="flex">
            <Sidebar className="left-0" />
            <EmailList />
            <EmailView />
          </div>
        </div>
      );
    
    case 2: // Right Sidebar
      return (
        <div className={currentVariant.styles.container}>
          <Toolbar />
          <div className="flex">
            <EmailList />
            <EmailView />
            <Sidebar className="right-0" />
          </div>
        </div>
      );
    
    // ... cases 3-10 with different DOM structures
  }
}
```

### Page Implementation
```typescript
// src/app/page.tsx
function GmailContent() {
  const searchParams = useSearchParams();
  const rawSeed = Number(searchParams.get("seed") ?? "1");
  const effectiveSeed = getEffectiveSeed(rawSeed);
  const layoutConfig = getLayoutConfig(effectiveSeed);
  const layoutClasses = getLayoutClasses(layoutConfig);

  return (
    <div className={`min-h-screen bg-background ${layoutClasses.spacing}`}>
      <DynamicLayout key={effectiveSeed} />
    </div>
  );
}
```

---

## 6. Dynamic Data Provider

```typescript
// src/utils/dynamicDataProvider.ts
export class DynamicDataProvider {
  private isEnabled: boolean = false;

  constructor() {
    // Checks NEXT_PUBLIC_ENABLE_DYNAMIC_HTML === 'true'
    this.isEnabled = isDynamicHtmlEnabled();
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  public getEffectiveSeed(providedSeed: number = 1): number {
    if (!this.isEnabled) return 1;
    if (providedSeed < 1 || providedSeed > 300) return 1;
    return providedSeed;
  }

  public getLayoutConfig(seed?: number) {
    return getEffectiveLayoutConfig(seed);
  }
}

// Singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();
```

---

## 7. CSS Class Generation

```typescript
// src/utils/seedLayout.ts
export function getLayoutClasses(config: SeedLayoutConfig) {
  return {
    header: getHeaderClasses(config),      // e.g., 'search-center navbar-top'
    content: getContentClasses(config),    // e.g., 'content-wide'
    cards: getCardClasses(config),         // e.g., 'cards-masonry'
    buttons: getButtonClasses(config),     // e.g., 'buttons-rounded'
    footer: getFooterClasses(config),      // e.g., 'footer-expanded'
    spacing: getSpacingClasses(config)     // e.g., 'spacing-loose'
  };
}
```

---

## 8. Usage Examples

### Deploying with Dynamic HTML Enabled
```bash
# Deploy web_6_automail with dynamic HTML enabled
./scripts/setup.sh --demo=automail --enable_dynamic_html=true

# Access with different seeds:
http://localhost:8005/              # Seed 1 (default)
http://localhost:8005/?seed=5       # Seed 5 → Layout 2
http://localhost:8005/?seed=42      # Seed 42 → Layout variant
http://localhost:8005/?seed=165     # Seed 165 → Layout 3 (special case)
http://localhost:8005/?seed=300     # Seed 300 → Layout variant
```

### Deploying with Dynamic HTML Disabled
```bash
# Deploy with dynamic HTML disabled (default)
./scripts/setup.sh --demo=automail --enable_dynamic_html=false

# All URLs will show the same default layout:
http://localhost:8005/?seed=1       # Default layout
http://localhost:8005/?seed=100     # Default layout (seed ignored)
http://localhost:8005/?seed=300     # Default layout (seed ignored)
```

### Checking Current State
```typescript
import { isDynamicModeEnabled, getEffectiveSeed } from '@/utils/dynamicDataProvider';

// Check if dynamic HTML is enabled
const isEnabled = isDynamicModeEnabled();
console.log('Dynamic HTML enabled:', isEnabled);

// Get effective seed
const seed = getEffectiveSeed(42);
console.log('Effective seed:', seed); // 42 if enabled, 1 if disabled
```

---

## 9. Seed-to-Layout Examples

| Seed Range | Layout ID | Layout Name | Special Rules |
|------------|-----------|-------------|---------------|
| 1, 11, 21, ... | 1 | Classic Gmail | Default |
| 2, 12, 22, ... | 2 | Right Sidebar | |
| 3, 13, 23, ... | 3 | Top Navigation | |
| 4, 14, 24, ... | 4 | Split View | |
| 5, 15, 25, ... | 2 | Right Sidebar | **All seeds ending in 5** |
| 6, 16, 26, ... | 6 | Minimalist | |
| 7, 17, 27, ... | 7 | Dashboard Style | |
| 8 | 1 | Classic Gmail | **Special: Seed 8** |
| 8, 18, 28, ... | 8 | Mobile First | |
| 9, 19, 29, ... | 9 | Terminal Style | |
| 10, 20, 30, ... | 10 | Magazine Layout | |
| 160-170 | 3 | Top Navigation | **Special range** |
| 180 | 11 | Ultra-wide Layout | **Special seed** |
| 190 | 18 | Split-screen Layout | **Special seed** |
| 200 | 20 | Asymmetric Layout | **Special seed** |
| 210 | 14 | Dashboard-style | **Special seed** |
| 250 | 15 | Magazine-style | **Special seed** |
| 260 | 19 | Card-stack | **Special seed** |
| 270 | 17 | Premium Showcase | **Special seed** |

---

## 10. Key Features

### When Dynamic HTML is ENABLED (true):
✅ Seeds 1-300 produce different layouts  
✅ URL parameter `?seed=X` controls layout  
✅ XPath selectors change per layout  
✅ DOM structure changes per layout  
✅ CSS classes vary per seed  
✅ Element IDs include seed information  
✅ 10 base layout variants + 10 extended variants  

### When Dynamic HTML is DISABLED (false):
✅ All seeds return Layout 1 (default)  
✅ URL parameter is ignored  
✅ XPath selectors are consistent  
✅ DOM structure is fixed  
✅ CSS classes are static  
✅ Element IDs are standard  

---

## 11. Component-Level Dynamic Behavior

Components use the `useSeedLayout` hook to apply dynamic behavior:

```typescript
import { useSeedLayout } from '@/library/useSeedLayout';

function EmailItem({ email }) {
  const { generateId, getElementAttributes, isDynamicEnabled } = useSeedLayout();
  
  return (
    <div 
      id={generateId('email-item', email.id)}
      {...getElementAttributes('email-item', email.id)}
      className={`email-item ${isDynamicEnabled ? `seed-variant` : ''}`}
    >
      {/* Email content */}
    </div>
  );
}
```

---

## 12. Architecture Summary

```
scripts/setup.sh
  ↓ ENABLE_DYNAMIC_HTML=true|false
docker-compose.yml
  ↓ Build arg + Runtime env
Dockerfile
  ↓ Build-time ENV
next.config.js
  ↓ Bakes into build
Client-side Code
  ↓
process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML
  ↓
isDynamicModeEnabled() → true/false
  ↓
getEffectiveSeed(urlSeed)
  ↓
getSeedLayout(seed) → SeedLayoutConfig
  ↓
getLayoutVariant(seed) → LayoutVariant
  ↓
DynamicLayout renders based on variant.id
  ↓
Components render with seed-specific:
  - XPath selectors
  - CSS classes
  - DOM structure
  - Element IDs
```

---

## 13. Best Practices

1. **Always use `getEffectiveSeed()`** - Ensures proper validation and respects dynamic HTML setting
2. **Check `isDynamicModeEnabled()`** - Before applying dynamic behavior
3. **Use context hooks** - `useLayout()` and `useSeedLayout()` for consistent state
4. **Test both modes** - Verify behavior with dynamic HTML on and off
5. **Seed range** - Always validate seeds are within 1-300
6. **URL sync** - Use `LayoutContext` to keep seed and URL in sync
7. **XPath consistency** - Each layout variant must define all required XPaths

---

## 14. Testing Dynamic HTML

### Enable in Development
```bash
# Local development (automatically enabled)
npm run dev

# Docker deployment
./scripts/setup.sh --demo=automail --enable_dynamic_html=true
```

### Test Seed Panel
The application includes a `SeedTestPanel` component for testing:
- Shows current seed and variant
- Quick buttons to test seeds 1-10
- Manual seed input
- URL synchronization testing

---

## 15. Automation/Testing Integration

For automation tools (Selenium, Playwright, etc.):

```javascript
// Get current layout's XPath
const { currentVariant } = useLayout();
const starButtonXPath = currentVariant.xpaths.starButton;

// Use in automation
const starButton = await page.xpath(starButtonXPath);
await starButton.click();
```

Different seeds produce different XPaths, allowing testing of multiple UI configurations with the same test code.

---

## Conclusion

The `web_6_automail` dynamic HTML implementation provides a sophisticated system for generating 300 unique UI variations from 10 base layouts and 10 extended layouts, controlled by a single environment variable. The system seamlessly falls back to a default layout when disabled, making it suitable for both testing/automation scenarios and production deployments.

