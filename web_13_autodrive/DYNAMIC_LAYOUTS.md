# Dynamic Layout System

This document describes the dynamic layout system implemented for the AutoDriver web application. The system allows the entire site layout to change based on a `seed` value from the URL query parameter.

## Overview

The dynamic layout system ensures that:
- **All site elements always render** - no elements are removed or hidden
- **Only placement/order/containers change** - elements are rearranged according to predefined layouts
- **All events remain part of the DOM** - all tracking events continue to work regardless of layout

## Usage

Add a `seed` parameter to any page URL to change the layout:

```
/?seed=1          # Layout 1 (Default)
/?seed=2          # Layout 2 (Sidebar Left)
/?seed=3          # Layout 3 (Vertical Header)
/?seed=4          # Layout 4 (Inverted Layout)
/?seed=5          # Layout 5 (Stacked Flow)
/?seed=6          # Layout 6 (Split Screen)
/?seed=7          # Layout 7 (Car Sidebar)
/?seed=8          # Layout 8 (Floating Header)
/?seed=9          # Layout 9 (Multi Column)
/?seed=10         # Layout 10 (Masonry Grid)
```

If no seed is provided or seed is invalid, the default layout is used.

## Layout Descriptions

### Seed 1 - Default Layout
- **Description**: Standard layout with header top, content center, footer bottom
- **Structure**: Header top → Hero → Booking → Map → Rides → Footer bottom
- **Class**: `layout-default`

### Seed 2 - Sidebar Left
- **Description**: Sidebar left with ride steps, header top, map/content right
- **Structure**: Header top → [Booking + Rides sidebar] + [Map + Hero main content] → Footer bottom
- **Class**: `layout-sidebar-left`

### Seed 3 - Vertical Header
- **Description**: Header vertical left, content full width, footer bottom
- **Structure**: [Header left] + [Hero → Booking → Map → Rides] → Footer bottom
- **Class**: `layout-vertical-header`

### Seed 4 - Inverted Layout
- **Description**: Footer at top, booking section middle, map right, header bottom
- **Structure**: Footer top → [Booking + Map] → Hero → Rides → Header bottom
- **Class**: `layout-inverted`

### Seed 5 - Stacked Flow
- **Description**: Ride search first, then car options, then trip details stacked
- **Structure**: Header top → Booking → Rides → Hero → Map → Footer bottom
- **Class**: `layout-stacked`

### Seed 6 - Split Screen
- **Description**: Split screen: left = booking, right = ride options + reserve
- **Structure**: Header top → [Booking left] + [Rides right] → Map → Hero → Footer bottom
- **Class**: `layout-split`

### Seed 7 - Car Sidebar
- **Description**: Car selection sidebar, search/location top, reserve button bottom
- **Structure**: Header top → Booking → Map → [Rides sidebar] → Hero → Footer bottom
- **Class**: `layout-car-sidebar`

### Seed 8 - Floating Header
- **Description**: Footer sticky left, header floating top, ride info center
- **Structure**: [Header floating] → Hero → Booking → Rides → Map → [Footer left]
- **Class**: `layout-floating`

### Seed 9 - Multi Column
- **Description**: Multi-column layout: col1 = location/destination, col2 = features/options, col3 = reservation/trip
- **Structure**: Header top → [Booking | Rides | Hero] → Map (full width) → Footer bottom
- **Class**: `layout-multi-column`

### Seed 10 - Masonry Grid
- **Description**: Masonry/grid arrangement mixing header, booking, car selection, footer
- **Structure**: Header top → [Hero (2 cols) | Booking | Rides] → [Map (2 cols)] → Footer bottom
- **Class**: `layout-masonry`

## Technical Implementation

### Core Files

1. **`src/library/layouts.ts`** - Layout configuration and utility functions
2. **`src/components/DynamicLayout.tsx`** - Main layout component
3. **`src/components/SiteElements.tsx`** - Element organization component
4. **`src/app/globals.css`** - Layout-specific CSS styles

### Key Components

#### `getSeedLayout(seed?: number)`
Returns a layout configuration object based on the seed value.

#### `DynamicLayout`
Main component that renders different layouts based on the seed parameter.

#### `SiteElements`
Organizes and renders site elements in the order specified by the current layout.

### Event Preservation

All tracking events are preserved across layouts:
- `ENTER_LOCATION`
- `ENTER_DESTINATION`
- `SEE_PRICES`
- `SEARCH_LOCATION`
- `SEARCH_DESTINATION`
- `EXPLORE_FEATURES`
- `SELECT_DATE`
- `SELECT_TIME`
- `NEXT_PICKUP`
- `SEARCH`
- `SELECT_CAR`
- `RESERVE_RIDE`
- `TRIP_DETAILS`
- `CANCEL_RESERVATION`

## Testing

### Layout Test Page
Visit `/layout-test` to see all available layouts and test different seed values.

### Manual Testing
1. Navigate to any page (home or trip page)
2. Add `?seed=N` to the URL where N is 1-10
3. Observe the layout changes
4. Verify all interactive elements still work
5. Check that all events are still tracked

### Example URLs
```
http://localhost:3000/?seed=1
http://localhost:3000/ride/trip?seed=5
http://localhost:3000/layout-test?seed=3
```

## CSS Classes

Each layout has specific CSS classes that control:
- Flexbox/grid arrangements
- Element ordering
- Responsive behavior
- Visual styling

The CSS is organized in `@layer components` to ensure proper specificity and maintainability.

## Responsive Design

All layouts are responsive and adapt to different screen sizes:
- Mobile: Single column layouts
- Tablet: Adjusted spacing and sizing
- Desktop: Full layout features

## Browser Compatibility

The system uses modern CSS features:
- CSS Grid
- Flexbox
- CSS Custom Properties
- Modern JavaScript (ES6+)

Compatible with all modern browsers (Chrome, Firefox, Safari, Edge).

## Performance Considerations

- Layout changes are client-side only
- No server-side rendering impact
- CSS transitions provide smooth layout changes
- Minimal JavaScript overhead

## Future Enhancements

Potential improvements:
1. Animation between layout changes
2. User preference persistence
3. A/B testing integration
4. Dynamic layout generation
5. Layout preview mode
