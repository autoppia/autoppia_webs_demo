# Dynamic Structure Usage Examples

This guide shows practical examples of how to use the dynamic structure system in your components.

---

## 🎯 Basic Usage in Components

### Example 1: Simple Button

```tsx
"use client";
import { useDynamicStructure } from "@/context/DynamicStructureContext";

export function AddToCartButton({ productId }: { productId: string }) {
  const { getText, getId } = useDynamicStructure();
  
  return (
    <button
      id={getId("add_to_cart_button")}
      className="bg-blue-600 text-white px-4 py-2 rounded"
      onClick={() => handleAddToCart(productId)}
    >
      {getText("add_to_cart")}
    </button>
  );
}
```

**Results by seed-structure:**
- Structure 1: `<button id="add-to-cart-btn">Add to Cart</button>`
- Structure 2: `<button id="basket-add-btn">Add to Basket</button>`
- Structure 3: `<button id="cart-add">Include in Cart</button>`

---

### Example 2: Search Component

```tsx
"use client";
import { useState } from "react";
import { useDynamicStructure } from "@/context/DynamicStructureContext";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const { getText, getId } = useDynamicStructure();
  
  return (
    <div className="search-container">
      <input
        id={getId("search_input")}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={getText("search_placeholder")}
        className="border rounded px-4 py-2"
      />
      <button
        id={getId("search_button")}
        aria-label={getText("search_button_aria")}
        onClick={() => handleSearch(query)}
      >
        🔍
      </button>
    </div>
  );
}
```

**Results by seed-structure:**
- Structure 1: placeholder="Search Autozon", id="search-input"
- Structure 2: placeholder="What are you looking for?", id="product-search"
- Structure 3: placeholder="Search products...", id="main-search"

---

### Example 3: Category Card with Dynamic Footer

```tsx
"use client";
import { useDynamicStructure } from "@/context/DynamicStructureContext";

export function ProductCategoryCard({ 
  title, 
  products 
}: { 
  title: string; 
  products: Product[] 
}) {
  const { getText, getId } = useDynamicStructure();
  
  return (
    <div id={getId("category_card")} className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <a href="/products" className="text-blue-600 hover:underline mt-4 block">
        {getText("see_more")}
      </a>
    </div>
  );
}
```

**Results by seed-structure:**
- Structure 1: "See more"
- Structure 2: "View more"
- Structure 3: "Show more"
- Structure 4: "More items"
- Structure 5: "View all"

---

## 🛒 Real-World Examples

### Example 4: Shopping Cart Page

```tsx
"use client";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useCart } from "@/context/CartContext";

export function CartPage() {
  const { getText, getId } = useDynamicStructure();
  const { state } = useCart();
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        {getText("cart")}
      </h1>
      
      {state.items.length === 0 ? (
        <p className="text-gray-500">Your {getText("cart").toLowerCase()} is empty</p>
      ) : (
        <>
          {state.items.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
          
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg">Total:</span>
              <span className="text-2xl font-bold">${state.total}</span>
            </div>
            
            <button
              id={getId("buy_now_button")}
              className="w-full bg-yellow-500 text-black py-3 rounded mt-4 font-bold"
            >
              {getText("buy_now")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

**Results by seed-structure:**
- Structure 1: Title="Cart", Button="Buy Now"
- Structure 2: Title="Basket", Button="Purchase Now"
- Structure 3: Title="Shopping Cart", Button="Quick Buy"
- Structure 4: Title="My Cart", Button="Order Now"
- Structure 5: Title="Bag", Button="Instant Buy"

---

### Example 5: Product Detail Page

```tsx
"use client";
import { useDynamicStructure } from "@/context/DynamicStructureContext";

export function ProductDetail({ product }: { product: Product }) {
  const { getText, getId } = useDynamicStructure();
  
  return (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div>
        <img src={product.image} alt={product.title} />
      </div>
      
      <div>
        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
        <p className="text-2xl font-bold text-red-600 mb-4">{product.price}</p>
        
        <p className="text-gray-700 mb-6">{product.description}</p>
        
        <div className="space-y-3">
          <button
            id={getId("add_to_cart_button")}
            className="w-full bg-yellow-500 text-black py-3 rounded font-bold"
          >
            {getText("add_to_cart")}
          </button>
          
          <button
            id={getId("buy_now_button")}
            className="w-full bg-orange-500 text-white py-3 rounded font-bold"
          >
            {getText("buy_now")}
          </button>
          
          <a
            href="#details"
            className="block text-center text-blue-600 hover:underline"
          >
            {getText("view_details")}
          </a>
        </div>
      </div>
    </div>
  );
}
```

---

### Example 6: Footer Navigation

```tsx
"use client";
import { useDynamicStructure } from "@/context/DynamicStructureContext";

