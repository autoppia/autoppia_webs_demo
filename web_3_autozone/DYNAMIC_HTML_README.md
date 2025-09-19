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
# Static mode (default behavior)
bash scripts/setup.sh --demo=autozone --enable_dynamic_html=false

# Dynamic mode (seed-driven content)
bash scripts/setup.sh --demo=autozone --enable_dynamic_html=true
```

### Environment Variables

- `ENABLE_DYNAMIC_HTML`: Server-side environment variable
- `NEXT_PUBLIC_ENABLE_DYNAMIC_HTML`: Client-side environment variable (auto-set from server)

## Implementation Details

### 1. Dynamic Data Provider (`src/utils/dynamicDataProvider.ts`)

Central utility that manages data sources based on configuration:

- **Singleton pattern**: Single instance manages data state
- **Lazy loading**: Products only loaded when dynamic mode enabled
- **Fallback support**: Returns empty arrays when static mode
- **Helper functions**: Easy access to filtered data

Key functions:
- `getProducts()`: Returns all products or empty array
- `getProductById(id)`: Find specific product
- `getProductsByCategory(category)`: Filter by category
- `searchProducts(query)`: Search functionality
- `isDynamicModeEnabled()`: Check current mode

### 2. Updated Components

#### Main Page (`src/app/page.tsx`)
- Uses `isDynamicModeEnabled()` to determine data source
- Maps seed data to category items when dynamic mode enabled
- Falls back to static data when disabled

#### Search Page (`src/components/SearchPage.tsx`)
- Uses `searchProducts()` for dynamic search
- Returns empty results when static mode

#### Product Detail Page (`src/app/[productId]/page.tsx`)
- Uses `getDynamicProductById()` when dynamic mode enabled
- Falls back to static `getProductById()` when disabled

### 3. Component Compatibility

All existing components work with both modes:
- **CategoryCard**: Accepts items as props (works with both static and dynamic data)
- **ProductCarousel**: Accepts products as props (works with both modes)
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
│ Empty arrays    │ Load products   │
│ Static defaults  │ from seed data  │
│                 │                 │
└─────────────────┴─────────────────┘
    ↓                     ↓
React Components ← Data-driven rendering
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
- No dynamic product data
- Search returns empty results
- Static category cards and images
- Product detail pages work with existing static data

#### Dynamic Mode (`enable_dynamic_html=true`)
- Full seed-driven content generation
- Dynamic product lists and carousels
- Functional search with filtered results
- Category cards populated with real product data
- Product detail pages work with seed data
- All HTML generated from `products.ts` seed data

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
