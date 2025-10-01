# Default Layout Changed to Seed 6

## ✅ Change Summary

The default layout for `web_7_autodelivery` has been changed from **seed 1** to **seed 6** (which maps to Layout Variant 7).

---

## 📊 What This Means

### Before:
- No seed parameter → Layout 1
- Dynamic HTML disabled → Layout 1
- Invalid seed → Layout 1
- URL: `http://localhost:8002/` → Layout 1

### After:
- No seed parameter → **Layout 7** (from seed 6)
- Dynamic HTML disabled → **Layout 7** (from seed 6)
- Invalid seed → **Layout 7** (from seed 6)
- URL: `http://localhost:8002/` → **Layout 7** (from seed 6)

---

## 🎨 Layout 7 Characteristics

Based on the seed-layout mapping:
- **Seed 6** → **Layout ID 7**
- Clean, content-focused design
- Hidden navigation layout
- Clean content focus

---

## 📁 Files Modified

### 1. **src/lib/seed-layout.ts**
- `getEffectiveSeed()` - Changed default from 1 to 6
- `getSeedFromUrl()` - Changed default from 1 to 6

### 2. **src/hooks/use-seed-layout.ts**
- Initial state - Changed from seed 1 to seed 6
- `updateLayout()` - Changed URL param default from 1 to 6

### 3. **src/utils/dynamicDataProvider.ts**
- `getEffectiveSeed()` - Changed default from 1 to 6
- `getLayoutConfig()` - Changed default from 1 to 6
- `getSeedFromUrl()` - Changed default from 1 to 6

---

## 🧪 Testing

### Test Default Layout
```bash
# Deploy
bash scripts/setup.sh --demo=autodelivery --web_port=8002 --enable_dynamic_html=true

# Visit without seed parameter (should show Layout 7)
http://localhost:8002/

# Verify it matches seed 6
http://localhost:8002/?seed=6
```

Both URLs should now show the **same layout** (Layout 7).

### Test Other Seeds Still Work
```bash
# These should show different layouts
http://localhost:8002/?seed=1    # Layout 1
http://localhost:8002/?seed=5    # Layout 2
http://localhost:8002/?seed=180  # Layout 11
http://localhost:8002/?seed=200  # Layout 20
```

---

## 🔍 Dynamic Attributes

With seed 6 as default, elements will now have:

```html
<!-- Default (no seed parameter) -->
<button 
  id="PLACE_ORDER-6-0"
  data-seed="6"
  data-variant="6"
  data-element-type="PLACE_ORDER"
  data-layout-id="7"
>
  Place Order
</button>

<!-- Explicitly setting seed=1 -->
<button 
  id="PLACE_ORDER-1-0"
  data-seed="1"
  data-variant="1"
  data-element-type="PLACE_ORDER"
  data-layout-id="1"
>
  Place Order
</button>
```

---

## 📝 Seed to Layout Mapping Reference

| Seed | Layout ID | Description |
|------|-----------|-------------|
| 1 | 1 | Classic layout |
| 5 | 2 | Minimalist layout |
| **6** | **7** | **Hidden nav layout (NEW DEFAULT)** |
| 8 | 1 | Classic layout |
| 180 | 11 | Ultra-wide layout |
| 200 | 20 | Asymmetric layout |

---

## ✅ Benefits

1. **Better Default**: Layout 7 provides a cleaner, more modern look
2. **Consistent**: All "default" scenarios now use the same layout
3. **Predictable**: Easy to test default behavior with seed=6
4. **Flexible**: Other seeds still work as expected

---

## 🔄 Rollback (If Needed)

To revert to seed 1 as default, change all occurrences of:
```typescript
// From
return 6;
const seed = seedParam ? parseInt(seedParam, 10) : 6;

// To
return 1;
const seed = seedParam ? parseInt(seedParam, 10) : 1;
```

In the three files listed above.

---

**Status**: ✅ Implemented and tested  
**Default Layout**: Seed 6 → Layout Variant 7  
**Impact**: All default views now use Layout 7

