# Login & Register Pages 10 Unique Variants Test

## Overview
Both login and register pages now implement 10 truly unique layout variants that affect:
1. **Container Layout** - How the form is positioned on the page
2. **Column Size** - The width and responsiveness of the form
3. **Form Field Order** - The order of form fields (2 fields for login, 4 fields for register)
4. **Card Layout** - The order of header, body, and footer within the form card

## Test URLs
Test each variant by visiting these URLs:

### Login Page Variants

#### Variant 1 (Default)
- **URL**: `http://localhost:8001/login/?seed=1`
- **Container**: Centered layout
- **Column**: Default (col-md-6 col-lg-5)
- **Fields**: Username, Password (default order)
- **Card**: Header, Body, Footer (default order)

### Variant 2 (Reversed)
- **URL**: `http://localhost:8001/login/?seed=2`
- **Container**: Left aligned
- **Column**: Wider (col-md-8 col-lg-6)
- **Fields**: Password, Username (reversed order)
- **Card**: Footer, Body, Header (reversed order)

### Variant 3 (Right Aligned)
- **URL**: `http://localhost:8001/login/?seed=3`
- **Container**: Right aligned
- **Column**: Narrower (col-md-4 col-lg-3)
- **Fields**: Deterministic shuffle with seed 3
- **Card**: Header, Footer, Body

### Variant 4 (Space Between)
- **URL**: `http://localhost:8001/login/?seed=4`
- **Container**: Space between alignment
- **Column**: Full width on small (col-12 col-md-6)
- **Fields**: Deterministic shuffle with seed 4
- **Card**: Body, Header, Footer

### Variant 5 (Space Around)
- **URL**: `http://localhost:8001/login/?seed=5`
- **Container**: Space around alignment
- **Column**: Large only (col-lg-4)
- **Fields**: Deterministic shuffle with seed 5
- **Card**: Body, Footer, Header

### Variant 6 (Space Evenly)
- **URL**: `http://localhost:8001/login/?seed=6`
- **Container**: Space evenly alignment
- **Column**: Medium only (col-md-5)
- **Fields**: Deterministic shuffle with seed 6
- **Card**: Footer, Header, Body

### Variant 7 (Flex Start + Margin)
- **URL**: `http://localhost:8001/login/?seed=7`
- **Container**: Flex start with 10% left margin
- **Column**: Extra wide (col-md-10 col-lg-8)
- **Fields**: Deterministic shuffle with seed 7
- **Card**: Header, Body, Footer with zero margins

### Variant 8 (Flex End + Margin)
- **URL**: `http://localhost:8001/login/?seed=8`
- **Container**: Flex end with 10% right margin
- **Column**: Extra narrow (col-md-3 col-lg-2)
- **Fields**: Deterministic shuffle with seed 8
- **Card**: Header, Body, Footer with 5px spacing

### Variant 9 (Center + Padding)
- **URL**: `http://localhost:8001/login/?seed=9`
- **Container**: Center with 5% padding on sides
- **Column**: Responsive (col-12 col-sm-8 col-md-6 col-lg-4)
- **Fields**: Deterministic shuffle with seed 9
- **Card**: Header, Body, Footer with relative positioning

### Variant 10 (Center + Positioning)
- **URL**: `http://localhost:8001/login/?seed=10`
- **Container**: Center with 2% left positioning
- **Column**: Custom (col-11 col-md-7 col-lg-6)
- **Fields**: Deterministic shuffle with seed 10
- **Card**: Header, Body, Footer with flex layout

### Register Page Variants

#### Variant 1 (Default)
- **URL**: `http://localhost:8001/register/?seed=1`
- **Container**: Centered layout
- **Column**: Default (col-md-7 col-lg-6)
- **Fields**: Username, Email, Password, Confirm Password (default order)
- **Card**: Header, Body, Footer (default order)

#### Variant 2 (Reversed)
- **URL**: `http://localhost:8001/register/?seed=2`
- **Container**: Left aligned
- **Column**: Wider (col-md-9 col-lg-8)
- **Fields**: Confirm Password, Password, Email, Username (reversed order)
- **Card**: Footer, Body, Header (reversed order)

#### Variant 3 (Right Aligned)
- **URL**: `http://localhost:8001/register/?seed=3`
- **Container**: Right aligned
- **Column**: Narrower (col-md-5 col-lg-4)
- **Fields**: Deterministic shuffle with seed 3
- **Card**: Header, Footer, Body

