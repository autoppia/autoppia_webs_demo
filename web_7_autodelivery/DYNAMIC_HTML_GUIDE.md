# Dynamic HTML Implementation Guide for web_7_autodelivery

## ✅ Implementation Complete!

The dynamic HTML system has been successfully implemented in `web_7_autodelivery` with full feature parity to `web_6_automail`.

---

## 🎯 What's Implemented

### Core Features
- ✅ **Seeds 1-300**: Full support for 300 unique seed values
- ✅ **20+ Layout Variants**: Intelligent mapping from seeds to layouts
- ✅ **Environment Control**: `NEXT_PUBLIC_ENABLE_DYNAMIC_HTML` toggles dynamic mode
- ✅ **Dynamic Attributes**: All elements get `data-seed`, `data-variant`, `data-layout-id`
- ✅ **XPath Selectors**: Unique XPath per seed value
- ✅ **Docker Integration**: Full support in build pipeline

### Files Modified/Created

#### 1. **Dockerfile** ✅
- Accepts `ENABLE_DYNAMIC_HTML` build argument
- Passes environment variables to build process

#### 2. **docker-compose.yml** ✅
- Passes `ENABLE_DYNAMIC_HTML` from setup script to container
- Sets both `ENABLE_DYNAMIC_HTML` and `NEXT_PUBLIC_ENABLE_DYNAMIC_HTML`

#### 3. **src/lib/seed-layout.ts** ✅
- Extended from 10 seeds to 300 seeds
- Added environment variable checking
- Added XPath generation
- Added dynamic attribute generation
- Special seed mappings (180→Layout 11, 200→Layout 20, etc.)

#### 4. **src/hooks/use-seed-layout.ts** ✅
- Added `getElementAttributes()` function
- Added `generateId()` function
- Added `generateSeedClass()` function
- Returns `seed`, `isDynamicMode`, and helper functions

#### 5. **src/utils/dynamicDataProvider.ts** ✅ (NEW)
- Singleton pattern for managing dynamic HTML state
- Helper functions for element attributes, XPath, reordering
- Validates seed range (1-300)
- Environment-aware operations

#### 6. **SEED_LAYOUT_README.md** ✅
- Updated with 1-300 seed documentation
- Added deployment instructions
- Added testing guide
- Added comparison with web_6_automail

#### 7. **DYNAMIC_HTML_GUIDE.md** ✅ (NEW)
- This comprehensive guide

---

## 🚀 How to Deploy

### Option 1: Deploy Only AutoDelivery
```bash
bash scripts/setup.sh --demo=autodelivery --web_port=8006 --enable_dynamic_html=true
```

### Option 2: Deploy All Demos with Dynamic HTML
```bash
bash scripts/setup.sh --demo=all --enable_dynamic_html=true
```

### Option 3: Custom Port
```bash
bash scripts/setup.sh --demo=autodelivery --web_port=9000 --enable_dynamic_html=true
```

---

## 🧪 Testing

### 1. Verify Deployment
```bash
# Check if container is running
docker ps | grep autodelivery

# Check environment variable
docker exec autodelivery_8006-web-1 printenv NEXT_PUBLIC_ENABLE_DYNAMIC_HTML
# Expected output: true
```

### 2. Test Different Seeds
```bash
# Basic layouts
http://localhost:8006/?seed=1
http://localhost:8006/?seed=5
http://localhost:8006/?seed=10
http://localhost:8006/?seed=50
http://localhost:8006/?seed=100

# Special layouts
http://localhost:8006/?seed=180   # Ultra-wide (Layout 11)
http://localhost:8006/?seed=190   # Split-screen (Layout 18)
http://localhost:8006/?seed=200   # Asymmetric (Layout 20)
http://localhost:8006/?seed=210   # Dashboard (Layout 14)
http://localhost:8006/?seed=250   # Magazine (Layout 15)
http://localhost:8006/?seed=260   # Card-stack (Layout 19)
http://localhost:8006/?seed=270   # Premium (Layout 17)
http://localhost:8006/?seed=300   # Maximum seed
```

### 3. Inspect Dynamic Attributes
Open browser DevTools → Elements tab, then:

