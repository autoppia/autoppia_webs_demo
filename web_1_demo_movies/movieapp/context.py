from django.conf import settings
from .utils import normalize_seed, compute_variant


def dynamic_context(request):
    enabled = bool(getattr(settings, "DYNAMIC_HTML_ENABLED", False))
    if enabled:
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
    else:
        # When dynamic HTML is disabled, expose default seed=0 (original layout) and variant=1
        seed = 0
        variant = 1
    return {
        "DYNAMIC_HTML_ENABLED": enabled,
        "INITIAL_SEED": seed,
        "LAYOUT_VARIANT": variant,
    }
