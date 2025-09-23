# Dynamic Layout System

This implementation provides dynamic layouts based on a `seed` query parameter, designed to break predictable x-paths for scrapers while maintaining functionality.

## Features

- **Environment Variable Control**: Only active when `ENABLE_DYNAMIC_HTML=true`
- **10 Different Layout Configurations**: Each seed (1-10) provides a unique layout
- **Comprehensive Layout Variations**: Headers, navigation, content grids, cards, buttons, and footers
- **No Content Removal**: Only repositioning and styling changes
- **Fallback to Default**: When disabled or invalid seed, uses default layout

## Environment Setup

### Docker Configuration

The `docker-compose.yml` exposes the environment variable:

```yaml
environment:
  - ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML:-false}
  - NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML:-false}
```

### Usage

1. **Enable Dynamic HTML**:
   ```bash
   # Set environment variable
   export ENABLE_DYNAMIC_HTML=true
   
   # Or in docker-compose.yml
   ENABLE_DYNAMIC_HTML=true docker compose up
   ```

2. **Test Different Layouts**:
   ```
   http://localhost:8000?seed=1    # Default layout
   http://localhost:8000?seed=2    # Nav-first layout
   http://localhost:8000?seed=3    # Search-first layout
   http://localhost:8000?seed=4    # Full-width search
   http://localhost:8000?seed=5    # Narrow content
   http://localhost:8000?seed=6    # Side navbar
   http://localhost:8000?seed=7    # Hidden navbar
   http://localhost:8000?seed=8    # Floating navbar
   http://localhost:8000?seed=9    # Centered content
   http://localhost:8000?seed=10   # Reverse layout
   ```

## Layout Configurations

Each seed provides different variations of:

### Header Layouts
- **Order**: Logo, Search, Navigation elements can be reordered
- **Search Position**: Left, Center, Right, Full-width
- **Navbar Style**: Top, Side, Hidden-top, Floating

### Content Layouts
- **Grid**: Default, Reverse, Centered, Wide, Narrow
- **Cards**: Grid, Row, Column, Masonry
- **Spacing**: Tight, Normal, Loose

### Button Styles
- **Default**: Standard buttons
- **Rounded**: Fully rounded buttons
- **Outlined**: Border-only buttons
- **Minimal**: Transparent buttons

### Footer Styles
- **Default**: Standard footer
- **Minimal**: Reduced padding
- **Expanded**: Increased padding
- **Centered**: Center-aligned content

## Implementation Details

### Core Files

1. **`src/utils/seedLayout.ts`**: Main layout configuration system
2. **`src/utils/dynamicDataProvider.ts`**: Updated to use new layout system
3. **`src/components/layout/Header.tsx`**: Dynamic header with seed-based ordering
4. **`src/components/layout/Footer.tsx`**: Dynamic footer styling
5. **`src/app/page.tsx`**: Main page with layout classes
6. **`src/app/globals.css`**: CSS classes for layout variations

### Key Functions

```typescript
// Get layout configuration for a seed
const config = getSeedLayout(seed);

// Check if dynamic HTML is enabled
const isEnabled = isDynamicEnabled();

// Get effective layout (respects enable/disable)
const effectiveConfig = getEffectiveLayoutConfig(seed);

// Get CSS classes for layout
const classes = getLayoutClasses(config);
```

### Layout Detection Logic

```typescript
// In components
const searchParams = useSearchParams();
const rawSeed = Number(searchParams.get("seed") ?? "1");
const seed = getEffectiveSeed(rawSeed);
const layoutConfig = getLayoutConfig(seed);
const layoutClasses = getLayoutClasses(layoutConfig);
```

## Testing

Run the test script to verify functionality:

```bash
node test_dynamic_layout.js
```

## Security Benefits

This implementation helps prevent automated scraping by:

1. **Breaking X-Paths**: Different element orders make selectors unreliable
2. **Layout Variations**: 10 different configurations provide unpredictability
3. **Conditional Activation**: Can be enabled/disabled as needed
4. **No Content Changes**: Only layout modifications, preserving functionality

## Browser Compatibility

- Modern browsers with CSS Grid support
- Responsive design maintained across all layouts
- Graceful fallback to default layout when disabled

## Performance

- **Minimal Overhead**: Only CSS class changes, no JavaScript re-rendering
- **Cached Configurations**: Layout configs are computed once per seed
- **No Additional Requests**: All variations use same content and assets
