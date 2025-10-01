# Dynamic Attributes Update Guide

## ✅ Components Already Updated

### 1. ✅ Navbar.tsx
- **Element**: Search input
- **Event**: `SEARCH_DELIVERY_RESTAURANT`
- **Attribute**: `{...layout.getElementAttributes('SEARCH_DELIVERY_RESTAURANT', 0)}`

### 2. ✅ RestaurantCard.tsx
- **Element**: Restaurant link/card
- **Event**: `VIEW_DELIVERY_RESTAURANT`
- **Attribute**: `{...layout.getElementAttributes('VIEW_DELIVERY_RESTAURANT', cardIndex)}`

### 3. ✅ AddToCartModal.tsx
- **Elements**: 
  - Decrement button → `ITEM_DECREMENTED`
  - Increment button → `ITEM_INCREMENTED`
  - Add to cart button → `ADD_TO_CART_MENU_ITEM`
- **Attributes Added**: All buttons now have dynamic attributes

---

## 📋 Components Needing Updates

### 4. CartPage.tsx
Multiple events need dynamic attributes:

| Line | Event Type | Element | Update Required |
|------|-----------|---------|----------------|
| ~188 | DELIVERY_MODE | Delivery mode button | Add `{...layout.getElementAttributes('DELIVERY_MODE', 0)}` |
| ~205 | PICKUP_MODE | Pickup mode button | Add `{...layout.getElementAttributes('PICKUP_MODE', 0)}` |
| ~431 | ADDRESS_ADDED | Add address button | Add `{...layout.getElementAttributes('ADDRESS_ADDED', 0)}` |
| ~490 | DROPOFF_PREFERENCE | Dropoff option | Add `{...layout.getElementAttributes('DROPOFF_PREFERENCE', index)}` |
| ~663 | ITEM_DECREMENTED | Decrement button in cart | Add `{...layout.getElementAttributes('ITEM_DECREMENTED', index)}` |
| ~681 | ITEM_INCREMENTED | Increment button in cart | Add `{...layout.getElementAttributes('ITEM_INCREMENTED', index)}` |
| ~700 | EMPTY_CART | Remove item button | Add `{...layout.getElementAttributes('EMPTY_CART', index)}` |
| ~159 | PLACE_ORDER | Place order button | Add `{...layout.getElementAttributes('PLACE_ORDER', 0)}` |

### 5. QuickOrderModal.tsx
Events needing dynamic attributes:

| Line | Event Type | Element | Update Required |
|------|-----------|---------|----------------|
| ~78 | VIEW_RESTAURANT | Restaurant card click | Add `{...layout.getElementAttributes('VIEW_DELIVERY_RESTAURANT', index)}` |
| ~91 | QUICK_ORDER_STARTED | Quick order button | Add `{...layout.getElementAttributes('QUICK_ORDER_STARTED', index)}` |
| ~107 | QUICK_REORDER | Quick reorder button | Add `{...layout.getElementAttributes('QUICK_REORDER', index)}` |

### 6. RestaurantDetailPage.tsx
Events needing dynamic attributes:

| Event Type | Element | Update Required |
|-----------|---------|----------------|
| BACK_TO_ALL_RESTAURANTS | Back button | Add `{...layout.getElementAttributes('BACK_TO_ALL_RESTAURANTS', 0)}` |
| ADD_TO_CART_MODAL_OPEN | Menu item card/button | Add `{...layout.getElementAttributes('ADD_TO_CART_MODAL_OPEN', index)}` |
| VIEW_ALL_RESTAURANTS | View all link | Add `{...layout.getElementAttributes('VIEW_ALL_RESTAURANTS', 0)}` |

### 7. Other Components
Search for any other components with `logEvent()` calls:
- HeroSection.tsx
- QuickReorderSection.tsx
- TestimonialsSection.tsx
- FeaturedRestaurantsGrid.tsx
- PaginatedRestaurantsGrid.tsx

---

## 🎯 Update Pattern

For all event-triggering elements, add:
```tsx
{...layout.getElementAttributes('EVENT_TYPE', index)}
```

### Example:
```tsx
// Before
<Button onClick={() => logEvent(EVENT_TYPES.PLACE_ORDER, {...})}>
  Place Order
</Button>

// After
<Button 
  onClick={() => logEvent(EVENT_TYPES.PLACE_ORDER, {...})}
  {...layout.getElementAttributes('PLACE_ORDER', 0)}
>
  Place Order
</Button>
```

---

## 🔍 Expected Result

After updates, all interactive elements will have:
```html
<button
  id="PLACE_ORDER-180-0"
  data-seed="180"
  data-variant="0"
  data-element-type="PLACE_ORDER"
  data-layout-id="11"
>
  Place Order
</button>
```

---

## ✅ Verification Steps

1. Deploy with dynamic HTML enabled
2. Open DevTools → Elements tab
3. Inspect each button/link
4. Verify presence of: `data-seed`, `data-variant`, `data-element-type`, `data-layout-id`
5. Test with different seeds (1, 5, 180, 200, 300)
6. Confirm attributes change with seed value

