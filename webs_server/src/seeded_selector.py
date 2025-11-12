"""
Seeded Data Selector
Provides deterministic, reproducible data selection based on seed values.
Uses a master dataset pool and selects/shuffles based on seed.
"""

import random
from typing import List, Dict, Any, Optional


def seeded_select(data_pool: List[Dict[str, Any]], seed: int, count: int, allow_duplicates: bool = False) -> List[Dict[str, Any]]:
    """
    Select data from pool using a seed for reproducibility.

    Args:
        data_pool: Master dataset to select from
        seed: Seed value for reproducible selection
        count: Number of items to select
        allow_duplicates: If True, can select same item multiple times (with replacement)

    Returns:
        List of selected items (deterministic based on seed)

    Examples:
        >>> pool = [{'id': 1}, {'id': 2}, {'id': 3}]
        >>> seeded_select(pool, seed=42, count=2)
        # Always returns same 2 items for seed=42
    """
    if not data_pool:
        return []

    # Create a new Random instance with the seed
    rng = random.Random(seed)

    if allow_duplicates or count > len(data_pool):
        # Select with replacement (can pick same item multiple times)
        return [rng.choice(data_pool) for _ in range(count)]
    else:
        # Select without replacement (unique items)
        # Use sample for efficiency
        return rng.sample(data_pool, min(count, len(data_pool)))


def seeded_shuffle(data_pool: List[Dict[str, Any]], seed: int, limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Shuffle data pool using seed and optionally limit results.

    Args:
        data_pool: Master dataset to shuffle
        seed: Seed value for reproducible shuffling
        limit: Optional limit on number of items to return

    Returns:
        Shuffled list (deterministic based on seed)
    """
    if not data_pool:
        return []

    # Create a new Random instance with the seed
    rng = random.Random(seed)

    # Make a copy to avoid modifying original
    shuffled = data_pool.copy()
    rng.shuffle(shuffled)

    if limit is not None and limit > 0:
        return shuffled[:limit]

    return shuffled


def seeded_filter_and_select(data_pool: List[Dict[str, Any]], seed: int, count: int, filter_key: Optional[str] = None, filter_values: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """
    Filter data by criteria, then select using seed.

    Args:
        data_pool: Master dataset
        seed: Seed value for reproducible selection
        count: Number of items to select
        filter_key: Key to filter on (e.g., 'category')
        filter_values: Values to include (e.g., ['Kitchen', 'Electronics'])

    Returns:
        Filtered and selected items (deterministic based on seed)
    """
    # First filter if criteria provided
    if filter_key and filter_values:
        filtered_pool = [item for item in data_pool if item.get(filter_key) in filter_values]
    else:
        filtered_pool = data_pool

    # Then select with seed
    return seeded_select(filtered_pool, seed, count, allow_duplicates=False)


def generate_seed_from_string(text: str) -> int:
    """
    Generate a consistent seed value from a string.
    Useful for converting project names, dates, etc. to seeds.

    Args:
        text: Input string

    Returns:
        Integer seed value (0 to 2^31-1)
    """
    # Use hash but keep within valid seed range
    return abs(hash(text)) % 2147483647


def seeded_distribution(data_pool: List[Dict[str, Any]], seed: int, category_key: str, total_count: int) -> List[Dict[str, Any]]:
    """
    Distribute selection across categories proportionally.

    Args:
        data_pool: Master dataset
        seed: Seed value
        category_key: Key that contains category (e.g., 'category')
        total_count: Total number of items to select

    Returns:
        Selected items with proportional category distribution
    """
    rng = random.Random(seed)

    # Group by category
    categories: Dict[str, List[Dict[str, Any]]] = {}
    for item in data_pool:
        cat = item.get(category_key, "unknown")
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item)

    if not categories:
        return []

    # Calculate items per category
    num_categories = len(categories)
    base_per_category = total_count // num_categories
    remainder = total_count % num_categories

    result = []

    for idx, (cat, items) in enumerate(categories.items()):
        # First categories get extra items from remainder
        count_for_this_cat = base_per_category + (1 if idx < remainder else 0)

        # Select from this category
        if items:
            # Use seed + category index for deterministic but varied selection
            cat_rng = random.Random(seed + idx)
            selected = cat_rng.sample(items, min(count_for_this_cat, len(items)))
            result.extend(selected)

    # Final shuffle with original seed
    rng.shuffle(result)

    return result[:total_count]


def verify_reproducibility(data_pool: List[Dict[str, Any]], seed: int, count: int, iterations: int = 3) -> bool:
    """
    Verify that selection is reproducible by running multiple times.
    Useful for testing.

    Returns:
        True if all iterations produce identical results
    """
    first_result = None

    for i in range(iterations):
        result = seeded_select(data_pool, seed, count)

        if first_result is None:
            first_result = result
        elif result != first_result:
            return False

    return True


# Example usage and tests
if __name__ == "__main__":
    # Test data
    test_pool = [
        {"id": 1, "name": "Product A", "category": "Kitchen"},
        {"id": 2, "name": "Product B", "category": "Electronics"},
        {"id": 3, "name": "Product C", "category": "Kitchen"},
        {"id": 4, "name": "Product D", "category": "Electronics"},
        {"id": 5, "name": "Product E", "category": "Home"},
        {"id": 6, "name": "Product F", "category": "Kitchen"},
        {"id": 7, "name": "Product G", "category": "Electronics"},
        {"id": 8, "name": "Product H", "category": "Home"},
    ]

    # Test 1: Basic selection
    print("Test 1: Basic selection")
    result1 = seeded_select(test_pool, seed=42, count=3)
    print(f"Seed 42: {[item['name'] for item in result1]}")

    result2 = seeded_select(test_pool, seed=42, count=3)
    print(f"Seed 42 (repeat): {[item['name'] for item in result2]}")
    print(f"Reproducible: {result1 == result2}\n")

    # Test 2: Different seed
    print("Test 2: Different seed")
    result3 = seeded_select(test_pool, seed=123, count=3)
    print(f"Seed 123: {[item['name'] for item in result3]}")
    print(f"Different from seed 42: {result1 != result3}\n")

    # Test 3: Shuffle
    print("Test 3: Shuffle")
    shuffled = seeded_shuffle(test_pool, seed=42, limit=5)
    print(f"Shuffled (seed 42): {[item['name'] for item in shuffled]}\n")

    # Test 4: Filter and select
    print("Test 4: Filter and select")
    filtered = seeded_filter_and_select(test_pool, seed=42, count=3, filter_key="category", filter_values=["Kitchen", "Home"])
    print(f"Kitchen/Home only: {[item['name'] for item in filtered]}\n")

    # Test 5: Proportional distribution
    print("Test 5: Proportional distribution")
    distributed = seeded_distribution(test_pool, seed=42, category_key="category", total_count=6)
    # print("Distributed: ", {[f"{item['name']} ({item['category']})" for item in distributed]})

    # Test 6: Verify reproducibility
    print("\nTest 6: Verify reproducibility")
    is_reproducible = verify_reproducibility(test_pool, seed=42, count=5)
    print(f"Is reproducible: {is_reproducible}")
