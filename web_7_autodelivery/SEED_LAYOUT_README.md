# Dynamic Seed-Based Layout System

This implementation provides a dynamic layout system that changes UI positioning and element selectors based on a `seed` parameter in the URL. This makes it difficult for scrapers to build reliable selectors while maintaining full functionality.

## Overview

The system uses a seed value (1-300) from the URL query parameter to generate different layout configurations. Each seed produces:
- Different element positioning
- Unique CSS class names
- Varied DOM structures
- Dynamic component layouts
- Unique XPath selectors
- Dynamic element attributes (data-seed, data-variant, data-xpath)

## Environment Control

Dynamic HTML can be enabled/disabled using the `NEXT_PUBLIC_ENABLE_DYNAMIC_HTML` environment variable:
- When `true`: Full dynamic HTML with seeds 1-300
- When `false`: All seeds show the same default layout (seed=1)

## How It Works

### 1. URL Parameter Extraction
The system reads the `seed` parameter from the URL (e.g., `?seed=3`). If no seed is provided, it defaults to 1.

### 2. Layout Configuration Generation
The `getSeedLayout(seed)` function generates a complete layout configuration based on the seed value, including:
- Search bar positioning and styling
- Navigation layout
- Restaurant card layouts
- Hero section positioning
- Cart component styling
- Modal layouts
- Button variations

### 3. Dynamic Class Name Generation
Each seed produces different CSS class names to confuse scrapers:
```typescript
const generateVariations = (baseClass: string, seed: number): string => {
  const variations = [
    baseClass,
    `${baseClass}-v${seed}`,
    `seed-${seed}-${baseClass}`,
    `${baseClass}-layout-${seed}`,
    `dynamic-${baseClass}-${seed}`,
    `${baseClass}-variant-${seed}`,
  ];
  return variations[seed % variations.length];
};
```

## Implementation Details

### Core Files

1. **`src/lib/seed-layout.ts`** - Main layout configuration generator (seeds 1-300)
2. **`src/hooks/use-seed-layout.ts`** - React hook for accessing layout config with dynamic attributes
3. **`src/utils/dynamicDataProvider.ts`** - Utility for managing dynamic HTML state and data
4. **Updated Components** - All event-triggering components now use dynamic layouts
5. **Docker Configuration** - Dockerfile and docker-compose.yml support ENABLE_DYNAMIC_HTML env var

### Layout Variations

#### Seed Range (1-300)
The system maps 300 seeds to 20+ layout variants using intelligent modulo arithmetic:
- Seeds are validated to be between 1-300
- Invalid seeds default to 1
- Special seed mappings for unique layouts:
  - Seeds 160-170 → Layout 3
  - Seeds ending in 5 (5, 15, 25...295) → Layout 2
  - Seed 8 → Layout 1
  - Seed 180 → Layout 11 (Ultra-wide)
  - Seed 190 → Layout 18 (Split-screen)
  - Seed 200 → Layout 20 (Asymmetric)
  - Seed 210 → Layout 14 (Dashboard)
  - Seed 250 → Layout 15 (Magazine)
  - Seed 260 → Layout 19 (Card-stack)
  - Seed 270 → Layout 17 (Premium)

#### Search Bar Positions (by layout variant)
- Layout variants 1-10 cycle through: right, center, top, bottom, left positions

#### Navigation Layouts
- Logo positioning (left, center, right)
- Cart positioning (left, center, right)
- Menu positioning (left, center, right)

#### Component Styling
- Dynamic CSS classes for all major components
- Unique class names per seed value
- Maintained functionality with varied styling

## Usage

### Basic Usage
```typescript
import { useSeedLayout } from '@/hooks/use-seed-layout';

function MyComponent() {
  const layout = useSeedLayout();
  
  // Get dynamic attributes for element
  const buttonAttrs = layout.getElementAttributes('ADD_TO_CART', 0);
  
  return (
    <div className={`my-container ${layout.searchBar.containerClass}`}>
      <input 
        className={layout.searchBar.inputClass}
        {...layout.getElementAttributes('SEARCH_INPUT', 0)}
      />
      <button
        {...buttonAttrs}
        className={layout.cart.buttonClass}
      >
        Add to Cart
      </button>
    </div>
  );
}
```

