from django.conf import settings
from .utils import normalize_seed, compute_variant, normalize_variant


def dynamic_context(request):
    enabled = bool(getattr(settings, "DYNAMIC_HTML_ENABLED", False))
    if enabled:
        seed = normalize_seed(request.GET.get("seed"))
        layout_q = request.GET.get("layout")
        variant = normalize_variant(layout_q) if layout_q else compute_variant(seed)
    else:
        # When dynamic HTML is disabled, force deterministic default
        seed = 1
        variant = 1
    return {
        "DYNAMIC_HTML_ENABLED": enabled,
        "INITIAL_SEED": seed,
        "LAYOUT_VARIANT": variant,
    }
