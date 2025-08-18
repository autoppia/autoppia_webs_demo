# Dynamic Layout System for AutoMail

This document explains the dynamic layout system implemented in AutoMail that changes the layout and x-paths of elements based on a seed parameter to confuse scrapers.

## Overview

The dynamic layout system allows the AutoMail application to render in 10 different layout variants, each with completely different:
- Layout structure (sidebar position, toolbar placement, etc.)
- CSS class names for elements that trigger events
- X-path selectors for interactive elements
- Visual styling and positioning

## How It Works

### 1. URL Parameter
The layout variant is determined by the `seed` parameter in the URL:
```
http://localhost:3000/?seed=1  // Variant 1: Classic Gmail
http://localhost:3000/?seed=2  // Variant 2: Right Sidebar
http://localhost:3000/?seed=3  // Variant 3: Top Navigation
...
http://localhost:3000/?seed=10 // Variant 10: Magazine Layout
```

### 2. Layout Variants

#### Variant 1: Classic Gmail
- **Layout**: Traditional Gmail-like layout with left sidebar
- **X-paths**: Standard Gmail-style selectors
- **Classes**: `email-item-hover`, `opacity-0`, etc.

#### Variant 2: Right Sidebar
- **Layout**: Sidebar on the right side
- **X-paths**: `//div[contains(@class, 'email-container')]`
- **Classes**: `email-container`, `star-container`, `select-box`

#### Variant 3: Top Navigation
- **Layout**: Navigation at the top with floating sidebar
- **X-paths**: `//section[contains(@class, 'email-card')]`
- **Classes**: `email-card`, `star-icon`, `select-icon`

#### Variant 4: Split View
- **Layout**: Three-panel split layout
- **X-paths**: `//article[contains(@class, 'email-entry')]`
- **Classes**: `email-entry`, `star-element`, `check-element`

#### Variant 5: Card Layout
- **Layout**: Email items as cards in a grid
- **X-paths**: `//div[contains(@class, 'email-card')]`
- **Classes**: `email-card`, `card-star`, `card-check`

#### Variant 6: Minimalist
- **Layout**: Clean, minimal interface
- **X-paths**: `//li[contains(@class, 'email-row')]`
- **Classes**: `email-row`, `star-icon`, `row-check`

#### Variant 7: Dashboard Style
- **Layout**: Dashboard-like layout with widgets
- **X-paths**: `//div[contains(@class, 'widget-email')]`
- **Classes**: `widget-email`, `widget-star`, `widget-check`

#### Variant 8: Mobile First
- **Layout**: Mobile-optimized layout
- **X-paths**: `//div[contains(@class, 'mobile-email')]`
- **Classes**: `mobile-email`, `mobile-star`, `mobile-check`

#### Variant 9: Terminal Style
- **Layout**: Command-line inspired interface
- **X-paths**: `//div[contains(@class, 'terminal-line')]`
- **Classes**: `terminal-line`, `line-star`, `line-check`

#### Variant 10: Magazine Layout
- **Layout**: Magazine-style grid layout
- **X-paths**: `//article[contains(@class, 'magazine-article')]`
- **Classes**: `magazine-article`, `article-star`, `article-check`

### 3. Event-Triggering Elements

Each variant changes the CSS classes and x-paths for elements that trigger events:

#### Email Items
- **Variant 1**: `email-item-hover`
- **Variant 2**: `email-container`
- **Variant 3**: `email-card`
- **Variant 4**: `email-entry`
- **Variant 5**: `email-card` (card style)
- **Variant 6**: `email-row`
- **Variant 7**: `widget-email`
- **Variant 8**: `mobile-email`
- **Variant 9**: `terminal-line`
- **Variant 10**: `magazine-article`

#### Star Buttons
- **Variant 1**: `opacity-0` (standard)
- **Variant 2**: `star-container`
- **Variant 3**: `star-icon`
- **Variant 4**: `star-element`
- **Variant 5**: `card-star`
- **Variant 6**: `star-icon`
- **Variant 7**: `widget-star`
- **Variant 8**: `mobile-star`
- **Variant 9**: `line-star`
- **Variant 10**: `article-star`

#### Checkboxes
- **Variant 1**: `input[type="checkbox"]` (standard)
- **Variant 2**: `select-box`
- **Variant 3**: `select-icon`
- **Variant 4**: `check-element`
- **Variant 5**: `card-check`
- **Variant 6**: `row-check`
- **Variant 7**: `widget-check`
- **Variant 8**: `mobile-check`
- **Variant 9**: `line-check`
- **Variant 10**: `article-check`

### 4. Action Buttons

