# Dynamic Seed Layout System

## Overview

The AutoCalendar application now supports dynamic UI layouts that change based on a `seed` value from the URL query parameter. This system is designed to confuse scraper agents by varying the DOM order and XPath of elements.

## How It Works

### URL Parameter
- **Parameter**: `?seed=1` to `?seed=10`
- **Default**: If no seed parameter exists, the application uses the default layout (unchanged)
- **Valid Range**: Seeds 1-10 are supported, with each providing a unique layout configuration

### Layout Configurations

Each seed value provides a different arrangement of UI elements:

#### Seed 1 (Default Layout)
- Sidebar: Left position
- Navigation: Top position  
- Search: Top position
- Calendar: Center position
- User Profile: Top position
- Create Button: In sidebar
- Mini Calendar: In sidebar
- My Calendars: In sidebar

#### Seed 2 (Navigation Left Layout)
- Sidebar: Right position
- Navigation: Left position
- Search: Top position
- Calendar: Right position
- User Profile: Top position
- Create Button: In navigation
- Mini Calendar: In navigation
- My Calendars: In navigation

#### Seed 3 (Search First Layout)
- Sidebar: Bottom position
- Navigation: Top position
- Search: Top position (first)
- Calendar: Center position
- User Profile: Top position
- Create Button: Floating
- Mini Calendar: In sidebar
- My Calendars: In sidebar

#### Seed 4 (Bottom Navigation Layout)
- Sidebar: Right position
- Navigation: Bottom position
- Search: Top position
- Calendar: Left position
- User Profile: Bottom position
- Create Button: In sidebar
- Mini Calendar: In sidebar
- My Calendars: In sidebar

#### Seed 5 (Top Heavy Layout)
- Sidebar: Left position
- Navigation: Top position
- Search: Top position
- Calendar: Center position
- User Profile: Top position
- Create Button: In navigation
- Mini Calendar: Floating
- My Calendars: In sidebar

#### Seed 6 (Sidebar Top Layout)
- Sidebar: Top position
- Navigation: Top position
- Search: Top position
- Calendar: Bottom position
- User Profile: Top position
- Create Button: In sidebar
- Mini Calendar: In sidebar
- My Calendars: In sidebar

#### Seed 7 (Navigation Right Layout)
- Sidebar: Left position
- Navigation: Right position
- Search: Right position
- Calendar: Center position
- User Profile: Right position
- Create Button: In sidebar
- Mini Calendar: In sidebar
- My Calendars: In sidebar

#### Seed 8 (Bottom Navigation with Floating)
- Sidebar: Left position
- Navigation: Bottom position
- Search: Top position
- Calendar: Center position
- User Profile: Bottom position
- Create Button: Floating
- Mini Calendar: Floating
- My Calendars: In sidebar

#### Seed 9 (Split Layout)
- Sidebar: Right position
- Navigation: Left position
- Search: Left position
- Calendar: Center position
- User Profile: Left position
- Create Button: In navigation
- Mini Calendar: In navigation
- My Calendars: In sidebar

#### Seed 10 (Compact Layout)
- Sidebar: Top position
- Navigation: Top position
- Search: Bottom position
- Calendar: Center position
- User Profile: Top position
- Create Button: In navigation
- Mini Calendar: In sidebar
- My Calendars: In sidebar

## Implementation Details

### Core Files

1. **`src/library/seedLayout.ts`**
   - Contains the `getSeedLayout()` function
   - Defines all 10 layout configurations
   - Provides `getSeedFromUrl()` helper function

2. **`src/app/page.tsx`**
   - Main calendar component with dynamic layout system
   - Uses layout configuration to render components conditionally
   - Maintains all existing functionality while rearranging UI elements

### Key Features

- **Preserves Functionality**: All event triggers and components remain intact
- **Dynamic Rendering**: Components are rendered based on layout configuration
- **Responsive Design**: Layouts adapt to different screen sizes
- **Floating Elements**: Some layouts include floating components for additional variation
- **Order Management**: Components are sorted by their order values within each container

### Event Tracking

All existing event tracking remains functional:
- SELECT_TODAY
- SELECT_DAY
- SELECT_FIVE_DAYS
- SELECT_WEEK
- SELECT_MONTH
- CELL_CLICKED
- ADD_EVENT
- CANCEL_ADD_EVENT
- DELETE_EVENT
- ADD_NEW_CALENDAR
- CREATE_CALENDAR
- CHOOSE_CALENDAR
- EVENT_WIZARD_OPEN
- EVENT_ADD_ATTENDEE
- EVENT_REMOVE_ATTENDEE
- EVENT_ADD_REMINDER
- EVENT_REMOVE_REMINDER
- SEARCH_SUBMIT

## Usage Examples

### Testing Different Layouts

1. **Default Layout**: `http://localhost:3000`
2. **Seed 1**: `http://localhost:3000?seed=1`
3. **Seed 2**: `http://localhost:3000?seed=2`
4. **Seed 3**: `http://localhost:3000?seed=3`
5. **Continue up to**: `http://localhost:3000?seed=10`

### Scraper Confusion

The dynamic layout system is designed to confuse scraper agents by:
- Changing DOM element order
- Altering XPath selectors
- Moving components to different positions
- Creating varying visual arrangements
- Maintaining functional consistency for human users

## Technical Notes

- The system uses React state to manage layout configuration
- URL parameters are read on component mount
- Layout changes are applied immediately without page refresh
- All existing CSS classes and styling are preserved
- The system is fully compatible with the existing codebase
