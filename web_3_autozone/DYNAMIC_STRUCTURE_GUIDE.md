# Dynamic HTML Structure Implementation Guide

This guide explains how dynamic text content and element IDs are implemented in web_3_autozone based on `seed-structure` values (1-5). This is **separate** from the existing dynamic layout system controlled by the `seed` parameter.

---

## 📋 Overview

### Two Independent Dynamic Systems

1. **Dynamic HTML (Layout)** - Controlled by `seed` parameter (1-300)
   - Changes visual layout, component ordering, spacing, styles
   - Environment variable: `ENABLE_DYNAMIC_HTML`

2. **Dynamic HTML Structure (Content)** - Controlled by `seed-structure` parameter (1-5)
   - Changes text content, button labels, placeholders, element IDs
   - Environment variable: `ENABLE_DYNAMIC_HTML_STRUCTURE`

Both can be enabled independently or together!

---

## 🎯 Architecture

### Key Files

1. **`src/data/structureVariations.json`** - Contains 5 text/ID variations
2. **`src/utils/dynamicStructureProvider.ts`** - Provider singleton for structure management
3. **`src/context/DynamicStructureContext.tsx`** - React context for components
4. **Components** - Updated to use `getText()` and `getId()` hooks

### File Structure

```
web_3_autozone/
├── src/
│   ├── data/
│   │   └── structureVariations.json          # 5 structure variations
│   ├── utils/
│   │   └── dynamicStructureProvider.ts       # Structure provider utility
│   ├── context/
│   │   └── DynamicStructureContext.tsx       # React context
│   ├── components/
│   │   └── layout/
│   │       └── Header.tsx                    # Updated with dynamic text/IDs
│   └── app/
│       ├── layout.tsx                        # Wraps with DynamicStructureProvider
│       └── page.tsx                          # Home page with dynamic text
├── next.config.js                            # Env var configuration
├── Dockerfile                                # Build args
├── docker-compose.yml                        # Docker env vars
└── test_dynamic_structure.sh                 # Test script
```

---

## 🔧 How It Works

### 1. Structure Variations JSON

The `structureVariations.json` file contains 5 different text/ID sets:

```json
{
  "variations": [
    {
      "id": 1,
      "name": "Standard Amazon Style",
      "texts": {
        "search_placeholder": "Search Autozon",
        "cart": "Cart",
        "account_greeting": "Hello, user",
        ...
      },
      "ids": {
        "search_input": "search-input",
        "cart_link": "cart-link",
        ...
      }
    },
    ...
  ]
}
```

### 2. Dynamic Structure Provider

Manages structure selection and provides text/ID access:

```typescript
// Get effective seed-structure (1-5)
const seedStructure = getEffectiveSeedStructure(providedSeed);

// Get text by key
const searchPlaceholder = getText("search_placeholder");

// Get ID by key
const searchInputId = getId("search_input");
```

### 3. React Context

Components use the `useDynamicStructure` hook:

```tsx
function Header() {
  const { getText, getId } = useDynamicStructure();
  
  return (
    <Input
      id={getId("search_input")}
      placeholder={getText("search_placeholder")}
    />
  );
}
```

### 4. URL Parameter

The `seed-structure` URL parameter controls which variation to use:

```
http://localhost:8002?seed-structure=1  # Standard Amazon Style
http://localhost:8002?seed-structure=2  # Modern Shopping Hub
http://localhost:8002?seed-structure=3  # E-Commerce Express
http://localhost:8002?seed-structure=4  # Shop Smart
http://localhost:8002?seed-structure=5  # Quick Shop
```

---

## 🚀 Usage

### Enable in Scripts

```bash
# Enable dynamic structure only
bash scripts/setup.sh --demo=autozone --dynamic_html_structure=true --web_port=8002

# Disable dynamic structure (static mode)
bash scripts/setup.sh --demo=autozone --dynamic_html_structure=false --web_port=8002

# Enable both dynamic layout AND dynamic structure
bash scripts/setup.sh \
  --demo=autozone \
  --enable_dynamic_html=true \
  --dynamic_html_structure=true \
  --web_port=8002
```

### Docker Compose

```bash
# Set environment variable
ENABLE_DYNAMIC_HTML_STRUCTURE=true docker-compose up --build

# Or in .env file
ENABLE_DYNAMIC_HTML_STRUCTURE=true
```

### Direct Docker Build

```bash
docker build \
  --build-arg ENABLE_DYNAMIC_HTML_STRUCTURE=true \
  -t autozone:dynamic-structure .
```

---

## 📊 Structure Variations

### Variation 1: Standard Amazon Style
- **Theme**: Classic e-commerce
- **Search**: "Search Autozon"
- **Cart**: "Cart"
- **Greeting**: "Hello, user"
- **Account**: "Account & Lists"

### Variation 2: Modern Shopping Hub
- **Theme**: Contemporary shopping
- **Search**: "What are you looking for?"
- **Cart**: "Basket"
- **Greeting**: "Welcome back"
- **Account**: "Your Account"

### Variation 3: E-Commerce Express
- **Theme**: Quick shopping
- **Search**: "Search products..."
- **Cart**: "Shopping Cart"
- **Greeting**: "Hi there"
- **Account**: "My Account"

### Variation 4: Shop Smart
- **Theme**: Intelligent shopping
- **Search**: "Find what you need"
- **Cart**: "My Cart"
- **Greeting**: "Hey there"
- **Account**: "Account Settings"

### Variation 5: Quick Shop
- **Theme**: Fast checkout
- **Search**: "Search our store"
- **Cart**: "Bag"
- **Greeting**: "Welcome"
- **Account**: "Profile & Lists"

---

## 🧪 Testing

### Run Test Script

```bash
cd web_3_autozone
bash test_dynamic_structure.sh
```

