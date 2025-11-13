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


def compute_structure_variant(seed_structure: int) -> int:
    """Map any seed-structure (1..300) deterministically into a structure variant 1..10."""
    try:
        s = int(seed_structure or 1)
    except Exception:
        s = 1
    # Normalize to 1-300 range
    if s < 1 or s > 300:
        s = 1
    # ((seed_structure - 1) % 10) + 1 yields range 1..10
    return ((s - 1) % 10) + 1


def normalize_variant(raw) -> int:
    """Deprecated. No longer used."""
    return 1


def redirect_with_seed(request, url_name, *args, seed=None, **kwargs):
    """
    Helper function to redirect while preserving seed parameter.
    
    Args:
        request: Django request object
        url_name: URL name or path for redirect
        *args: Positional arguments for reverse()
        seed: Optional seed value (if None, uses seed from request/session)
        **kwargs: Keyword arguments for reverse()
    
    Returns:
        HttpResponseRedirect with seed parameter preserved
    """
    from django.shortcuts import redirect
    from django.urls import reverse, NoReverseMatch
    from django.conf import settings
    
    # Check if dynamic HTML is enabled
    enabled = bool(getattr(settings, "DYNAMIC_HTML_ENABLED", False))
    
    if not enabled:
        # Dynamic HTML disabled - normal redirect without seed
        try:
            resolved_url = reverse(url_name, args=args, kwargs=kwargs)
        except NoReverseMatch:
            resolved_url = url_name
        return redirect(resolved_url)
    
    # Get seed from parameter, request.GET, session, or default
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
    
    # Build URL with seed parameter (reverse if it's a URL name)
    try:
        url = reverse(url_name, args=args, kwargs=kwargs)
    except NoReverseMatch:
        url = url_name
    
    # Add seed parameter
    separator = "&" if "?" in url else "?"
    return redirect(f"{url}{separator}seed={seed}")
