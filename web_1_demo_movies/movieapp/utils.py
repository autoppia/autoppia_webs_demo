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


def normalize_variant(raw) -> int:
    """Deprecated. No longer used."""
    return 1
