# Dynamic Layout System for web_10_autowork

## Overview

This implementation provides a dynamic layout system that rearranges UI elements based on a `seed` parameter from the URL query string. The purpose is to confuse scraper agents by varying the DOM order and XPath of elements.

## How It Works

### 1. URL Parameter
- **Default**: No seed parameter → uses default layout
- **Valid seeds**: `?seed=1` to `?seed=10` → uses specific layout configuration
- **Invalid seeds**: Any other value → falls back to default layout

### 2. Layout Configuration
The system uses a `LayoutConfig` interface that defines:
- **Main page sections order**: jobs, hires, experts
- **Post job wizard steps order**: title, skills, scope, budget, description
- **Expert page sections order**: profile, stats, about, reviews, sidebar
- **Hire form sections order**: jobDetails, contractTerms, expertSummary
- **Button positions**: left, right, center, top, bottom

### 3. Implementation Files

#### Core Files
- `src/library/utils.ts` - Contains `getSeedLayout()` function and layout configurations
- `src/library/useSeedLayout.ts` - Custom hook for managing seed state
- `src/library/events.ts` - Event logging system (unchanged)

#### Updated Components
- `src/app/page.tsx` - Main page with dynamic section ordering
- `src/app/expert/[slug]/ExpertProfileClient.tsx` - Expert profile with dynamic layout
- `src/app/expert/[slug]/hire/HireFormClient.tsx` - Hire form with dynamic button positioning

#### Test Page
- `src/app/test-layout/page.tsx` - Test page to demonstrate different layouts

## Layout Variations

### Seed 1
- **Main sections**: experts → jobs → hires
- **Post job steps**: skills → title → scope → budget → description
- **Button positions**: postJob(left), back(right), submit(left), close(top-left)

### Seed 2
- **Main sections**: hires → experts → jobs
- **Post job steps**: description → title → skills → scope → budget
- **Button positions**: postJob(center), back(center), submit(center), close(bottom-right)

### Seed 3
- **Main sections**: jobs → experts → hires
- **Post job steps**: scope → skills → title → budget → description
- **Button positions**: postJob(right), back(left), submit(right), close(bottom-left)

### Seeds 4-10
Each seed has unique variations following the same pattern.

## Event Tracking

All event tracking remains intact and functional:
- `POST_A_JOB`
- `WRITE_JOB_TITLE`
- `NEXT_SKILLS`
- `BACK_BUTTON`
- `CLOSE_POST_A_JOB_WINDOW`
- `SUBMIT_JOB`
- `ATTACH_FILE_CLICKED`
- `SEARCH_SKILL`
- `ADD_SKILL`
- `REMOVE_SKILL`
- `BOOK_A_CONSULTATION`
- `HIRE_BTN_CLICKED`
- `SELECT_HIRING_TEAM`
- `HIRE_CONSULTANT`
- `CANCEL_HIRE`

## Testing

### Test Page
Visit `/test-layout` to see:
- Current layout configuration
- Test different seed values
- Navigate to different pages with current seed
- View button position configurations

### Manual Testing
1. Visit `/?seed=1` - See layout variation 1
2. Visit `/?seed=2` - See layout variation 2
3. Visit `/` (no seed) - See default layout
4. Visit `/?seed=invalid` - See default layout (fallback)

## Technical Details

### Hook Usage
```tsx
import { useSeedLayout } from "@/library/useSeedLayout";

function MyComponent() {
  const { seed, layout, setSeed } = useSeedLayout();
  
  // Use layout.mainSections, layout.buttonPositions, etc.
}
```

### Layout Configuration
```tsx
interface LayoutConfig {
  mainSections: string[];
  postJobSections: string[];
  expertSections: string[];
  hireFormSections: string[];
  formFields: Record<string, string[]>;
  buttonPositions: Record<string, 'left' | 'right' | 'center' | 'top' | 'bottom'>;
}
```

### URL Parameter Reading
```tsx
import { getSeedFromURL } from "@/library/utils";

const seed = getSeedFromURL(); // Returns number | undefined
```

## Benefits for Scraper Confusion

1. **DOM Order Variation**: Elements appear in different orders based on seed
2. **XPath Changes**: Element selectors become unreliable across different seeds
3. **Button Position Changes**: Interactive elements move to different locations
4. **Section Reordering**: Major page sections change their sequence
5. **Form Field Reordering**: Form steps appear in different sequences

## Maintenance

### Adding New Layouts
1. Add new configuration to `getSeedLayout()` function in `utils.ts`
2. Update the `LayoutConfig` interface if needed
3. Test with the test page

### Adding New Sections
1. Update the `LayoutConfig` interface
2. Add section to all layout configurations
3. Update component rendering logic

### Adding New Button Positions
1. Update the `buttonPositions` type in `LayoutConfig`
2. Add position configurations to all layouts
3. Update component CSS classes

## Security Considerations

- The system is client-side only and doesn't affect server-side rendering
- All functionality remains intact regardless of layout
- Event tracking continues to work normally
- No sensitive data is exposed through the seed parameter 