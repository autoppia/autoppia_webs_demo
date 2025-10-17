# Dynamic HTML Implementation for web_2_demo_books

## Overview

This Django application now features a comprehensive **Dynamic HTML** system that reorders HTML elements and changes their XPaths based on seed values from 1-300. This feature is designed to create variation in the page structure, making the site more resilient to automated scraping.

## Features

### 1. Seed-Based Layout Variations
- **Seed Range**: Accepts seed values from 1 to 300 via URL query parameter (`?seed=N`)
- **Layout Mapping**: Maps seeds to 10 different layout variations using the formula `((seed - 1) % 10) + 1`
- **Default Fallback**: If no seed is provided or dynamic HTML is disabled, uses seed value 1

### 2. Element Reordering
The JavaScript implementation (`static/js/dynamic_layout.js`) performs aggressive element reordering:
- **Navbar items**: Menu links are shuffled based on seed
- **Footer links**: Footer navigation is reordered
- **Book grid**: Book cards are rearranged
- **Hero sections**: Text and image sections swap positions
- **Form elements**: Select dropdown options are shuffled (preserving first placeholder)
- **Generic containers**: All major containers (divs, sections, rows) are recursively reordered

### 3. XPath Variation
Every element gets seed-specific attributes to ensure XPath varies:
- `data-seed`: The current seed value
- `data-variant`: Seed modulo 10 (1-10)
- `data-xid`: Unique identifier like `x-{seed}-{index}`
- CSS classes: Each element gets a `sx-{seed}` class

### 4. Template System
Multiple layout templates provide different ordering of major page sections:
- **Layout 1** (`layout_nav_search_grid`): Navigation → Search → Grid
- **Layout 2** (`layout_search_filters_grid`): Search → Filters → Grid
- **Layout 3** (`layout_grid_nav_filters`): Grid → Navigation → Filters
- **Layout 4** (`layout_sidebar_main_footer`): Sidebar + Main content
- **Layout 5** (`layout_featured_search_grid`): Featured → Search → Grid
- **Layout 6** (`layout_filters_grid_nav`): Filters → Grid → Navigation
- **Layout 7** (`layout_grid_footer_nav`): Grid → Footer → Navigation
- **Layout 8** (`layout_main_sidebar_nav`): Main → Sidebar → Navigation
- **Layout 9** (`layout_search_grid_featured`): Search → Grid → Featured
- **Layout 10** (`layout_nav_footer_grid`): Navigation → Footer → Grid

## Implementation Details

### Backend (Django)

#### 1. Context Processor (`booksapp/context.py`)
```python
def dynamic_context(request):
    """Inject dynamic HTML flags and initial seed into all templates."""
    enabled = bool(getattr(settings, "DYNAMIC_HTML_ENABLED", False))
    seed_param = request.GET.get("seed")
    try:
        seed = int(seed_param) if seed_param is not None else 1
    except Exception:
        seed = 1
    if seed < 1 or seed > 300:
        seed = 1
    
    return {
        "DYNAMIC_HTML_ENABLED": enabled,
        "INITIAL_SEED": seed,
    }
```

#### 2. Utility Function (`booksapp/utils.py`)
```python
def get_seed_layout(seed=None):
    """
    Maps seed (1-300) to one of 10 layout templates.
    Special cases:
    - Seeds 160-170: Always layout 3
    - Seeds ending in 5: Layout 2
    - Seed 8: Layout 1
    - Others: ((seed - 1) % 10) + 1
    """
```

#### 3. Custom Template Tags (`booksapp/templatetags/custom_filters.py`)
- `{% preserve_seed %}`: Returns `?seed={seed}` if dynamic HTML is enabled
- `{% url_with_seed 'view_name' %}`: Generates URLs with seed parameter preserved

#### 4. Views
All views now pass `layout_config` to templates using `get_seed_layout(request.GET.get("seed"))`

### Frontend (JavaScript)

#### Key Functions in `dynamic_layout.js`:

1. **`seededRandomWithSalt(salt)`**: Deterministic random number generator
2. **`reorderGroup(groupEl, itemSelector)`**: Reorders children of a container
3. **`reorderChildren(el, depth)`**: Recursively reorders nested containers
4. **`reorderSelectOptions(selectEl)`**: Shuffles select options while preserving placeholders

#### Element Selection:
The script targets elements with `data-dynamic-group` attributes and also:
- Lists: `ul`, `ol`, `.navbar-nav`, `.dropdown-menu`
- Grids: `.row`, `.card-deck`, `.grid`
- Semantic: `section`, `article`, `aside`, `nav`, `header`, `footer`

