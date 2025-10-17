def get_seed_layout(seed=None):
    """
    Normalize seed value and return a layout configuration.
    - If seed is None: return default layout config.
    - If seed is 1–300: normalize it to 1–10 and return that layout config.
    """
    if seed in (None, "",):
        return {"layout": "default"}

    try:
        s = int(seed)
    except Exception:
        return {"layout": "default"}

    if s < 1 or s > 300:
        return {"layout": "default"}

    layout_seed = ((s - 1) % 10) + 1

    layouts = {
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

    return {"layout": layouts.get(layout_seed, "default")}