#### Delete Buttons
- **Variant 1**: `//button[contains(text(), 'Delete')]`
- **Variant 2**: `//div[contains(@class, 'action-bar')]//button[1]`
- **Variant 3**: `//nav[contains(@class, 'action-nav')]//button[contains(@class, 'delete-btn')]`
- **Variant 4**: `//div[contains(@class, 'bulk-actions')]//span[contains(@class, 'delete-element')]`
- **Variant 5**: `//div[contains(@class, 'card-actions')]//div[contains(@class, 'card-delete')]`
- **Variant 6**: `//ul[contains(@class, 'action-list')]//li[contains(@class, 'delete-item')]`
- **Variant 7**: `//div[contains(@class, 'widget-actions')]//div[contains(@class, 'widget-delete')]`
- **Variant 8**: `//div[contains(@class, 'mobile-actions')]//div[contains(@class, 'mobile-delete')]`
- **Variant 9**: `//div[contains(@class, 'terminal-actions')]//span[contains(@class, 'action-delete')]`
- **Variant 10**: `//div[contains(@class, 'magazine-actions')]//div[contains(@class, 'action-delete')]`

#### Compose Buttons
- **Variant 1**: `//button[contains(text(), 'Compose')]`
- **Variant 2**: `//div[contains(@class, 'compose-fab')]//button`
- **Variant 3**: `//div[contains(@class, 'floating-compose')]//button`
- **Variant 4**: `//aside[contains(@class, 'sidebar-panel')]//span[contains(@class, 'compose-element')]`
- **Variant 5**: `//div[contains(@class, 'header-actions')]//div[contains(@class, 'header-compose')]`
- **Variant 6**: `//div[contains(@class, 'center-actions')]//button[contains(@class, 'center-compose')]`
- **Variant 7**: `//div[contains(@class, 'floating-widget')]//div[contains(@class, 'widget-compose')]`
- **Variant 8**: `//div[contains(@class, 'mobile-fab')]//div[contains(@class, 'fab-compose')]`
- **Variant 9**: `//div[contains(@class, 'terminal-header')]//span[contains(@class, 'header-compose')]`
- **Variant 10**: `//div[contains(@class, 'floating-magazine')]//div[contains(@class, 'magazine-compose')]`

## Implementation Details

### Core Files

1. **`src/library/layoutVariants.ts`**
   - Defines all 10 layout variants
   - Contains x-path mappings for each variant
   - Provides utility functions to get layout based on seed

2. **`src/contexts/LayoutContext.tsx`**
   - Manages the current layout variant
   - Reads seed from URL parameters
   - Updates URL when seed changes

3. **`src/components/DynamicLayout.tsx`**
   - Renders different layouts based on current variant
   - Handles responsive behavior for each layout

4. **Updated Components**
   - `EmailList.tsx`: Applies variant-specific CSS classes
   - `Toolbar.tsx`: Uses different class names for search and theme controls
   - `ComposeModal.tsx`: Applies variant-specific classes to buttons
   - `Sidebar.tsx`: Uses different class names for compose button

### Testing the System

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test different variants**:
   - Visit `http://localhost:3000/?seed=1` for Classic Gmail
   - Visit `http://localhost:3000/?seed=2` for Right Sidebar
   - Continue through all 10 variants

3. **Use the built-in controls**:
   - The app includes debug controls in the top-left corner
   - Click the numbered buttons to switch between variants
   - The current variant is displayed in the top-right corner

## Anti-Scraping Benefits

### 1. Dynamic X-Paths
Each variant uses completely different x-path selectors, making it impossible for scrapers to rely on consistent selectors.

### 2. Changing CSS Classes
Elements that trigger events have different CSS class names in each variant, breaking class-based selectors.

### 3. Layout Variations
The visual layout changes significantly between variants, making it difficult to use position-based scraping.

### 4. Element Structure
The DOM structure and hierarchy changes between variants, breaking structural selectors.

### 5. Event Confusion
Since the same functionality is triggered from different elements with different selectors, scrapers cannot reliably identify interactive elements.

## Usage Examples

### For Development
```typescript
import { useLayout } from '@/contexts/LayoutContext';

function MyComponent() {
  const { currentVariant, seed, setSeed } = useLayout();
  
  // Access current variant info
  console.log(`Current variant: ${currentVariant.name}`);
  
  // Change variant programmatically
  setSeed(5); // Switch to Card Layout
}
```

### For Testing
```typescript
// Test all variants
for (let i = 1; i <= 10; i++) {
  // Navigate to variant
  window.location.href = `http://localhost:3000/?seed=${i}`;
  
  // Test functionality
  // All events should work the same regardless of variant
}
```

## Security Considerations

1. **Seed Validation**: The system validates that the seed is between 1-10
2. **Default Fallback**: If no seed is provided, it defaults to variant 1
3. **URL Persistence**: The seed is maintained in the URL for consistent behavior
4. **No Breaking Changes**: All functionality works identically across all variants

## Future Enhancements

1. **More Variants**: Add additional layout variants beyond 10
2. **Random Rotation**: Automatically rotate between variants
3. **User Preferences**: Allow users to set preferred variants
4. **A/B Testing**: Use variants for feature testing
5. **Analytics**: Track which variants are most effective against scrapers 