## Usage

### Enabling Dynamic HTML

Set the environment variable in `docker-compose.yml`:
```yaml
environment:
  - ENABLE_DYNAMIC_HTML=true
```

Or override with a `.env` file:
```
ENABLE_DYNAMIC_HTML=true
```

### Using Seed in URLs

Navigate to any page with a seed parameter:
```
http://localhost:8001/?seed=1
http://localhost:8001/?seed=150
http://localhost:8001/about/?seed=42
```

### In Templates

To preserve seed across navigation:
```django
{% load custom_filters %}

<!-- Automatic seed preservation -->
<a href="{% url 'booksapp:index' %}{% preserve_seed %}">Home</a>

<!-- Or generate URL with seed -->
<a href="{% url_with_seed 'booksapp:detail' book.id %}">Details</a>
```

To mark elements for dynamic reordering:
```html
<div data-dynamic-group="my-section">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

To prevent reordering:
```html
<div data-dynamic="off">
  <!-- This won't be reordered -->
</div>
```

## Testing

### Manual Testing
1. Start the application with `ENABLE_DYNAMIC_HTML=true`
2. Navigate to homepage: `/?seed=1`
3. Observe the layout and element positions
4. Try different seeds (e.g., `/?seed=50`, `/?seed=100`, `/?seed=250`)
5. Verify elements are in different positions
6. Check browser console for `DynamicLayout` object:
   ```javascript
   console.log(window.DynamicLayout);
   // Output: { enabled: true, seed: 50, layoutIndex: 10, ... }
   ```

### Automated Testing
Inspect XPath changes:
```javascript
// With seed=1
//*[@id="blk-1-0"]/div[1]

// With seed=50
//*[@id="blk-50-0"]/div[3]
```

## Technical Notes

### Deterministic Reordering
The system uses a seeded Fisher-Yates shuffle algorithm to ensure:
- Same seed always produces same layout
- Different seeds produce different layouts
- Reordering is consistent across page loads

### Performance Considerations
- Reordering happens on `DOMContentLoaded`
- Recursive depth is limited to 4 levels to prevent performance issues
- Skips `<script>`, `<style>`, `<link>`, `<meta>` tags

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard DOM APIs
- No external dependencies

## Troubleshooting

### Dynamic HTML Not Working
1. Check `ENABLE_DYNAMIC_HTML` environment variable
2. Verify `dynamic_layout.js` is loaded
3. Check browser console for errors
4. Ensure `data-dynamic-group` attributes are present

### Seed Not Preserving Across Navigation
1. Verify templates load `{% load custom_filters %}`
2. Check links use `{% preserve_seed %}`
3. Inspect generated HTML for `?seed=` parameter

### Elements Not Reordering
1. Check element has `data-dynamic-group` attribute
2. Verify element is not marked with `data-dynamic="off"`
3. Ensure element has multiple children to reorder

## Architecture Diagram

```
URL (?seed=N)
    ↓
Django Context Processor (context.py)
    ↓
View (gets layout_config from utils.py)
    ↓
Template (renders with seed-aware links)
    ↓
Browser (loads dynamic_layout.js)
    ↓
JavaScript (reorders elements, assigns XPath attributes)
    ↓
Dynamic Page (unique structure based on seed)
```

## File Structure

```
web_2_demo_books/
├── booksapp/
│   ├── context.py           # Context processor for seed injection
│   ├── utils.py             # Layout mapping logic
│   ├── views.py             # All views pass layout_config
│   └── templatetags/
│       └── custom_filters.py # Template tags for seed preservation
├── static/
│   └── js/
│       └── dynamic_layout.js # Client-side reordering logic
├── templates/
│   ├── base.html            # Base template with seed-aware navigation
│   ├── layouts/             # Layout variations for different seeds
│   │   ├── default_home.html
│   │   ├── layout_nav_search_grid.html
│   │   ├── layout_search_filters_grid.html
│   │   └── ... (layouts 4-10)
│   └── ... (all other templates)
└── docker-compose.yml       # ENABLE_DYNAMIC_HTML configuration
```

## Future Enhancements

Potential improvements:
1. Add more layout variations (beyond 10)
2. Implement CSS-based layout changes (in addition to DOM reordering)
3. Add seed-based color scheme variations
4. Implement server-side rendering of different layouts
5. Add analytics to track seed usage patterns

## Credits

Implementation inspired by anti-scraping techniques and dynamic web application architectures.

