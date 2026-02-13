# AutoConnect - Dynamic Layout System

AutoConnect is a LinkedIn-like professional networking platform with a dynamic layout system designed to confuse scraper agents while maintaining full functionality for legitimate users.

## 🎯 Anti-Scraping Features

The dynamic layout system changes the DOM structure and element positioning based on a `seed` value from URL query parameters, making it extremely difficult for automated scrapers to reliably extract data.

### Key Features:
- **10 Different Layout Variations** (seeds 1-10)
- **Dynamic Element Positioning** - Headers, sidebars, and content areas move
- **Shuffled Navigation Order** - Menu items appear in different sequences
- **Reordered Content Feed** - Posts and job listings change order
- **Varied Search Placement** - Search bars appear in different locations
- **All Event Triggers Preserved** - Full functionality maintained

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd web_9_autoconnect
npm install
npm run dev
```

### Testing Different Layouts
Visit the demo page to see all layout variations:
```
http://localhost:3000/demo
```

Or test specific seeds directly:
```
http://localhost:3000/?seed=1
http://localhost:3000/?seed=2
...
http://localhost:3000/?seed=10
```

## 📐 Layout Variations

### Seed 1: Reverse Layout
- Sidebar moves to the right
- Navigation order reversed
- Standard feed order

### Seed 2: Vertical Layout
- Header positioned on the left
- Sidebar at the top
- Search in sidebar
- Reversed feed order

### Seed 3: Horizontal Layout
- Sidebar at the bottom
- Post box on the left
- Shuffled navigation and feed
- Search in main area

### Seed 4: Grid Layout
- 3-column grid layout
- No sidebars
- Floating search
- Post box on the right

### Seed 5: Sidebar-Top Layout
- Sidebars at the top
- Post box at the bottom
- Reversed feed order

### Seed 6: Sidebar-Bottom Layout
- Sidebars at the bottom
- Shuffled navigation
- Search in sidebar

### Seed 7: Center-Focus Layout
- Post box in center
- Shuffled feed order
- Search in main area

### Seed 8: Split-View Layout
- 2-column split layout
- Sidebar on the right
- Floating search
- Reversed navigation and feed

### Seed 9: Masonry Layout
- Masonry-style post layout
- Shuffled navigation and feed
- Standard search placement

### Seed 10: Complete Reverse
- Header at bottom
- Sidebar on the right
- Post box at bottom
- Everything reversed

## 🏗️ Architecture

### Core Files

#### `src/library/layouts.ts`
- Defines layout configurations for each seed
- Provides utility functions for layout classes
- Handles element shuffling and ordering

#### `src/library/useSeed.ts`
- Custom hook to read seed from URL query params
- Returns layout configuration based on seed
- Handles validation (seeds 1-10 only)

#### `src/components/LayoutWrapper.tsx`
- Wraps the entire app
- Applies body-level layout adjustments
- Handles header positioning side effects

### Layout Configuration Interface

```typescript
interface LayoutConfig {
  mainLayout: 'default' | 'reverse' | 'vertical' | 'horizontal' | 'grid' | 'sidebar-top' | 'sidebar-bottom' | 'center-focus' | 'split-view' | 'masonry';
  headerPosition: 'top' | 'bottom' | 'left' | 'right' | 'hidden';
  sidebarPosition: 'left' | 'right' | 'top' | 'bottom' | 'none';
  postBoxPosition: 'top' | 'bottom' | 'left' | 'right' | 'center';
  feedOrder: 'normal' | 'reverse' | 'shuffled';
  navOrder: 'normal' | 'reverse' | 'shuffled';
  searchPosition: 'header' | 'sidebar' | 'main' | 'floating';
  filtersPosition: 'top' | 'bottom' | 'left' | 'right' | 'sidebar';
  jobCardsLayout: 'list' | 'grid' | 'cards' | 'compact';
  profileLayout: 'standard' | 'compact' | 'expanded' | 'sidebar';
}
```

## 🎯 Event Tracking

All event tracking remains fully functional across all layout variations:

- **POST_STATUS** - Post creation events
- **LIKE_POST** - Post like/unlike events
- **COMMENT_ON_POST** - Comment events
- **SEARCH_USERS** - User search events
- **SEARCH_JOBS** - Job search events
- **HOME_NAVBAR** - Home navigation events
- **JOBS_NAVBAR** - Jobs navigation events
- **PROFILE_NAVBAR** - Profile navigation events
- **VIEW_USER_PROFILE** - Profile view events
- **CONNECT_WITH_USER** - Connection events
- **APPLY_FOR_JOB** - Job application events
- **VIEW_JOB** - Job view events
- **VIEW_ALL_RECOMMENDATIONS** - Recommendation events
- **FOLLOW_PAGE** - Follow/unfollow events

## 🔧 Customization

### Adding New Layouts
1. Add new layout type to `LayoutConfig` interface
2. Define layout configuration in `getSeedLayout()`
3. Add corresponding CSS classes in `getLayoutClasses()`
4. Update component rendering logic

### Modifying Existing Layouts
1. Edit the layout configuration in `getSeedLayout()`
2. Update CSS classes in `getLayoutClasses()`
3. Test with different seeds

## 🛡️ Anti-Scraping Effectiveness

### What Changes:
- **DOM Structure** - Element hierarchy varies
- **XPath Selectors** - Become unreliable
- **CSS Selectors** - May need updates
- **Element Order** - Randomized sequences
- **Positioning** - Elements move around

### What Stays the Same:
- **Event Functionality** - All interactions work
- **Data Content** - Same information available
- **User Experience** - Intuitive navigation
- **Accessibility** - Screen readers still work

## 🧪 Testing

### Manual Testing
1. Visit `/demo` to see all layouts
2. Test each seed (1-10) on different pages
3. Verify all events still trigger
4. Check responsive behavior

### Automated Testing
```bash
npm run test
```

## 📝 License

This project is part of the AutoConnect platform. See the main project license for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with multiple seeds
5. Submit a pull request

## 📞 Support

For questions about the dynamic layout system, please open an issue in the repository.
