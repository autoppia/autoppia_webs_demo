# Implement Subnets List Page

Implements the `/subnets` page for web_15_autostats showing all Bittensor network subnets with statistics and price trends.

## What's included

- Subnets list page with sortable table (11 columns)
- Three stats cards comparing Root vs Alpha subnets
- Search and filter functionality
- Display mode toggle (TAO/USD)
- Click to navigate to subnet detail page
- Totals row showing aggregate values

## Files changed

**New files:**
- `src/app/subnets/page.tsx`
- `src/components/pages/SubnetsPageContent.tsx`
- `src/components/charts/SubnetsPriceChart.tsx`

**Modified files:**
- `src/data/generators.ts` - Added subnet generation with trends
- `src/shared/types.ts` - Added SubnetWithTrend type
- `src/app/layout.tsx` - Updated layout spacing
- Linting fixes in 6 files

## Screenshots

[Add screenshots here]
