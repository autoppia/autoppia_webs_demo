# 🧪 Dynamic System Validation

This document explains how to validate that the dynamic system works correctly across all websites.

## 📋 Minimum Requirements

For a website to pass validation, it must meet these requirements:

### V1 - DOM Structure
- ✅ **Minimum 10 active wrappers/decoy** on the website
- ✅ **Minimum 3 order changes** implemented

### V3 - Attributes and Texts
- ✅ **Minimum 20 dynamic IDs** (keys in `id-variants.json` or local usage)
- ✅ **Minimum 15 dynamic classes** (keys in `class-variants.json` or local usage)
- ✅ **Minimum 15 dynamic texts** (keys in `text-variants.json` or local usage)

### Variants
- ✅ **Each key must have at least 3 variants** (recommended: 5-10)

### Determinism
- ✅ **Same seed = same result** (automatically verified)

---

## 🚀 How to Run the Test

### Option 1: From Node.js (Recommended)

```bash
# From the project root
node src/dynamic/test-dynamic-system.js
```

This test verifies:
- ✅ File structure
- ✅ Variants in JSONs
- ✅ System determinism

### Option 2: From Browser

1. Open the website in the browser
2. Open the console (F12)
3. Copy and paste the content of `test-dynamic-system.js`
4. Execute: `testDynamicSystem()`

This test verifies:
- ✅ DOM usage (wrappers, decoys, IDs, classes)
- ✅ Changes between different seeds

---

## ⚙️ Configuration for Other Websites

The script is **generic** and can be adapted to different websites. You only need to modify the configuration at the beginning of the file:

```javascript
// In test-dynamic-system.js
const MIN_REQUIREMENTS = {
  v1Wrappers: 10,      // Adjust according to the website
  v1OrderChanges: 3,   // Adjust according to the website
  v3Ids: 20,           // Adjust according to the website
  v3Classes: 15,       // Adjust according to the website
  v3Texts: 15,         // Adjust according to the website
  minVariants: 3,      // Adjust according to the website
};

// If the folder structure is different:
const FILE_PATHS = {
  idVariants: 'src/dynamic/v3/data/id-variants.json',
  // ... adjust paths if necessary
};
```

---

## 📊 Interpreting Results

### ✅ Successful Validation

```
✅ DYNAMIC SYSTEM: VALIDATION SUCCESSFUL
   The system meets all minimum requirements.
```

**Means:** The website is ready and meets all requirements.

### ⚠️ Requires Attention

```
⚠️  DYNAMIC SYSTEM: REQUIRES ATTENTION
   Some requirements are not met. Review the errors above.
```

**Means:** You need to review and fix the errors shown.

---

## 🔍 Manual Verification

### 1. Verify V1 (Wrappers/Decoys)

Open the browser console and execute:

```javascript
// Count wrappers
document.querySelectorAll('[data-dyn-wrap]').length

// Count decoys
document.querySelectorAll('[data-decoy]').length

// Total V1
document.querySelectorAll('[data-v1="true"]').length
```

**Expected result:** At least 10 elements.

### 2. Verify V3 (Dynamic IDs)

```javascript
// See unique IDs
Array.from(document.querySelectorAll('[id]'))
  .map(el => el.id)
  .filter(id => id && id.length > 0)
  .length
```

**Expected result:** At least 20 unique IDs.

### 3. Verify Changes Between Seeds

1. Open the website with `?seed=1`
2. Note some IDs, classes, and texts
3. Change to `?seed=42`
4. Verify that IDs, classes, and texts changed

**Expected result:** Values should be different.

---

## 📝 Checklist for Implementers

When implementing the dynamic system on a new website, verify:

- [ ] **V1 Wrappers/Decoys:** At least 10 uses of `dyn.v1.addWrapDecoy()`
- [ ] **V1 Order:** At least 3 uses of `dyn.v1.changeOrderElements()`
- [ ] **V3 IDs:** At least 20 uses of `dyn.v3.getVariant()` with `ID_VARIANTS_MAP`
- [ ] **V3 Classes:** At least 15 uses of `dyn.v3.getVariant()` with `CLASS_VARIANTS_MAP`
- [ ] **V3 Texts:** At least 15 uses of `dyn.v3.getVariant()` for texts
- [ ] **Variants:** Each key has at least 3 variants
- [ ] **Seed=1:** Always returns the original version
- [ ] **Determinism:** Same seed = same result

---

## 🐛 Troubleshooting

### "No V1 elements found"

**Cause:** V1 is disabled or not being used.

**Solution:**
1. Verify `NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true` in `.env`
2. Make sure to use `dyn.v1.addWrapDecoy()` in components

### "Missing keys for IDs/Classes/Texts"

**Cause:** Not enough variants defined.

**Solution:**
1. Add more keys to JSONs (`id-variants.json`, `class-variants.json`, `text-variants.json`)
2. Or use local variants in components
3. Or adjust `MIN_REQUIREMENTS` in the script if requirements are different for your website

### "Determinism failed"

**Cause:** Error in `selectVariantIndex` or `hashString` function.

**Solution:**
1. Verify that `hashString` and `selectVariantIndex` are correctly implemented
2. Make sure there are no non-deterministic modifications

---

## 📚 References

- [Complete Documentation](./DYNAMIC_SYSTEM_DOCUMENTATION.md)
- [Test Code](./test-dynamic-system.js)

---

## ✅ Approval Criteria

A website **PASSES** validation if:

1. ✅ All tests pass without errors
2. ✅ Meets all minimum requirements (or adjusted for that website)
3. ✅ Seed=1 returns the original version
4. ✅ Different seeds produce different results
5. ✅ The system is deterministic

**If all these criteria are met, the website is ready for production.** ✅

---

## 🔄 Adaptation for Other Websites

The script is designed to be **generic**. To adapt it to another website:

1. **Copy** `test-dynamic-system.js` to the new website
2. **Adjust** `MIN_REQUIREMENTS` according to that website's requirements
3. **Adjust** `FILE_PATHS` if the folder structure is different
4. **Run** the test and fix any errors that appear

The script will automatically detect:
- ✅ If files exist
- ✅ If there are enough variants
- ✅ If the system is deterministic
- ✅ If it's being used in the DOM (in browser)

---

## 📖 Quick Start Guide

### Step 1: Run the Test

```bash
# Navigate to the project root
cd /path/to/web_project

# Run the test
node src/dynamic/test-dynamic-system.js
```

### Step 2: Review Results

- If you see `✅ VALIDATION SUCCESSFUL`: The website is ready!
- If you see `⚠️ REQUIRES ATTENTION`: Fix the errors shown

### Step 3: Fix Issues (if any)

- Add missing variants to JSON files
- Increase usage of `dyn.v1.addWrapDecoy()` or `dyn.v3.getVariant()`
- Adjust `MIN_REQUIREMENTS` if your website has different needs

### Step 4: Re-run the Test

```bash
node src/dynamic/test-dynamic-system.js
```

Repeat until all tests pass! ✅
