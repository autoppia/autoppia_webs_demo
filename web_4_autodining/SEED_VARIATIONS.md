# Seed-Based Layout and X-Path Variations

This document explains how to use the new seed-based variation system in the AutoDining application.

## Overview

The seed-based variation system allows you to dynamically change layouts, styling, and x-paths based on the seed value from the URL parameter (e.g., `?seed=1` to `?seed=10`). This is useful for A/B testing, UI variations, and ensuring different x-paths for automation testing.

## How It Works

1. **URL Parameter**: The seed value is extracted from the URL query parameter `?seed=X`
2. **Normalization**: The seed is normalized to be between 1-10 (if seed=0, it defaults to 1)
3. **Variation Selection**: Each seed value (1-10) corresponds to a different variation of styling and layout
4. **X-Path Generation**: Each variation gets a unique `data-testid` attribute that can be used for x-path generation

## Available Variation Types

### 1. Restaurant Cards (`restaurantCard`)
- **Seed 1**: `rounded-xl border shadow-sm bg-white w-[255px]` with `data-testid="restaurant-card-1"`
- **Seed 2**: `rounded-lg border-2 shadow-md bg-gray-50 w-[260px]` with `data-testid="restaurant-card-2"`
- **Seed 3**: `rounded-2xl border shadow-lg bg-white w-[250px]` with `data-testid="restaurant-card-3"`
- And so on...

### 2. Book Buttons (`bookButton`)
- **Seed 1**: `bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded` with `data-testid="book-btn-1"`
- **Seed 2**: `bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg` with `data-testid="book-btn-2"`
- **Seed 3**: `bg-purple-600 hover:bg-purple-700 text-white px-3 py-3 rounded-full` with `data-testid="book-btn-3"`
- And so on...

### 3. Search Bars (`searchBar`)
- **Seed 1**: `w-full px-4 py-2 border rounded-lg` with `data-testid="search-bar-1"`
- **Seed 2**: `w-full px-6 py-3 border-2 rounded-xl` with `data-testid="search-bar-2"`
- And so on...

### 4. Dropdowns (`dropdown`)
- **Seed 1**: `absolute z-10 bg-white border rounded-lg shadow-lg` with `data-testid="dropdown-1"`
- **Seed 2**: `absolute z-10 bg-gray-50 border-2 rounded-xl shadow-xl` with `data-testid="dropdown-2"`
- And so on...

### 5. Headers (`header`)
- **Seed 1**: `bg-white shadow-sm border-b` with `data-testid="header-1"`
- **Seed 2**: `bg-gray-50 shadow-md border-b-2` with `data-testid="header-2"`
- And so on...

### 6. Navigation (`navigation`)
- **Seed 1**: `flex space-x-4` with `data-testid="nav-1"`
- **Seed 2**: `flex space-x-6` with `data-testid="nav-2"`
- And so on...

### 7. Forms (`form`)
- **Seed 1**: `space-y-4` with `data-testid="form-1"`
- **Seed 2**: `space-y-6` with `data-testid="form-2"`
- And so on...

## Usage Examples

### Basic Usage

```tsx
import { useSeedVariation } from "@/components/library/utils";

function MyComponent() {
  const buttonVariation = useSeedVariation("bookButton");
  
  return (
    <button 
      className={buttonVariation.className}
      data-testid={buttonVariation.dataTestId}
    >
      Click me
    </button>
  );
}
```

### Multiple Variations in One Component

```tsx
function RestaurantCard() {
  const cardVariation = useSeedVariation("restaurantCard");
  const buttonVariation = useSeedVariation("bookButton");
  
  return (
    <div className={cardVariation.className} data-testid={cardVariation.dataTestId}>
      <h3>Restaurant Name</h3>
      <button className={buttonVariation.className} data-testid={buttonVariation.dataTestId}>
        Book Now
      </button>
    </div>
  );
}
```

### Getting X-Path

```tsx
import { SeedVariationManager, getSeedFromUrl } from "@/components/library/utils";

function getXPath() {
  const seed = getSeedFromUrl();
  const xpath = SeedVariationManager.getXPath("bookButton", seed);
  console.log(xpath); // Output: //*[@data-testid="book-btn-1"] (for seed=1)
}
```

## X-Path Examples

Based on the seed value, you'll get different x-paths:

- **Seed 1**: `//*[@data-testid="restaurant-card-1"]`
- **Seed 2**: `//*[@data-testid="restaurant-card-2"]`
- **Seed 3**: `//*[@data-testid="restaurant-card-3"]`
- And so on...

## Testing Different Seeds

To test different variations, simply change the URL:

- `http://localhost:3000/?seed=1` - Uses variation 1
- `http://localhost:3000/?seed=2` - Uses variation 2
- `http://localhost:3000/?seed=3` - Uses variation 3
- ...
- `http://localhost:3000/?seed=10` - Uses variation 10

## Adding New Variation Types

To add a new variation type, update the `SeedVariationManager` class in `src/components/library/utils.ts`:

```tsx
private static variations: SeedVariations = {
  // ... existing variations
  
  // New variation type
  myNewType: [
    { className: "class-for-seed-1", dataTestId: "my-new-type-1" },
    { className: "class-for-seed-2", dataTestId: "my-new-type-2" },
    // ... add 10 variations total
  ],
};
```

## Benefits

1. **A/B Testing**: Easily test different UI variations
2. **Automation Testing**: Different x-paths for each seed value
3. **Consistent Variations**: Centralized system ensures consistent behavior
4. **Easy Maintenance**: All variations defined in one place
5. **Type Safety**: TypeScript ensures correct usage

## Implementation Status

The following components have been updated to use the seed variation system:

- ✅ Main page (`/src/app/page.tsx`)
- ✅ Restaurant detail page (`/src/app/restaurant/[restaurantId]/page.tsx`)
- ✅ Booking page (`/src/app/booking/[restaurantId]/[time]/page.tsx`)
- ✅ Restaurant cards
- ✅ Book buttons
- ✅ Search bars
- ✅ Forms
- ✅ Dropdowns

## Future Enhancements

1. Add more variation types (modals, tooltips, etc.)
2. Add CSS custom properties for more granular control
3. Add animation variations
4. Add layout grid variations
5. Add responsive design variations 