# Dynamic HTML Implementation for web_3_autozone

This implementation adds config-driven dynamic HTML content generation to web_3_autozone, allowing the system to optionally use seed data for dynamic content generation.

## Features

- **Config-driven**: Controlled by `enable_dynamic_html` flag in setup script
- **Dual mode support**: Static mode (default) and Dynamic mode (seed-driven)
- **Backward compatible**: Existing functionality remains intact when disabled
- **Modular design**: Clean separation between static and dynamic data sources

## Configuration

### Setup Script Usage

```bash
# Static mode (default behavior) - layout always uses seed=1
bash scripts/setup.sh --demo=autozone --enable_dynamic_html=false

# Dynamic mode (seed-driven content) - layout varies with seed parameter
bash scripts/setup.sh --demo=autozone --enable_dynamic_html=true
```

**Important**: When `--enable_dynamic_html=false`, the layout will always use seed=1 regardless of the seed parameter in the URL. This ensures consistent X-paths and layout behavior when dynamic HTML is disabled. All content remains the same - only the layout/X-paths change.

### Environment Variables

- `ENABLE_DYNAMIC_HTML`: Server-side environment variable
- `NEXT_PUBLIC_ENABLE_DYNAMIC_HTML`: Client-side environment variable (auto-set from server)

## Implementation Details

### 1. Dynamic Data Provider (`src/utils/dynamicDataProvider.ts`)

Central utility that manages data sources based on configuration:

- **Singleton pattern**: Single instance manages data state
- **Always loaded**: Products always loaded for consistent content
- **Layout control**: Only layout/X-paths change based on seed value
- **Helper functions**: Easy access to filtered data

Key functions:
- `getProducts()`: Returns all products (always loaded)
- `getProductById(id)`: Find specific product
- `getProductsByCategory(category)`: Filter by category
- `searchProducts(query)`: Search functionality
- `isDynamicModeEnabled()`: Check current mode
- `getEffectiveSeed(providedSeed)`: Returns provided seed if dynamic mode enabled, otherwise returns 1

### 2. Updated Components

#### Main Page (`src/app/page.tsx`)
- Uses `getEffectiveSeed()` to get the appropriate seed value
- Always uses static data for consistent content
- Layout/X-paths vary based on seed value when dynamic mode enabled
- Layout remains consistent (seed=1) when dynamic HTML is disabled

#### Search Page (`src/components/SearchPage.tsx`)
- Uses `searchProducts()` for search functionality
- Always returns search results (content is consistent)

#### Product Detail Page (`src/app/[productId]/page.tsx`)
- Uses `getEffectiveSeed()` for layout variations
- Always uses `getProductById()` for consistent content
- Layout remains consistent (seed=1) when dynamic HTML is disabled

### 3. Component Compatibility

All existing components work with both modes:
- **CategoryCard**: Accepts items as props (works with consistent data)
- **ProductCarousel**: Accepts products as props (works with consistent data)
- **SearchPage**: Uses dynamic provider for search results

## Data Flow

```
Configuration Flag (ENABLE_DYNAMIC_HTML)
    ↓
DynamicDataProvider.getInstance()
    ↓
isDynamicModeEnabled() check
    ↓
┌─────────────────┬─────────────────┐
│   Static Mode   │  Dynamic Mode   │
│                 │                 │
│ Always load     │ Always load     │
│ products        │ products        │
│                 │                 │
│ Seed = 1        │ Seed = provided │
│ (consistent     │ (variable       │
│ X-paths)        │ X-paths)        │
└─────────────────┴─────────────────┘
    ↓                     ↓
React Components ← Layout-driven rendering
```

## Testing

### Manual Testing

1. **Static Mode Test**:
   ```bash
   bash scripts/setup.sh --demo=autozone --enable_dynamic_html=false --web_port=8002
   ```
   - Visit http://localhost:8002
   - Should show static content
   - Search should return no results
   - Product pages should work with static data

2. **Dynamic Mode Test**:
   ```bash
   bash scripts/setup.sh --demo=autozone --enable_dynamic_html=true --web_port=8003
   ```
   - Visit http://localhost:8003
   - Should show dynamic content from seed data
   - Search should return filtered results
   - Product pages should work with dynamic data
   - Category cards should show real product data

### Expected Behavior

#### Static Mode (`enable_dynamic_html=false`)
- Traditional behavior preserved
- All product data loaded (consistent content)
- Search returns results (consistent functionality)
- Static category cards and images (consistent content)
- Product detail pages work with consistent data
- Layout always uses seed=1 (consistent X-paths regardless of URL seed parameter)

#### Dynamic Mode (`enable_dynamic_html=true`)
- Full seed-driven layout generation
- All product data loaded (consistent content)
- Functional search with results (consistent functionality)
- Category cards populated with consistent data
- Product detail pages work with consistent data
- All HTML generated with variable X-paths based on seed parameter
- Layout varies based on seed parameter in URL

## File Structure

```
web_3_autozone/
├── src/
│   ├── utils/
│   │   └── dynamicDataProvider.ts    # Central data provider
│   ├── app/
│   │   ├── page.tsx                  # Updated main page
│   │   └── [productId]/page.tsx     # Updated product detail
│   ├── components/
│   │   └── SearchPage.tsx           # Updated search component
│   └── data/
│       └── products.ts               # Seed data (unchanged)
├── docker-compose.yml               # Updated with env var
├── next.config.js                   # Updated with env config
└── test_dynamic_html.sh             # Test script
```

## Benefits

1. **Flexibility**: Easy switching between static and dynamic modes
2. **Backward Compatibility**: Existing functionality preserved
3. **Performance**: Dynamic data only loaded when needed
4. **Maintainability**: Clean separation of concerns
5. **Extensibility**: Easy to add more dynamic features

## Future Enhancements

- Add more dynamic data sources (APIs, databases)
- Implement caching for dynamic data
- Add configuration for different seed data sets
- Support for real-time data updates
- Add more sophisticated filtering and sorting options