The script will:
1. Deploy static structure mode (port 8002)
2. Deploy dynamic structure mode (port 8003)
3. Deploy combined mode (port 8004)

### Manual Testing

**Test Static Mode:**
```bash
bash scripts/setup.sh --demo=autozone --dynamic_html_structure=false --web_port=8002

# Both URLs should show identical text
http://localhost:8002?seed-structure=1
http://localhost:8002?seed-structure=5
```

**Test Dynamic Mode:**
```bash
bash scripts/setup.sh --demo=autozone --dynamic_html_structure=true --web_port=8003

# Different text for each seed-structure
http://localhost:8003?seed-structure=1  # "Search Autozon" / "Cart"
http://localhost:8003?seed-structure=2  # "What are you looking for?" / "Basket"
http://localhost:8003?seed-structure=3  # "Search products..." / "Shopping Cart"
```

**Test Combined Mode:**
```bash
bash scripts/setup.sh \
  --demo=autozone \
  --enable_dynamic_html=true \
  --dynamic_html_structure=true \
  --web_port=8004

# Combine layout and text variations
http://localhost:8004?seed=5&seed-structure=2
# seed=5 → Modern minimalist layout
# seed-structure=2 → Modern Shopping Hub text
```

---

## 📝 Adding New Text Keys

To add new dynamic text or IDs:

1. **Update JSON** - Add to `structureVariations.json`:
```json
{
  "texts": {
    "new_button_text": "Click Me"
  },
  "ids": {
    "new_button_id": "btn-action"
  }
}
```

2. **Use in Component**:
```tsx
function MyComponent() {
  const { getText, getId } = useDynamicStructure();
  
  return (
    <button id={getId("new_button_id")}>
      {getText("new_button_text")}
    </button>
  );
}
```

---

## 🔍 Environment Variables

### Build Time
- `ENABLE_DYNAMIC_HTML_STRUCTURE` - Controls structure mode (true/false)
- `NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE` - Client-side access

### Runtime
- Same variables available in browser via `process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE`

### Default Values
- **Local Development**: `true` (automatically enabled)
- **Docker Production**: `false` (must be explicitly enabled)

---

## 🎨 Text Keys Available

### Header Navigation
- `search_placeholder` - Search input placeholder
- `search_button_aria` - Search button aria-label
- `cart` - Cart link text
- `all_categories` - Category dropdown text
- `account_greeting` - Account greeting text
- `account_lists` - Account menu text
- `returns` - Returns text
- `orders` - Orders text
- `language` - Language selector text

### Secondary Navigation
- `all_menu` - All menu button
- `todays_deals` - Today's deals link
- `buy_again` - Buy again link
- `customer_service` - Customer service link
- `registry` - Registry link
- `gift_cards` - Gift cards link
- `sell` - Sell link
- `delivery_banner` - Delivery banner text

### Home Page
- `home_title` - Kitchen categories title
- `delivery_title` - Delivery section title
- `essentials_title` - Home essentials title
- `decor_title` - Home decor title
- `refresh_title` - Refresh space title
- `gaming_title` - Gaming section title
- `beauty_title` - Beauty section title

### Link Text
- `see_more` - See more link
- `learn_more` - Learn more link
- `explore_all` - Explore all link
- `discover_more` - Discover more link
- `shop_now` - Shop now link

### Product Actions
- `add_to_cart` - Add to cart button
- `buy_now` - Buy now button
- `view_details` - View details link

---

## 🎯 Element IDs Available

### Search Components
- `search_input` - Main search input
- `search_button` - Search submit button
- `category_selector` - Category dropdown

### Navigation
- `logo_link` - Logo/home link
- `cart_link` - Shopping cart link
- `cart_count` - Cart item count
- `account_dropdown` - Account dropdown
- `language_selector` - Language selector
- `all_menu_button` - All categories button

### Product Components
- `add_to_cart_button` - Add to cart button
- `buy_now_button` - Buy now button
- `hero_slider` - Hero slider
- `product_carousel` - Product carousel
- `category_card` - Category card

---

## 💡 Best Practices

1. **Always provide fallbacks**:
   ```tsx
   getText("key", "Default Text")
   getId("key", "default-id")
   ```

2. **Keep text keys consistent** across all variations

3. **Test all variations** before deployment

4. **Use semantic key names** (e.g., `search_placeholder` not `text1`)

5. **Document new keys** when adding them

---

## 🐛 Troubleshooting

### Text not changing?
- Check `ENABLE_DYNAMIC_HTML_STRUCTURE` environment variable
- Verify `seed-structure` parameter in URL
- Check browser console for errors

### IDs not unique?
- Ensure each variation uses unique IDs
- Check for duplicate ID definitions in JSON

### Build errors?
- Verify JSON syntax in `structureVariations.json`
- Check all required fields are present in each variation

---

## 📊 Summary

| Feature | Parameter | Range | Controls |
|---------|-----------|-------|----------|
| Dynamic Layout | `seed` | 1-300 | Layout, spacing, styles |
| Dynamic Structure | `seed-structure` | 1-5 | Text content, IDs |

Both systems work independently and can be combined for maximum flexibility!

---

## 🚀 Quick Start

```bash
# 1. Enable dynamic structure
bash scripts/setup.sh --demo=autozone --dynamic_html_structure=true --web_port=8002

# 2. Test different variations
open http://localhost:8002?seed-structure=1  # Standard
open http://localhost:8002?seed-structure=2  # Modern
open http://localhost:8002?seed-structure=3  # Express
open http://localhost:8002?seed-structure=4  # Smart
open http://localhost:8002?seed-structure=5  # Quick

# 3. Combine with layout variations
open http://localhost:8002?seed=5&seed-structure=2
```

Enjoy your dynamic content! 🎉

