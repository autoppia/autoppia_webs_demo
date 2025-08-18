# Seed-Based Dynamic Layout System

This system implements a comprehensive anti-scraping solution by dynamically changing the layout, CSS classes, element attributes, and X-path selectors based on a seed parameter (1-10).

## Overview

The seed-based layout system is designed to confuse web scrapers by:

1. **Dynamic Layout Changes**: Each seed value produces a completely different layout structure
2. **Variable X-Path Selectors**: Complex and varied X-path patterns that change with each seed
3. **Dynamic Element Attributes**: Multiple attribute sets that rotate based on seed
4. **CSS Class Variations**: Different styling approaches for each seed value
5. **Element Positioning**: Various positioning strategies that change layout flow

## How It Works

### URL Parameter
Access different layouts using the `seed` parameter:
```
http://localhost:3000/?seed=1  // Layout variant 1
http://localhost:3000/?seed=2  // Layout variant 2
...
http://localhost:3000/?seed=10 // Layout variant 10
```

### Layout Variants

Each seed value (1-10) produces:

- **Different Layout Types**: grid, flex, list, masonry, carousel, table
- **Button Layouts**: standard, split, stacked, circular, floating, inline, card, minimal
- **Label Styles**: pill, tag, badge, chip, dot, underline, border, gradient
- **Spacing**: tight, normal, loose, random
- **Element Ordering**: standard, reversed, random

### X-Path Complexity

The system generates 10 different X-path patterns:

1. **Direct Attribute Matching**: Simple attribute-based selection
2. **Parent-Child Relationship**: Nested element selection
3. **Sibling Relationship**: Adjacent element selection
4. **Complex Nested Structure**: Multi-level container selection
5. **Position-Based with Class Matching**: Position and class combination
6. **Multiple Attribute Combinations**: Complex attribute logic
7. **Descendant with Specific Structure**: Deep descendant selection
8. **Ancestor-Based Selection**: Upward element selection
9. **Complex Conditional**: Multiple condition combinations
10. **Multiple Path Options**: Alternative path selection

### Element Attributes

10 different attribute sets are rotated:

1. **Standard Attributes**: Basic data attributes
2. **ARIA Attributes**: Accessibility-focused attributes
3. **Custom Data Attributes**: Component-specific attributes
4. **Semantic Attributes**: Meaningful element attributes
5. **Functional Attributes**: Behavior-related attributes
6. **Styling Attributes**: Appearance-related attributes
7. **Event Attributes**: Interaction-related attributes
8. **State Attributes**: Status-related attributes
9. **Performance Attributes**: Optimization-related attributes
10. **Security Attributes**: Security-focused attributes

## Usage

### Basic Components

```tsx
import { DynamicButton } from "@/components/DynamicButton";
import { DynamicContainer, DynamicItem } from "@/components/DynamicContainer";
import { DynamicElement } from "@/components/DynamicElement";
import { useSeedLayout } from "@/library/useSeedLayout";

// Using DynamicButton with seed-based attributes
<DynamicButton
  eventType="ADD_NEW_MATTER"
  index={0}
  onClick={handleClick}
>
  Add New Matter
</DynamicButton>

// Using DynamicContainer with seed-based layout
<DynamicContainer index={0}>
  <DynamicItem index={0}>
    Content here
  </DynamicItem>
</DynamicContainer>

// Using DynamicElement for any HTML element
<DynamicElement elementType="section" index={0}>
  <h2>Section Title</h2>
</DynamicElement>
```

### Custom Hook

```tsx
import { useSeedLayout } from "@/library/useSeedLayout";

function MyComponent() {
  const {
    seed,
    layout,
    getElementAttributes,
    getElementXPath,
    generateId,
    getLayoutClasses
  } = useSeedLayout();

  // Get current layout info
  const layoutInfo = getLayoutInfo();
  
  // Generate element attributes
  const attrs = getElementAttributes('button', 0);
  
  // Get X-path selector
  const xpath = getElementXPath('button');
  
  return (
    <div>
      <p>Current Seed: {seed}</p>
      <p>Layout Type: {layout.layoutType}</p>
    </div>
  );
}
```

## Anti-Scraping Features

### 1. Layout Confusion
- Different grid layouts (1-5 columns)
- Various flex arrangements
- Masonry and carousel layouts
- Table-based structures

### 2. Element Positioning
- 10 different positioning strategies
- Random-like element ordering
- Variable spacing patterns
- Dynamic container structures

### 3. Attribute Rotation
- 10 different attribute sets
- Complex ID generation patterns
- Multiple data attribute strategies
- Security-focused attributes

### 4. X-Path Complexity
- 10 different X-path patterns
- Complex conditional logic
- Multiple path alternatives
- Ancestor/descendant relationships

### 5. CSS Variations
- Dynamic CSS custom properties
- Variable color schemes
- Different spacing values
- Animation duration changes

## Demo Page

Visit `/layout-demo` to see all layout variations:

```
http://localhost:3000/layout-demo?seed=1
http://localhost:3000/layout-demo?seed=2
...
http://localhost:3000/layout-demo?seed=10
```

The demo page shows:
- Current layout configuration
- X-path selectors for different elements
- CSS variables being applied
- Interactive seed switching

## Implementation Details

### Seeded Random Generation
```typescript
function getSeededValue(seed: number, key: string): number {
  const str = `${seed}-${key}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
```

### Layout Variant Generation
```typescript
export function getLayoutVariant(seed: number): LayoutVariant {
  // Uses seeded values to determine:
  // - Button layout type
  // - Label style
  // - Layout type (grid, flex, etc.)
  // - Spacing
  // - Element ordering
  // - X-path variant
}
```

### Element Attribute Generation
```typescript
export function generateElementAttributes(
  elementType: string,
  seed: number,
  index: number = 0
): Record<string, string> {
  // Generates one of 10 attribute sets based on seed
  // Each set has different ID patterns, data attributes, etc.
}
```

## Benefits for Anti-Scraping

1. **Consistent User Experience**: Users see the same functionality regardless of seed
2. **Scraper Confusion**: Each seed produces completely different selectors
3. **Maintainable Code**: Centralized layout logic
4. **Extensible System**: Easy to add new variants
5. **Performance Optimized**: Minimal runtime overhead

## Security Considerations

- Seed values are validated (1-10 range)
- X-path patterns are complex but functional
- Attributes are semantic and accessible
- No security vulnerabilities introduced
- Maintains web standards compliance

## Future Enhancements

1. **More Layout Variants**: Additional layout types
2. **Dynamic Content**: Seed-based content variations
3. **Animation Patterns**: Different animation sequences
4. **Color Schemes**: Seed-based theme variations
5. **Font Variations**: Different typography patterns 