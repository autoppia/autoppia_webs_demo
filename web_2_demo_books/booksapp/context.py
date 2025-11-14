from django.conf import settings
from .utils import normalize_seed, compute_variant, compute_structure_variant, get_structure_variant_data


def dynamic_context(request):
    enabled = bool(getattr(settings, "DYNAMIC_HTML_ENABLED", False))
    dynamic_html_structure_enabled = bool(getattr(settings, "DYNAMIC_HTML_STRUCTURE", False))
    
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
    
    # Handle seed-structure parameter for dynamic HTML structure
    structure_variant = None
    structure_variant_data = None
    seed_structure = None
    
    if dynamic_html_structure_enabled:
        # Priority: URL parameter > session > default (1)
        url_seed_structure = request.GET.get("seed-structure")
        
        if url_seed_structure:
            try:
                seed_structure = int(url_seed_structure)
                if seed_structure < 1 or seed_structure > 300:
                    seed_structure = 1
            except (ValueError, TypeError):
                seed_structure = 1
            request.session["preserved_seed_structure"] = seed_structure
        elif "preserved_seed_structure" in request.session:
            # Use seed-structure from session if no URL parameter
            seed_structure = request.session["preserved_seed_structure"]
        else:
            # No seed-structure in URL or session - use default 1
            seed_structure = 1
            request.session["preserved_seed_structure"] = seed_structure
        
        # Compute structure variant (1-10) from seed-structure (1-300)
        structure_variant = compute_structure_variant(seed_structure)
        # Load structure variant data from JSON
        structure_variant_data = get_structure_variant_data(structure_variant)
    
    context = {
        "DYNAMIC_HTML_ENABLED": enabled,
        "DYNAMIC_HTML_STRUCTURE_ENABLED": dynamic_html_structure_enabled,
        "INITIAL_SEED": seed,
        "LAYOUT_VARIANT": variant,
        "SEED_STRUCTURE": seed_structure,
        "STRUCTURE_VARIANT": structure_variant,
        "STRUCTURE_VARIANT_DATA": structure_variant_data,
    }
    
    return context
