"""
Centralized seed resolution service.
Takes a base seed and derives v1, v2, v3 seeds deterministically.
"""

from typing import Dict, Optional


def bool_from_env(value: Optional[str]) -> bool:
    """Convert environment variable to boolean."""
    if not value:
        return False
    return value.lower() in ["true", "1", "yes", "y"]


def clamp_base_seed(seed: int, min_val: int = 1, max_val: int = 999) -> int:
    """Clamp seed to valid range."""
    if seed < min_val:
        return min_val
    if seed > max_val:
        return max_val
    return seed


def derive_seed(
    base_seed: int,
    multiplier: int,
    max_value: int,
    offset: int = 0,
) -> int:
    """
    Derive a version-specific seed from base seed using deterministic formula.

    Formula: ((base_seed * multiplier + offset) % max_value) + 1

    Args:
        base_seed: The base seed value (1-999)
        multiplier: Multiplier for the formula (e.g., 29, 53, 71)
        max_value: Maximum value for the derived seed (e.g., 300, 100)
        offset: Optional offset (default: 0)

    Returns:
        Derived seed value (1 to max_value)
    """
    derived = ((base_seed * multiplier + offset) % max_value) + 1
    return derived


def resolve_seeds(
    base_seed: int,
    v1_enabled: bool = False,
    v2_enabled: bool = False,
    v3_enabled: bool = False,
    v1_config: Optional[Dict[str, int]] = None,
    v2_config: Optional[Dict[str, int]] = None,
    v3_config: Optional[Dict[str, int]] = None,
) -> Dict[str, any]:
    """
    Resolve base seed into v1, v2, v3 seeds based on enabled flags and configs.

    Args:
        base_seed: Base seed value (will be clamped to 1-999)
        v1_enabled: Whether v1 (layout/content variations) is enabled
        v2_enabled: Whether v2 (DB data selection) is enabled
        v3_enabled: Whether v3 (structure variations) is enabled
        v1_config: Optional config for v1: {max, multiplier, offset}
        v2_config: Optional config for v2: {max, multiplier, offset}
        v3_config: Optional config for v3: {max, multiplier, offset}

    Returns:
        Dictionary with:
        {
            "base": int,
            "v1": int | None,
            "v2": int | None,
            "v3": int | None
        }
    """
    # Default configurations (can be overridden)
    default_v1 = {"max": 300, "multiplier": 29, "offset": 7}
    default_v2 = {"max": 300, "multiplier": 53, "offset": 17}
    default_v3 = {"max": 100, "multiplier": 71, "offset": 3}

    v1_cfg = v1_config or default_v1
    v2_cfg = v2_config or default_v2
    v3_cfg = v3_config or default_v3

    safe_seed = clamp_base_seed(base_seed)

    result = {
        "base": safe_seed,
        "v1": None,
        "v2": None,
        "v3": None,
    }

    if v1_enabled:
        result["v1"] = derive_seed(
            safe_seed,
            v1_cfg["multiplier"],
            v1_cfg["max"],
            v1_cfg.get("offset", 0),
        )

    if v2_enabled:
        # v2 = mismo seed de la URL; se envía tal cual a /datasets/load
        result["v2"] = safe_seed

    if v3_enabled:
        result["v3"] = derive_seed(
            safe_seed,
            v3_cfg["multiplier"],
            v3_cfg["max"],
            v3_cfg.get("offset", 0),
        )

    return result