### URL Examples
- `http://localhost:8006/?seed=1` - Layout variation 1
- `http://localhost:8006/?seed=5` - Layout variation 2 (special mapping)
- `http://localhost:8006/?seed=10` - Layout variation 10
- `http://localhost:8006/?seed=180` - Layout variant 11 (Ultra-wide)
- `http://localhost:8006/?seed=200` - Layout variant 20 (Asymmetric)
- `http://localhost:8006/?seed=300` - Wraps to layout 10

## Event Tracking

All event tracking continues to work regardless of layout changes:

- ✅ `SEARCH_RESTAURANT` - Search bar functionality
- ✅ `VIEW_RESTAURANT` - Restaurant card clicks
- ✅ `ADD_TO_CART_MENU_ITEM` - Add to cart actions
- ✅ `ITEM_INCREMENTED/DECREMENTED` - Quantity changes
- ✅ `PLACE_ORDER` - Order placement
- ✅ All other events

## Deployment with Dynamic HTML

### Enable Dynamic HTML in Docker

```bash
# Deploy with dynamic HTML enabled
bash scripts/setup.sh --demo=autodelivery --web_port=8006 --enable_dynamic_html=true

# Or deploy all demos with dynamic HTML
bash scripts/setup.sh --demo=all --enable_dynamic_html=true
```

### Verify Environment Variables

```bash
# Check if environment variable is set
docker exec autodelivery_8006-web-1 printenv NEXT_PUBLIC_ENABLE_DYNAMIC_HTML

# Expected output: true
```

## Demo & Testing

### Test Different Seed Values (1-300)
```bash
# Basic layouts
http://localhost:8006/?seed=1
http://localhost:8006/?seed=5
http://localhost:8006/?seed=10

# Special layouts
http://localhost:8006/?seed=180   # Ultra-wide layout
http://localhost:8006/?seed=190   # Split-screen layout
http://localhost:8006/?seed=200   # Asymmetric layout
http://localhost:8006/?seed=250   # Magazine layout
http://localhost:8006/?seed=300   # Maximum seed value
```

### Inspect Dynamic Attributes
Open browser DevTools → Elements tab, and inspect any button element:
```html
<button 
  id="ADD_TO_CART-180-0"
  data-seed="180"
  data-variant="0"
  data-element-type="ADD_TO_CART"
  data-layout-id="11"
  class="dynamic-cart-button-180"
>
  Add to Cart
</button>
```

## Components Updated

### Core Components
- ✅ `Navbar.tsx` - Dynamic search bar positioning
- ✅ `HeroSection.tsx` - Dynamic button positioning
- ✅ `RestaurantCard.tsx` - Dynamic card styling
- ✅ `CartNavIcon.tsx` - Dynamic cart icon styling
- ✅ `PaginatedRestaurantsGrid.tsx` - Dynamic grid layout

### Modal Components
- ✅ `AddToCartModal.tsx` - Dynamic modal styling
- ✅ `QuickOrderModal.tsx` - Dynamic modal layout

### Cart Components
- ✅ `CartPage.tsx` - Dynamic cart page styling and buttons

## Anti-Scraping Benefits

### 1. XPath Confusion
Different DOM structures and data attributes make XPath selectors unreliable:
```html
<!-- Seed 1 (when dynamic HTML disabled) -->
<div class="search-container">
  <input id="SEARCH_INPUT-0" class="search-input" />
</div>

<!-- Seed 180 (when dynamic HTML enabled) -->
<div class="search-container-v180">
  <div class="search-wrapper">
    <input 
      id="SEARCH_INPUT-180-0"
      data-seed="180"
      data-variant="0"
      data-layout-id="11"
      class="dynamic-search-input-180" 
    />
  </div>
</div>

<!-- Seed 200 (when dynamic HTML enabled) -->
<div class="seed-200-search-container">
  <input 
    id="SEARCH_INPUT-200-0"
    data-seed="200"
    data-variant="0"
    data-layout-id="20"
    class="search-input-layout-200" 
  />
</div>
```

