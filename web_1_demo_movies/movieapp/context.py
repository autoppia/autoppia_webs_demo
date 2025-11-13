import json
import os
from django.conf import settings
from .utils import normalize_seed, compute_variant, compute_structure_variant


def load_structure_variants():
    """Load structure variants from JSON file."""
    try:
        json_path = os.path.join(settings.STATICFILES_DIRS[0], "structure_variants.json")
        if not os.path.exists(json_path):
            print(f"[WARNING] structure_variants.json not found at: {json_path}")
            return None
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if not data or "variants" not in data:
                print(f"[WARNING] structure_variants.json is missing 'variants' key")
                return None
            return data
    except json.JSONDecodeError as e:
        print(f"[ERROR] Failed to parse structure_variants.json: {e}")
        return None
    except Exception as e:
        print(f"[ERROR] Failed to load structure_variants.json: {e}")
        return None


def dynamic_context(request):
    enabled = bool(getattr(settings, "DYNAMIC_HTML_ENABLED", False))
    structure_enabled = bool(getattr(settings, "DYNAMIC_HTML_STRUCTURE", False))
    
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
    
    # Handle structure variants
    structure_variant = 1
    structure_data = None
    initial_seed_structure = 1
    if structure_enabled:
        # Priority: URL parameter > session > default (1)
        url_seed_structure = request.GET.get("seed-structure")
        
        if url_seed_structure:
            try:
                seed_structure = int(url_seed_structure)
                if 1 <= seed_structure <= 300:
                    structure_variant = compute_structure_variant(seed_structure)
                    initial_seed_structure = seed_structure
                    request.session["preserved_seed_structure"] = seed_structure
                else:
                    seed_structure = 1
                    structure_variant = 1
                    initial_seed_structure = 1
                    request.session["preserved_seed_structure"] = seed_structure
            except (ValueError, TypeError):
                seed_structure = 1
                structure_variant = 1
                initial_seed_structure = 1
                request.session["preserved_seed_structure"] = seed_structure
        elif "preserved_seed_structure" in request.session:
            seed_structure = request.session["preserved_seed_structure"]
            initial_seed_structure = seed_structure
            structure_variant = compute_structure_variant(seed_structure)
        else:
            seed_structure = 1
            structure_variant = 1
            initial_seed_structure = 1
            request.session["preserved_seed_structure"] = seed_structure
        
        # Load structure variants from JSON
        variants_data = load_structure_variants()
        if variants_data and "variants" in variants_data:
            variant_key = str(structure_variant)
            if variant_key in variants_data["variants"]:
                structure_data = variants_data["variants"][variant_key]
                print(f"[DEBUG] Loaded structure variant {structure_variant} (from seed-structure {initial_seed_structure})")
            else:
                print(f"[WARNING] Variant {variant_key} not found in structure_variants.json")
        else:
            print(f"[WARNING] Failed to load structure variants data")
    
    context = {
        "DYNAMIC_HTML_ENABLED": enabled,
        "INITIAL_SEED": seed,
        "LAYOUT_VARIANT": variant,
        "DYNAMIC_HTML_STRUCTURE": structure_enabled,
        "STRUCTURE_VARIANT": structure_variant,
        "INITIAL_SEED_STRUCTURE": initial_seed_structure,
        "STRUCTURE_DATA": structure_data,
    }
    return context