#### Search Input
```html
<input 
  id="SEARCH_INPUT-180-0"
  data-seed="180"
  data-variant="0"
  data-element-type="SEARCH_INPUT"
  class="w-96 rounded-full text-sm dynamic-search-input-180"
/>
```

#### Add to Cart Button
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

#### Restaurant Card
```html
<div
  id="RESTAURANT_CARD-180-0"
  data-seed="180"
  data-variant="0"
  data-element-type="RESTAURANT_CARD"
  class="restaurant-card-layout-180"
>
  <!-- Card content -->
</div>
```

---

## 📊 Seed Mapping Examples

| Seed Range | Layout ID | Description |
|------------|-----------|-------------|
| 1 | 1 | Classic layout |
| 5, 15, 25...295 | 2 | Minimalist layout |
| 8 | 1 | Classic layout |
| 160-170 | 3 | Search-focused layout |
| 180 | 11 | Ultra-wide layout |
| 190 | 18 | Split-screen layout |
| 200 | 20 | Asymmetric layout |
| 210 | 14 | Dashboard layout |
| 250 | 15 | Magazine layout |
| 260 | 19 | Card-stack layout |
| 270 | 17 | Premium layout |
| 2-300 (others) | 1-10 | Modulo-based mapping |

---

## 🔧 Usage in Components

### Basic Usage with Dynamic Attributes
```typescript
import { useSeedLayout } from '@/hooks/use-seed-layout';

function RestaurantCard({ restaurant, index }) {
  const layout = useSeedLayout();
  
  // Get dynamic attributes
  const cardAttrs = layout.getElementAttributes('RESTAURANT_CARD', index);
  const buttonAttrs = layout.getElementAttributes('VIEW_RESTAURANT', index);
  
  return (
    <div 
      {...cardAttrs}
      className={`${layout.restaurantCard.containerClass} p-4`}
    >
      <img 
        src={restaurant.image}
        className={layout.restaurantCard.imageClass}
        alt={restaurant.name}
      />
      <h3 className={layout.restaurantCard.titleClass}>
        {restaurant.name}
      </h3>
      <button
        {...buttonAttrs}
        className={layout.restaurantCard.buttonClass}
        onClick={() => handleView(restaurant.id)}
      >
        View Menu
      </button>
    </div>
  );
}
```

### Using Helper Functions
```typescript
import { useSeedLayout } from '@/hooks/use-seed-layout';

function CartButton({ item, index }) {
  const layout = useSeedLayout();
  
  return (
    <button
      id={layout.generateId('ADD_TO_CART', index)}
      className={`${layout.generateSeedClass('cart-button')} px-4 py-2`}
      {...layout.getElementAttributes('ADD_TO_CART', index)}
    >
      Add to Cart
    </button>
  );
}
```

### Using Dynamic Data Provider
```typescript
import { dynamicDataProvider } from '@/utils/dynamicDataProvider';

// Check if dynamic mode is enabled
const isDynamic = dynamicDataProvider.isDynamicModeEnabled();

// Get effective seed
const seed = dynamicDataProvider.getSeedFromUrl();

// Generate attributes
const attrs = dynamicDataProvider.generateElementAttributes('BUTTON', seed, 0);

// Reorder items based on seed
const restaurants = dynamicDataProvider.reorderElements(allRestaurants, seed);
```

---

## 🔍 XPath Examples

When dynamic HTML is enabled, each element gets a unique XPath selector:

### Input Elements
```xpath
//input[@data-seed='180']
//input[@data-seed='200']
//input[@data-seed='250']
```

### Button Elements
```xpath
//button[@data-seed='180']
//button[@data-seed='200'][@data-element-type='ADD_TO_CART']
```

### Div Elements
```xpath
//div[@data-seed='180'][@data-element-type='RESTAURANT_CARD']
//div[@data-seed='200'][@data-layout-id='20']
```

---

## 🎨 CSS Class Examples

Dynamic CSS classes generated per seed:

### Seed 1
```css
.search-container
.search-input
.restaurant-card
```

### Seed 180
```css
.search-container-v180
.dynamic-search-input-180
.restaurant-card-layout-180
```

### Seed 200
```css
.seed-200-search-container
.search-input-layout-200
.dynamic-restaurant-card-200
```

---

