from django.conf import settings


def _is_dynamic_enabled() -> bool:
    return bool(getattr(settings, "DYNAMIC_HTML_ENABLED", False))


def _normalize_seed(raw) -> int:
    try:
        val = int(raw)
    except Exception:
        return 1
    if val < 1 or val > 300:
        return 1
    return val


def get_seed_layout(seed=None):
    """
    Seed → layout mapping gated by ENABLE_DYNAMIC_HTML.
    - If disabled: always return default.
    - If enabled: accept seed 1–300, map to one of 10 layouts with special cases,
      mirroring the approach in web_6_automail.
    """
    if not _is_dynamic_enabled():
        return {"layout": "default"}

    s = 1 if seed in (None, "") else _normalize_seed(seed)

    # Special cases similar to automail
    if 160 <= s <= 170:
        layout_seed = 3
    elif s % 10 == 5:
        layout_seed = 2
    elif s == 8:
        layout_seed = 1
    else:
        # Modulo mapping to 1..10
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

    return {"layout": layouts.get(layout_seed, "default"), "seed": s}


