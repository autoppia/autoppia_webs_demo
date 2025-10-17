from django.conf import settings
from .utils import get_seed_layout, _normalize_seed, _is_dynamic_enabled


def dynamic_context(request):
    """
    Inject dynamic HTML configuration into all templates.
    Provides:
    - DYNAMIC_HTML_ENABLED: Boolean flag
    - INITIAL_SEED: Current seed value (1-300)
    - LAYOUT_CONFIG: Full layout configuration with XPaths
    - LAYOUT_VARIANT: Layout variant details
    """
    enabled = _is_dynamic_enabled()
    seed_param = request.GET.get("seed")
    seed = _normalize_seed(seed_param) if seed_param is not None else 1
    
    # Get full layout configuration
    layout_config = get_seed_layout(seed)
    
    return {
        "DYNAMIC_HTML_ENABLED": enabled,
        "INITIAL_SEED": seed,
        "LAYOUT_CONFIG": layout_config,
        "LAYOUT_VARIANT": layout_config.get("variant", {}),
        "LAYOUT_XPATHS": layout_config.get("xpaths", {}),
    }


