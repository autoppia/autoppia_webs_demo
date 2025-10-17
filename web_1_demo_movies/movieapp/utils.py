import random
from typing import Iterable, List, TypeVar


T = TypeVar("T")


def normalize_seed(raw) -> int:
    try:
        s = int(raw)
    except Exception:
        return 1
    if s < 1 or s > 300:
        return 1
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


