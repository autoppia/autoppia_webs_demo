# 🚀 Quick Reference Card - Dynamic Structure

## ⚡ Quick Commands

```bash
# Enable dynamic structure
bash scripts/setup.sh --demo=autozone --dynamic_html_structure=true --web_port=8002

# Enable both (layout + structure)
bash scripts/setup.sh --demo=autozone --enable_dynamic_html=true --dynamic_html_structure=true --web_port=8002

# Disable dynamic structure
bash scripts/setup.sh --demo=autozone --dynamic_html_structure=false --web_port=8002
```

---

## 🎯 URL Parameters

```bash
# Layout control (1-300)
?seed=X

# Structure control (1-300)
?seed-structure=Y

# Combined
?seed=180&seed-structure=250
```

---

## 📊 Seed-Structure → Variation Mapping

```
1, 11, 21, ..., 291  → Variation 1  (Standard Amazon)
2, 12, 22, ..., 292  → Variation 2  (Modern Shopping Hub)
3, 13, 23, ..., 293  → Variation 3  (E-Commerce Express)
4, 14, 24, ..., 294  → Variation 4  (Shop Smart)
5, 15, 25, ..., 295  → Variation 5  (Quick Shop)
6, 16, 26, ..., 296  → Variation 6  (Premium Marketplace)
7, 17, 27, ..., 297  → Variation 7  (Value Store)
8, 18, 28, ..., 298  → Variation 8  (Modern Outlet)
9, 19, 29, ..., 299  → Variation 9  (Marketplace Hub)
10, 20, 30, ..., 300 → Variation 10 (Express Market)
```

**Formula:** `((seed-structure - 1) % 10) + 1`

---

## 🎨 The 10 Variations - Quick Comparison

| # | Cart | Add to Cart | Search | Greeting |
|---|------|-------------|--------|----------|
| 1 | Cart | Add to Cart | Search Autozon | Hello, user |
| 2 | Basket | Add to Basket | What are you looking for? | Welcome back |
| 3 | Shopping Cart | Include in Cart | Search products... | Hi there |
| 4 | My Cart | Add to My Cart | Find what you need | Hey there |
| 5 | Bag | Put in Bag | Search our store | Welcome |
| 6 | Shopping Bag | Add to Shopping Bag | Discover premium products | Good day |
| 7 | Cart | Add | Find great deals | Hello |
| 8 | Shopping Basket | Add to Basket | Search marketplace | Greetings |
| 9 | Trolley | Pop in Trolley | Explore products | Hi friend |
| 10 | Bag | Add | Quick search | Hello |

---

## 💻 Code Usage

```tsx
import { useDynamicStructure } from "@/context/DynamicStructureContext";

function MyComponent() {
  const { getText, getId } = useDynamicStructure();
  
  return (
    <button id={getId("add_to_cart_button")}>
      {getText("add_to_cart")}
    </button>
  );
}
```

---

## 🧪 Quick Tests

```bash
# Test variation 1
http://localhost:8002?seed-structure=1

# Test variation 10
http://localhost:8002?seed-structure=10
http://localhost:8002?seed-structure=100
http://localhost:8002?seed-structure=300

# Test combination
http://localhost:8002?seed=180&seed-structure=50
```

---

## 📝 Most Common Text Keys

```
getText("cart")
getText("add_to_cart")
getText("buy_now")
getText("search_placeholder")
getText("proceed_to_checkout")
getText("shopping_cart")
getText("quantity")
getText("price")
getText("total")
getText("in_stock")
getText("see_more")
getText("learn_more")
```

---

## 🆔 Most Common Element IDs

```
getId("search_input")
getId("search_button")
getId("cart_link")
getId("add_to_cart_button")
getId("buy_now_button")
getId("checkout_button")
getId("quantity_select")
getId("remove_button")
```

---

## 📊 Stats

- **Pages**: 5/5 ✅
- **Components**: 8/8 ✅
- **Text Keys**: 80+
- **Element IDs**: 15+
- **Variations**: 10
- **Seed Range**: 1-300
- **Total Combinations**: 90,000

---

## 🎯 What's Dynamic

✅ All button text
✅ All labels  
✅ All placeholders
✅ All aria-labels
✅ All element IDs
✅ All section titles
✅ All link text
✅ All messages
✅ All form labels
✅ All alt text

---

## 📚 Full Docs

- `COMPLETE_DYNAMIC_STRUCTURE.md` - 100% coverage details
- `COMPLETE_GUIDE.md` - Complete guide
- `FINAL_IMPLEMENTATION_SUMMARY.md` - Technical summary

---

## 🎉 Ready to Use!

```bash
bash scripts/setup.sh --demo=autozone --dynamic_html_structure=true --web_port=8002
```

Then visit: `http://localhost:8002?seed-structure=1`

🚀 **Happy testing!**