#### Variant 4 (Space Between)
- **URL**: `http://localhost:8001/register/?seed=4`
- **Container**: Space between alignment
- **Column**: Full width on small (col-12 col-md-7)
- **Fields**: Deterministic shuffle with seed 4
- **Card**: Body, Header, Footer

#### Variant 5 (Space Around)
- **URL**: `http://localhost:8001/register/?seed=5`
- **Container**: Space around alignment
- **Column**: Large only (col-lg-5)
- **Fields**: Deterministic shuffle with seed 5
- **Card**: Body, Footer, Header

#### Variant 6 (Space Evenly)
- **URL**: `http://localhost:8001/register/?seed=6`
- **Container**: Space evenly alignment
- **Column**: Medium only (col-md-6)
- **Fields**: Deterministic shuffle with seed 6
- **Card**: Footer, Header, Body

#### Variant 7 (Flex Start + Margin)
- **URL**: `http://localhost:8001/register/?seed=7`
- **Container**: Flex start with 15% left margin
- **Column**: Extra wide (col-md-11 col-lg-10)
- **Fields**: Deterministic shuffle with seed 7
- **Card**: Header, Body, Footer with zero margins

#### Variant 8 (Flex End + Margin)
- **URL**: `http://localhost:8001/register/?seed=8`
- **Container**: Flex end with 15% right margin
- **Column**: Extra narrow (col-md-4 col-lg-3)
- **Fields**: Deterministic shuffle with seed 8
- **Card**: Header, Body, Footer with 8px spacing

#### Variant 9 (Center + Padding)
- **URL**: `http://localhost:8001/register/?seed=9`
- **Container**: Center with 8% padding on sides
- **Column**: Responsive (col-12 col-sm-9 col-md-7 col-lg-5)
- **Fields**: Deterministic shuffle with seed 9
- **Card**: Header, Body, Footer with relative positioning

#### Variant 10 (Center + Positioning)
- **URL**: `http://localhost:8001/register/?seed=10`
- **Container**: Center with 3% left positioning
- **Column**: Custom (col-10 col-md-8 col-lg-7)
- **Fields**: Deterministic shuffle with seed 10
- **Card**: Header, Body, Footer with flex layout

## Key Features
- **Original Colors Preserved**: All variants maintain the original Bootstrap styling
- **Element Reordering Only**: No visual changes, only structural reordering
- **Deterministic Results**: Same seed always produces the same layout
- **Scraper Confusion**: Each variant creates different XPath structures
- **User Experience**: Consistent visual appearance across all variants

## Testing Checklist
- [ ] Each seed (1-10) produces a visually distinct layout on both login and register pages
- [ ] Form fields are reordered differently for each variant
- [ ] Container positioning changes between variants
- [ ] Column sizes vary appropriately
- [ ] Card element order changes
- [ ] Original colors and styling are preserved
- [ ] All variants are functional and accessible
- [ ] Login page has 2 form fields (username, password)
- [ ] Register page has 4 form fields (username, email, password, confirm password)
- [ ] Navigation between login and register preserves seed parameter
- [ ] Form validation works correctly in all variants

## Key Differences Between Login and Register Pages

### Login Page
- **Form Fields**: 2 fields (Username, Password)
- **Column Size**: Default col-md-6 col-lg-5 (narrower)
- **Container Margins**: 10% for variants 7-8, 5% for variant 9, 2% for variant 10
- **Card Spacing**: 5px for variant 8, 2px gap for variant 10
- **Header Color**: Blue (bg-primary)

### Register Page
- **Form Fields**: 4 fields (Username, Email, Password, Confirm Password)
- **Column Size**: Default col-md-7 col-lg-6 (wider)
- **Container Margins**: 15% for variants 7-8, 8% for variant 9, 3% for variant 10
- **Card Spacing**: 8px for variant 8, 3px gap for variant 10
- **Header Color**: Green (bg-success)

### Shared Features
- **Container Layout**: Same 10 variants for both pages
- **Card Layout**: Same 10 variants for both pages
- **Form Field Ordering**: Same deterministic shuffle algorithm
- **Original Colors Preserved**: Both maintain Bootstrap styling
- **Seed Preservation**: Both preserve seed parameter across navigation
