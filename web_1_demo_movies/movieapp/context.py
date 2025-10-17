from django.conf import settings


def dynamic_context(request):
    enabled = bool(getattr(settings, "DYNAMIC_HTML_ENABLED", False))
    seed_param = request.GET.get("seed")
    try:
        seed = int(seed_param) if seed_param is not None else 1
    except Exception:
        seed = 1
    if seed < 1 or seed > 300:
        seed = 1
    return {
        "DYNAMIC_HTML_ENABLED": enabled,
        "INITIAL_SEED": seed,
    }


