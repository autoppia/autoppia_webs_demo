from django.conf import settings
from .utils import normalize_seed, compute_variant


def dynamic_context(request):
    enabled = bool(getattr(settings, "DYNAMIC_HTML_ENABLED", False))
    if enabled:
        seed = normalize_seed(request.GET.get("seed"))
        # seed 0 → original layout, treat as variant 1 but keep seed=0 in context
        if seed == 0:
            variant = 1
        else:
            variant = compute_variant(seed)
    else:
        # When dynamic HTML is disabled, expose default seed=0 (original layout) and variant=1
        seed = 0
        variant = 1
    return {
        "DYNAMIC_HTML_ENABLED": enabled,
        "INITIAL_SEED": seed,
        "LAYOUT_VARIANT": variant,
    }
