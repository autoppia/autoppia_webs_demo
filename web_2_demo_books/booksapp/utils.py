import random
from typing import Iterable, List, TypeVar


T = TypeVar("T")


def normalize_seed(raw) -> int:
    try:
        s = int(raw)
    except Exception:
        return 1
    # Seed 0 means: original structure (no dynamic changes)
    if s == 0:
        return 0
    if s < 1 or s > 300:
        return 0
    return s


def normalize_v2_seed(raw) -> int:
    """Normalize v2-seed parameter (similar to normalize_seed but for v2)."""
    try:
        s = int(raw)
    except Exception:
        return None
    if s < 1 or s > 300:
        return None
    return s


def stable_shuffle(items: Iterable[T], seed: int, salt: str = "") -> List[T]:
    lst = list(items)
    if len(lst) <= 1:
        return lst
    rng = random.Random((seed, salt))
    # Fisher–Yates inplace
    for i in range(len(lst) - 1, 0, -1):
        j = rng.randint(0, i)
        lst[i], lst[j] = lst[j], lst[i]
    return lst


def compute_variant(seed: int) -> int:
    """Map any seed (1..300) deterministically into a layout variant 1..10."""
    try:
        s = int(seed or 1)
    except Exception:
        s = 1
    # ((seed - 1) % 10) + 1 yields range 1..10
    return ((s - 1) % 10) + 1


def normalize_variant(raw) -> int:
    """Deprecated. No longer used."""
    return 1


def redirect_with_seed(request, url_name, *args, seed=None, **kwargs):
    """
    Helper function to redirect while preserving seed and v2-seed parameters.

    Args:
        request: Django request object
        url_name: URL name or path for redirect
        *args: Positional arguments for reverse()
        seed: Optional seed value (if None, uses seed from request/session)
        **kwargs: Keyword arguments for reverse()

    Returns:
        HttpResponseRedirect with seed/v2-seed parameters preserved
    """
    from django.shortcuts import redirect
    from django.urls import reverse, NoReverseMatch
    from django.conf import settings

    # Check if dynamic HTML is enabled (v1) or v2 DB mode is enabled
    v1_enabled = bool(getattr(settings, "DYNAMIC_HTML_ENABLED", False))
    v2_enabled = bool(getattr(settings, "ENABLE_DYNAMIC_V2_DB_MODE", False))

    if not v1_enabled and not v2_enabled:
        # Both disabled - normal redirect without seed
        try:
            resolved_url = reverse(url_name, args=args, kwargs=kwargs)
        except NoReverseMatch:
            resolved_url = url_name
        return redirect(resolved_url)

    # Build URL
    try:
        url = reverse(url_name, args=args, kwargs=kwargs)
    except NoReverseMatch:
        url = url_name

    # Collect parameters to preserve
    params = []
    
    # Preserve v2-seed if v2 is enabled
    if v2_enabled:
        v2_seed = request.GET.get("v2-seed")
        if v2_seed:
            params.append(f"v2-seed={v2_seed}")
    
    # Preserve seed if v1 is enabled
    if v1_enabled:
        if seed is None:
            seed = request.GET.get("seed")
            if not seed and "preserved_seed" in request.session:
                seed = request.session["preserved_seed"]
            else:
                seed = seed or 1
        
        # Normalize seed
        seed = normalize_seed(seed)
        
        # Store in session for future requests
        request.session["preserved_seed"] = seed
        
        params.append(f"seed={seed}")

    # Add parameters to URL
    if params:
        separator = "&" if "?" in url else "?"
        url = f"{url}{separator}{'&'.join(params)}"
    
    return redirect(url)
