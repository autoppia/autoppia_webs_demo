# Dynamic Seed-Based Layout System

This implementation provides a dynamic layout system that changes UI positioning and element selectors based on a `seed` parameter in the URL. This makes it difficult for scrapers to build reliable selectors while maintaining full functionality.

## Overview

The system uses a seed value (1-10) from the URL query parameter to generate different layout configurations. Each seed produces:
- Different element positioning
- Unique CSS class names
- Varied DOM structures
- Dynamic component layouts

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

1. **`src/lib/seed-layout.ts`** - Main layout configuration generator
2. **`src/hooks/use-seed-layout.ts`** - React hook for accessing layout config
3. **Updated Components** - All event-triggering components now use dynamic layouts

### Layout Variations

#### Search Bar Positions
- **Seed 1**: Right side
- **Seed 2**: Center
- **Seed 3**: Top
- **Seed 4**: Bottom
- **Seed 5**: Left side
- And more variations...

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
  
  return (
    <div className={`my-container ${layout.searchBar.containerClass}`}>
      <input className={layout.searchBar.inputClass} />
    </div>
  );
}
```

### URL Examples
- `http://localhost:3000/?seed=1` - Layout variation 1
- `http://localhost:3000/?seed=5` - Layout variation 5
- `http://localhost:3000/?seed=10` - Layout variation 10

## Event Tracking

All event tracking continues to work regardless of layout changes:

- ✅ `SEARCH_RESTAURANT` - Search bar functionality
- ✅ `VIEW_RESTAURANT` - Restaurant card clicks
- ✅ `ADD_TO_CART_MENU_ITEM` - Add to cart actions
- ✅ `ITEM_INCREMENTED/DECREMENTED` - Quantity changes
- ✅ `PLACE_ORDER` - Order placement
- ✅ All other events

## Demo Page

Visit `/demo` to see the layout system in action:
- Interactive seed selection (1-10)
- Real-time layout configuration display
- Navigation to test different pages
- Visual demonstration of layout changes

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
Different DOM structures make XPath selectors unreliable:
```html
<!-- Seed 1 -->
<div class="search-container">
  <input class="search-input" />
</div>

<!-- Seed 2 -->
<div class="search-container-v2">
  <div class="search-wrapper">
    <input class="search-input-v2" />
  </div>
</div>
```

### 2. CSS Selector Confusion
Unique class names prevent reliable CSS selectors:
```css
/* Seed 1 */
.search-input { /* styles */ }

/* Seed 2 */
.search-input-v2 { /* styles */ }

/* Seed 3 */
.seed-3-search-input { /* styles */ }
```

### 3. Position-Based Confusion
Elements appear in different positions:
- Search bar: left, center, right, top, bottom
- Buttons: various alignments
- Cards: different grid layouts

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

## Future Enhancements

1. **More Seeds**: Extend beyond 10 variations
2. **Animation Variations**: Different animation patterns per seed
3. **Color Schemes**: Dynamic color variations
4. **Font Variations**: Different typography per seed
5. **Component Order**: Dynamic component ordering

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

## Conclusion

This dynamic layout system provides an effective way to confuse automated scrapers while maintaining full functionality for legitimate users. The system is extensible, maintainable, and can be easily adapted to new requirements. 