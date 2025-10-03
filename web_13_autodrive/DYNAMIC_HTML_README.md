# Dynamic HTML Implementation in web_13_autodrive

## Overview

web_13_autodrive now includes dynamic HTML functionality that creates varying layouts and element structures based on URL seed parameters (1-300). This makes web scraping more difficult by introducing subtle but numerous layout variations while maintaining functional consistency.

## Key Features

### 🚗 **Seed-Based Layout System**
- **Seed Range**: 1-300 (inclusive)
- **Layout Count**: 10 different layout configurations
- **Dynamic Elements**: Containers, buttons, ride cards, and drivers with changing attributes

### 🎯 **Layout Variations**

The system provides 10 distinct layout configurations affecting:

- **Header Layout**: Top, left, right, bottom, floating positioning
- **Main Layout**: Default, sidebar, split, columns, masonry, stacked arrangements
- **Footer Position**: Bottom, top, left, right, sticky placement
- **Section Order**: Different placement of hero, booking, map, rides sections
- **Element Structure**: Adaptive CSS classes and positioning

### 🧩 **Seed Mapping Formula**

**Mapping Algorithm**: `((seed % 30) + 1) % 10 || 10`

- **Valid Range**: 1-300 (seeds outside this range default to 1)
- **Layout Cycles**: Every 30 seeds repeats the same 10 layout pattern
- **Examples**: 
  - Seed 1 → Layout 1, Seed 31 → Layout 1, Seed 61 → Layout 1 (Default)
  - Seed 2 → Layout 2, Seed 32 → Layout 2, Seed 62 → Layout 2 (Sidebar Left)
  - Seed 10 → Layout 10, Seed 40 → Layout 10, Seed 70 → Layout 10 (Masonry)

### 🎪 **Dynamic Element Attributes**

When enabled, elements receive dynamic attributes:

```html
<div 
  id="ride-card-150-0"
  data-element-type="ride-card"
  data-seed="150"
  data-variant="0"
  data-xpath="//div[@data-seed='150']"
  class="dynamic-ride-card seed-150">
  Ride content
</div>
```

## 🚀 **Deployment**

### Enable Dynamic HTML

```bash
bash scripts/setup.sh --demo=autodrive --web_port=8012 --enable_dynamic_html=true
```

### Disable Dynamic HTML (Default)

```bash
bash scripts/setup.sh --demo=autodrive --web_port=8012 --enable_dynamic_html=false
```

## 🧪 **Testing**

### Test Dynamic Behavior

```bash
# Test comprehensive dynamic HTML behavior
bash test_dynamic_html_behavior.sh
```

### Test URLs for Different Layouts

```bash
# Different layout variations (now works with seeds 1-300)
http://localhost:8012/?seed=1     # Layout 1 - Default Layout
http://localhost:8012/?seed=15    # Layout 5 - Stacked Flow Layout  
http://localhost:8012/?seed=50     # Layout 10 - Masonry Grid Layout
http://localhost:8012/?seed=100    # Layout 10 - Same as seed 50
http://localhost:8012/?seed=200    # Layout 10 - Same as seed 50

# Pattern verification (should map to same layouts)
http://localhost:8012/?seed=31     # Layout 1 - Same as seed 1
http://localhost:8012/?seed=61     # Layout 1 - Same as seed 1
http://localhost:8012/?seed=150    # Layout 10 - Same as seed 50
```

## 🏗️ **Architecture**

### Core Components

1. **`DynamicLayout.tsx`**: Main layout component that applies seed-based styling
2. **`DynamicContainer.tsx`**: Container wrapper with dynamic attributes
3. **`DynamicButton.tsx`**: Button component with seed-based styling
4. **`useSeedLayout.ts`**: Hook managing seed-based layouts
5. **`layouts.ts`**: 10 predefined layout configurations
6. **`dynamicDataProvider.ts`**: Autodrive-specific data provider

### Key Files

```
src/
├── components/
├│   ├── DynamicLayout.tsx      # Main layout component
│   ├── DynamicContainer.tsx     # Dynamic container
│   └── DynamicButton.tsx       # Dynamic button
├── library/
│   ├── layouts.ts              # Layout definitions (10 layouts)
│   └── useSeedLayout.ts        # Layout management hook  # 
└── utils/
    └── dynamicDataProvider.ts  # Data provider
```

## 🔧 **Environment Variables**