export function Footer() {
  const { getText } = useDynamicStructure();
  
  return (
    <footer className="bg-gray-900 text-white p-8">
      <div className="grid grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold mb-4">{getText("account_lists")}</h3>
          <ul className="space-y-2">
            <li><a href="/orders">{getText("orders")}</a></li>
            <li><a href="/returns">{getText("returns")}</a></li>
            <li><a href="/registry">{getText("registry")}</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold mb-4">{getText("customer_service")}</h3>
          <ul className="space-y-2">
            <li><a href="/help">Help Center</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold mb-4">Shop</h3>
          <ul className="space-y-2">
            <li><a href="/deals">{getText("todays_deals")}</a></li>
            <li><a href="/gifts">{getText("gift_cards")}</a></li>
            <li><a href="/sell">{getText("sell")}</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
```

---

## 🎨 Adding New Text Keys

### Step 1: Add to JSON

Edit `src/data/structureVariations.json`:

```json
{
  "variations": [
    {
      "id": 1,
      "texts": {
        "wishlist": "Wishlist",
        "compare": "Compare Products",
        "save_for_later": "Save for Later"
      },
      "ids": {
        "wishlist_button": "btn-wishlist",
        "compare_button": "btn-compare"
      }
    },
    {
      "id": 2,
      "texts": {
        "wishlist": "Favorites",
        "compare": "Product Comparison",
        "save_for_later": "Add to Favorites"
      },
      "ids": {
        "wishlist_button": "favorites-btn",
        "compare_button": "compare-btn"
      }
    }
    // ... repeat for all 5 variations
  ]
}
```

### Step 2: Use in Component

```tsx
export function ProductActions({ productId }: { productId: string }) {
  const { getText, getId } = useDynamicStructure();
  
  return (
    <div className="flex gap-2">
      <button id={getId("wishlist_button")}>
        ❤️ {getText("wishlist")}
      </button>
      
      <button id={getId("compare_button")}>
        ⚖️ {getText("compare")}
      </button>
      
      <button>
        💾 {getText("save_for_later")}
      </button>
    </div>
  );
}
```

---

## 🧪 Testing Your Component

### Test Component with Different Variations

```tsx
// In your test file
import { render } from '@testing-library/react';
import { DynamicStructureProvider } from '@/context/DynamicStructureContext';

test('renders different text for each variation', () => {
  const { rerender } = render(
    <DynamicStructureProvider>
      <AddToCartButton productId="123" />
    </DynamicStructureProvider>
  );
  
  // Test Structure 1
  expect(screen.getByText("Add to Cart")).toBeInTheDocument();
  
  // Test Structure 2 (would need to update seed-structure)
  // ... etc
});
```

---

## 💡 Best Practices

### 1. Always Provide Fallbacks

```tsx
// ✅ Good - has fallback
getText("new_key", "Default Text")

// ❌ Bad - no fallback
getText("new_key")
```

### 2. Use Semantic Key Names

```tsx
// ✅ Good - descriptive
getText("add_to_cart")
getText("search_placeholder")

// ❌ Bad - unclear
getText("button1")
getText("text3")
```

### 3. Keep Keys Consistent

Ensure all 5 variations have the same keys:

```json
// ✅ Good - all have same keys
{
  "id": 1,
  "texts": { "button": "Add" }
},
{
  "id": 2,
  "texts": { "button": "Include" }
}

// ❌ Bad - missing keys
{
  "id": 1,
  "texts": { "button": "Add" }
},
{
  "id": 2,
  "texts": { "btn": "Include" }  // Different key!
}
```

### 4. Document New Keys

When adding keys, update documentation:

```tsx
// Add comment in component
const { getText } = useDynamicStructure();

// wishlist: "Wishlist" | "Favorites" | "My List"
const wishlistText = getText("wishlist");
```

---

## 🔍 Debugging

### Check Current Variation

```tsx
import { useDynamicStructure } from "@/context/DynamicStructureContext";

export function DebugPanel() {
  const { currentVariation, seedStructure, isEnabled } = useDynamicStructure();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-0 right-0 bg-black text-white p-4">
      <h3>Dynamic Structure Debug</h3>
      <p>Enabled: {isEnabled ? 'Yes' : 'No'}</p>
      <p>Seed-Structure: {seedStructure}</p>
      <p>Variation: {currentVariation.name}</p>
      <p>ID: {currentVariation.id}</p>
    </div>
  );
}
```

### Log Available Keys

```tsx
import { getAllTexts, getAllIds } from "@/utils/dynamicStructureProvider";

console.log('Available texts:', getAllTexts());
console.log('Available IDs:', getAllIds());
```

---

## 📊 Complete Component Example

Here's a fully-featured component using all dynamic structure features:

```tsx
"use client";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useState } from "react";

export function FullFeaturedComponent() {
  const { getText, getId, currentVariation } = useDynamicStructure();
  const [quantity, setQuantity] = useState(1);
  
  return (
    <div className="product-actions">
      {/* Dynamic title */}
      <h2>{getText("home_title")}</h2>
      
      {/* Dynamic input with ID */}
      <input
        id={getId("search_input")}
        type="search"
        placeholder={getText("search_placeholder")}
        className="border rounded px-4 py-2"
      />
      
      {/* Dynamic buttons with IDs and text */}
      <div className="button-group">
        <button
          id={getId("add_to_cart_button")}
          className="btn-primary"
        >
          {getText("add_to_cart")}
        </button>
        
        <button
          id={getId("buy_now_button")}
          className="btn-secondary"
        >
          {getText("buy_now")}
        </button>
      </div>
      
      {/* Dynamic links */}
      <div className="links">
        <a href="/more">{getText("see_more")}</a>
        <a href="/info">{getText("learn_more")}</a>
        <a href="/explore">{getText("explore_all")}</a>
      </div>
      
      {/* Show current variation (debug) */}
      {process.env.NODE_ENV === 'development' && (
        <small className="text-gray-500">
          Using: {currentVariation.name}
        </small>
      )}
    </div>
  );
}
```

---

## 🎉 Summary

You now know how to:
- ✅ Use `getText()` for dynamic text
- ✅ Use `getId()` for dynamic IDs
- ✅ Add new text keys to JSON
- ✅ Test components with variations
- ✅ Debug dynamic structure issues
- ✅ Follow best practices

Happy coding! 🚀

