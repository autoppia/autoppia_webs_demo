from django.conf import settings
from .utils import normalize_seed, normalize_v2_seed, compute_variant


def dynamic_context(request):
    v1_enabled = bool(getattr(settings, "DYNAMIC_HTML_ENABLED", False))
    v2_enabled = bool(getattr(settings, "ENABLE_DYNAMIC_V2_DB_MODE", False))
    
    # Handle v2-seed (for V2 DB load mode)
    v2_seed = None
    if v2_enabled:
        v2_seed_raw = request.GET.get("v2-seed")
        if v2_seed_raw:
            v2_seed = normalize_v2_seed(v2_seed_raw)
        if v2_seed is None:
            # Default to 1 if v2 is enabled but no seed provided
            v2_seed = 1
    
    # Handle v1 seed (for dynamic HTML layout)
    seed = 0
    variant = 1
    if v1_enabled:
        # Priority: URL parameter > session > default (1)
        url_seed = request.GET.get("seed")

        if url_seed:
            # Seed provided in URL - normalize and store in session
            seed = normalize_seed(url_seed)
            request.session["preserved_seed"] = seed
        elif "preserved_seed" in request.session:
            # Use seed from session if no URL parameter
            seed = request.session["preserved_seed"]
        else:
            # No seed in URL or session - use default
            seed = normalize_seed(None)  # This will return 1 as default
            request.session["preserved_seed"] = seed

        # seed 0 → original layout, treat as variant 1 but keep seed=0 in context
        if seed == 0:
            variant = 1
        else:
            variant = compute_variant(seed)
    
    # Build query strings for templates
    query_parts = []
    if v1_enabled and seed:
        query_parts.append(f"seed={seed}")
    if v2_enabled and v2_seed:
        query_parts.append(f"v2-seed={v2_seed}")
    
    query_string = "&".join(query_parts)
    prefixed_query = f"?{query_string}" if query_string else ""
    amp_query = f"&{query_string}" if query_string else ""
    
    return {
        "DYNAMIC_HTML_ENABLED": v1_enabled,
        "ENABLE_DYNAMIC_V2_DB_MODE": v2_enabled,
        "INITIAL_SEED": seed,
        "V2_SEED": v2_seed,
        "LAYOUT_VARIANT": variant,
        "SEED_QUERYSTRING": query_string,
        "SEED_QUERYSTRING_PREFIXED": prefixed_query,
        "SEED_QUERYSTRING_WITH_AMP": amp_query,
    }