- `ENABLE_DYNAMIC_HTML`: Controls build-time behavior
- `NEXT_PUBLIC_ENABLE_DYNAMIC_HTML`: Controls client-side behavior

## 📝 **Usage Examples**

### In Components

```tsx
import DynamicLayout from '@/components/DynamicLayout';
import { DynamicContainer } from '@/components/DynamicContainer';
import { DynamicButton } from '@/components/DynamicButton';

export function RideBookingPage() {
  return (
    <DynamicLayout 
      header={<RideNavbar />}
      main={
        <DynamicContainer index={0}>
          <DynamicButton
            eventType="BOOK_RIDE"
            index={0}
            variant="primary"
          >
            Book Ride
          </DynamicButton>
        </DynamicContainer>
      }
      footer={<CustomFooter />}
    />
  );
}
```

### Layout Classes

```tsx
import { useSeedLayout } from '@/library/useSeedLayout';

function RideCard() {
  const { generateSeedClass, createDynamicStyles } = useSeedLayout();
  
  return (
    <div 
      className={generateSeedClass('ride-card')}
      style={createDynamicStyles()}
    >
      Ride with dynamic styling
    </div>
  );
}
```

## 🌟 **Benefits**

1. **Anti-Scraping**: Makes automated scraping more difficult
2. **Ride-Specific**: Tailored for ride-hailing application layouts
3. **Performance**: Minimal overhead when disabled
4. **Consistency**: Functional behavior remains constant
5. **Flexibility**: Easy to enable/disable per deployment
6. **Driver/Ride Data**: Includes autodrive-specific data structures

## 🔍 **Verification**

Check that dynamic HTML is working by inspecting elements in browser DevTools:

### ✅ **When Enabled**
- Elements have `data-seed` attributes
- Elements have `data-variant` attributes
- Elements have `data-element-type` attributes
- CSS classes include `seed-X` patterns
- Layout changes between different seeds (header position, main layout, footer placement)

### ❌ **When Disabled**
- No `data-seed` attributes
- No `data-variant` attributes
- No `data-element-type` attributes
- No `seed-X` CSS classes
- Consistent default layout regardless of seed

## 🐛 **Troubleshooting**

### Common Issues

1. **Layout not changing**: Check `ENABLE_DYNAMIC_HTML=true` environment variable
2. **Attributes missing**: Verify `NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=true`
3. **Docker issues**: Ensure build args are passed correctly
4. **Browser cache**: Clear cache or use incognito mode

### Debug Commands

```bash
# Check environment variables in container
docker exec autodrive_8012-web-1 printenv NEXT_PUBLIC_ENABLE_DYNAMIC_HTML

# View build logs
docker logs autodrive_8012-web-1 2>&1 | grep "ENABLE_DYNAMIC_HTML"
```

## 🎯 **Implementation Status**

- ✅ Dynamic layout system (seed 1-300)
- ✅ Dynamic components (Container, Button)
- ✅ Seed-based CSS classes
- ✅ Dynamic element attributes
- ✅ Layout variants (10 different configurations)
- ✅ Docker build arguments
- ✅ Environment variable configuration
- ✅ Testing scripts
- ✅ Autodrive-specific data (rides, drivers, trips, locations)

## 🔄 **Layout Configurations**

1. **Default Layout**: Header top, main center, footer bottom (standard ride-hailing)
2. **Sidebar Left**: Sidebar left with ride steps, header top, main right
3. **Vertical Header**: Header vertical left, main full width, footer bottom
4. **Inverted Layout**: Footer at top, main middle, header bottom (unconventional)
5. **Stacked Flow**: Header top, ride search → car options → trip details stacked
6. **Split Screen**: Split screen left = booking, right = ride options + reserve
7. **Car Sidebar**: Car selection sidebar, search/location top, reserve bottom
8. **Floating Header**: Floating header top, ride info center, footer left
9. **Multi Column**: Column1 = location/destination, col2 = features/options, col3 = reservation/trip
10. **Masonry Grid**: Masonry/grid arrangement mixing header, booking, car selection, footer

## 📊 **Data Structures**

### Rides
- Ride types (AutoDriverX, Comfort, AutoDriverXL, Business)
- Pricing and ETA information
- Vehicle features and passenger capacity

### Drivers
- Driver profiles with ratings and trip counts
- Vehicle information and license plates
- Status tracking and language preferences

### Trips & Locations
- Trip history with pickup/destination
- Popular locations in San Francisco
- Ride scheduling and fare tracking

The implementation is complete and ready for production use in ride-hailing applications!