### 2. CSS Selector Confusion
Unique class names per seed prevent reliable CSS selectors:
```css
/* Seed 1 */
.search-input { /* styles */ }

/* Seed 180 */
.dynamic-search-input-180 { /* styles */ }

/* Seed 200 */
.search-input-layout-200 { /* styles */ }
```

### 3. Position-Based Confusion
Elements appear in different positions across 300 seeds:
- Search bar: left, center, right, top, bottom
- Buttons: various alignments
- Cards: different grid layouts
- Navigation: dynamic ordering

### 4. Environment Control
- **Production**: Set `ENABLE_DYNAMIC_HTML=false` for consistent UI
- **Testing/Scraping**: Set `ENABLE_DYNAMIC_HTML=true` for 300 variations

## Testing

### Manual Testing
1. Visit `/demo` to see all layout variations
2. Test each seed value (1-10)
3. Navigate between pages to verify consistency
4. Verify all events still fire correctly

### Automated Testing
The system is designed to be testable:
```typescript
// Test specific seed layouts
const layout1 = getSeedLayout(1);
const layout2 = getSeedLayout(2);

expect(layout1.searchBar.position).not.toBe(layout2.searchBar.position);
expect(layout1.searchBar.containerClass).not.toBe(layout2.searchBar.containerClass);
```

## Performance Considerations

- Layout configurations are generated once per seed
- No performance impact on component rendering
- Minimal bundle size increase
- Efficient class name generation

## Current Features (Implemented)

1. ✅ **300 Seeds**: Full support for seeds 1-300
2. ✅ **20+ Layout Variants**: Unique layouts with special mappings
3. ✅ **Dynamic Attributes**: data-seed, data-variant, data-layout-id, data-xpath
4. ✅ **Environment Control**: Enable/disable via NEXT_PUBLIC_ENABLE_DYNAMIC_HTML
5. ✅ **XPath Generation**: Unique XPath selectors per seed
6. ✅ **Docker Integration**: Full support in Dockerfile and docker-compose.yml
7. ✅ **Dynamic Class Names**: Seed-based CSS classes
8. ✅ **Element Reordering**: Reorder arrays based on seed

## Future Enhancements

1. **Animation Variations**: Different animation patterns per seed
2. **Color Schemes**: Dynamic color variations per layout
3. **Font Variations**: Different typography per seed
4. **More Component Types**: Extend to more UI elements

## Security Notes

- This system is designed to confuse automated scrapers
- It does not prevent manual scraping
- Consider additional security measures for sensitive data
- Monitor for new scraping techniques and adapt accordingly

## Troubleshooting

### Common Issues

1. **Layout not updating**: Ensure URL has correct seed parameter
2. **Events not firing**: Check that event handlers are properly bound
3. **Styling issues**: Verify CSS classes are being applied correctly

### Debug Mode
Add debug logging to see layout changes:
```typescript
const layout = useSeedLayout();
console.log('Current layout:', layout);
```

## Summary

This dynamic layout system provides an effective way to confuse automated scrapers while maintaining full functionality for legitimate users:

### Key Stats
- **300 unique seeds** (1-300)
- **20+ layout variants** with intelligent mapping
- **Environment-controlled** via NEXT_PUBLIC_ENABLE_DYNAMIC_HTML
- **Full Docker integration** for easy deployment
- **Dynamic attributes** on all major interactive elements
- **XPath selectors** that change per seed

### Comparison with web_6_automail
This implementation matches the dynamic HTML system from `web_6_automail`:
- ✅ Same seed range (1-300)
- ✅ Same environment variable control
- ✅ Same dynamic attribute generation
- ✅ Same Docker integration
- ✅ Same layout mapping algorithm
- ✅ Extensible and maintainable codebase

The system is production-ready and can be easily extended to new requirements. 