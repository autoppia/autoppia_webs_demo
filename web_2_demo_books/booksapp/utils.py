"""
Utility functions for web_2_demo_books
Handles seed-based layout mapping and dynamic HTML configuration.
"""

from django.conf import settings
from .layout_variants import get_layout_variant, get_layout_variant_by_id


def _is_dynamic_enabled() -> bool:
    """Check if dynamic HTML is enabled in settings."""
    return bool(getattr(settings, "DYNAMIC_HTML_ENABLED", False))


def _normalize_seed(raw) -> int:
    """
    Normalize seed value to valid range (1-300).
    
    Args:
        raw: Raw seed value (can be string, int, or None)
        
    Returns:
        int: Normalized seed value (1-300)
    """
    try:
        val = int(raw)
    except (ValueError, TypeError):
        return 1
    if val < 1 or val > 300:
        return 1
    return val


def get_seed_layout(seed=None):
    """
    Map seed (1-300) to layout configuration with special cases.
    This function mirrors the approach from web_6_automail.
    
    Special cases:
    - Seeds 160-170: Always return Layout 3
    - Seeds ending in 5 (5, 15, 25, ... 295): Layout 2
    - Seed 8: Layout 1
    - Other seeds: Mapped using ((seed - 1) % 10) + 1
    
    Args:
        seed: Seed value (1-300), can be None
        
    Returns:
        dict: Layout configuration with:
            - layout: Layout template name
            - seed: Effective seed value
            - variant: Layout variant object
            - layout_id: Layout variant ID (1-10)
            - xpaths: XPath selectors for the layout
            - styles: CSS styles for the layout
    """
    # If dynamic HTML is disabled, always return default layout
    if not _is_dynamic_enabled():
        default_variant = get_layout_variant(1)
        return {
            "layout": "default",
            "seed": 1,
            "variant": default_variant.to_dict(),
            "layout_id": 1,
            "xpaths": default_variant.xpaths,
            "styles": default_variant.styles
        }
    
    # Normalize seed value
    s = 1 if seed in (None, "") else _normalize_seed(seed)
    
    # Apply special cases (matching web_6_automail logic)
    if 160 <= s <= 170:
        # Seeds 160-170 always use Layout 3
        layout_id = 3
    elif s % 10 == 5:
        # Seeds ending in 5 always use Layout 2
        layout_id = 2
    elif s == 8:
        # Seed 8 always uses Layout 1
        layout_id = 1
    else:
        # Default mapping: ((seed - 1) % 10) + 1
        layout_id = ((s - 1) % 10) + 1
    
    # Get the layout variant
    variant = get_layout_variant_by_id(layout_id)
    
    # Map layout IDs to template names
    layout_templates = {
        1: "layout_nav_search_grid",
        2: "layout_search_filters_grid",
        3: "layout_grid_nav_filters",
        4: "layout_sidebar_main_footer",
        5: "layout_featured_search_grid",
        6: "layout_filters_grid_nav",
        7: "layout_grid_footer_nav",
        8: "layout_main_sidebar_nav",
        9: "layout_search_grid_featured",
        10: "layout_nav_footer_grid",
    }
    
    layout_name = layout_templates.get(layout_id, "default")
    
    return {
        "layout": layout_name,
        "seed": s,
        "variant": variant.to_dict(),
        "layout_id": layout_id,
        "xpaths": variant.xpaths,
        "styles": variant.styles,
        "name": variant.name,
        "description": variant.description
    }


def get_effective_seed(request) -> int:
    """
    Get the effective seed from request, respecting dynamic HTML settings.
    
    Args:
        request: Django HTTP request object
        
    Returns:
        int: Effective seed value (1 if dynamic HTML disabled, otherwise seed from URL)
    """
    if not _is_dynamic_enabled():
        return 1
    
    seed_param = request.GET.get("seed", "1")
    return _normalize_seed(seed_param)


def is_dynamic_html_enabled() -> bool:
    """
    Check if dynamic HTML is enabled.
    Convenience function for templates and views.
    
    Returns:
        bool: True if dynamic HTML is enabled, False otherwise
    """
    return _is_dynamic_enabled()