## 🔄 Comparison with web_6_automail

| Feature | web_6_automail | web_7_autodelivery |
|---------|----------------|-------------------|
| Seed Range | 1-300 ✅ | 1-300 ✅ |
| Environment Variable | `NEXT_PUBLIC_ENABLE_DYNAMIC_HTML` ✅ | `NEXT_PUBLIC_ENABLE_DYNAMIC_HTML` ✅ |
| Docker Integration | ✅ | ✅ |
| Dynamic Attributes | ✅ | ✅ |
| XPath Generation | ✅ | ✅ |
| Layout Variants | 20+ ✅ | 20+ ✅ |
| Special Seed Mappings | ✅ | ✅ |
| Dynamic Data Provider | ✅ | ✅ |
| useSeedLayout Hook | ✅ | ✅ |

**Result: 100% Feature Parity** 🎉

---

## 📝 Environment Variables

### Build Time (Dockerfile)
```dockerfile
ARG ENABLE_DYNAMIC_HTML=false
ENV ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
```

### Runtime (docker-compose.yml)
```yaml
environment:
  - ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML:-false}
  - NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML:-false}
```

### Setup Script (scripts/setup.sh)
```bash
ENABLE_DYNAMIC_HTML="${ENABLE_DYNAMIC_HTML:-$ENABLE_DYNAMIC_HTML_DEFAULT}"
```

---

## 🐛 Troubleshooting

### Issue 1: Dynamic attributes not appearing
**Problem**: Elements don't have `data-seed` attributes

**Solution**:
```bash
# 1. Check environment variable
docker exec autodelivery_8006-web-1 printenv NEXT_PUBLIC_ENABLE_DYNAMIC_HTML

# 2. Rebuild if needed
docker compose -p autodelivery_8006 down --volumes
bash scripts/setup.sh --demo=autodelivery --web_port=8006 --enable_dynamic_html=true

# 3. Hard refresh browser (Ctrl+Shift+R)
```

### Issue 2: All seeds show same layout
**Problem**: Different seed values don't change layout

**Possible causes**:
1. Dynamic HTML disabled → Check `NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=true`
2. Browser cache → Hard refresh
3. Container needs rebuild → Run setup script again

### Issue 3: Seed validation errors
**Problem**: Seeds > 300 don't work

**Expected behavior**: Seeds outside 1-300 default to seed 1
```typescript
// This is correct behavior
getSeedLayout(500)  // Returns layout for seed 1
getSeedLayout(0)    // Returns layout for seed 1
getSeedLayout(-5)   // Returns layout for seed 1
```

---

## ✅ Verification Checklist

- [ ] Dockerfile has `ARG ENABLE_DYNAMIC_HTML=false`
- [ ] docker-compose.yml passes `ENABLE_DYNAMIC_HTML` to build args
- [ ] `src/lib/seed-layout.ts` supports seeds 1-300
- [ ] `src/hooks/use-seed-layout.ts` returns helper functions
- [ ] `src/utils/dynamicDataProvider.ts` exists and exports helpers
- [ ] Elements have `data-seed` attribute when enabled
- [ ] Elements have `data-variant` attribute when enabled
- [ ] Elements have `data-layout-id` attribute when enabled
- [ ] Different seeds show different layouts
- [ ] Seeds 1-300 all work without errors
- [ ] Special seeds (180, 200, etc.) show unique layouts

---

## 🎉 Success!

Your dynamic HTML implementation is complete and matches `web_6_automail`! 

### Quick Test Command
```bash
# Deploy and test
bash scripts/setup.sh --demo=autodelivery --web_port=8006 --enable_dynamic_html=true

# Wait for build, then test
curl http://localhost:8006/?seed=180
curl http://localhost:8006/?seed=200
```

### Next Steps
1. Deploy using the command above
2. Test seeds 1, 5, 180, 200, 300
3. Inspect elements in DevTools
4. Verify dynamic attributes are present
5. Celebrate! 🎊

---

## 📚 Additional Resources

- **SEED_LAYOUT_README.md** - Full documentation
- **web_6_automail** - Reference implementation
- **scripts/setup.sh** - Deployment script
- **Dockerfile** - Build configuration
- **docker-compose.yml** - Runtime configuration

