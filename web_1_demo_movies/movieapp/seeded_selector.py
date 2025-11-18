"""
Seeded Data Selector for Django
Provides deterministic, reproducible data selection based on seed values.
Same logic as webs_server/src/seeded_selector.py but for Django ORM.
"""

import random
from typing import List, Dict, Any, Optional


def seeded_select(data_pool: List[Any], seed: int, count: int, allow_duplicates: bool = False) -> List[Any]:
    """
    Select data from pool using a seed for reproducibility.
    
    Args:
        data_pool: Master dataset to select from (list of model instances or dicts)
        seed: Seed value for reproducible selection
        count: Number of items to select
        allow_duplicates: If True, can select same item multiple times
    
    Returns:
        List of selected items (deterministic based on seed)
    """
    if not data_pool:
        return []
    
    # Convert to list if it's a QuerySet
    if hasattr(data_pool, '__iter__') and not isinstance(data_pool, (list, tuple)):
        data_pool = list(data_pool)
    
    # Create a new Random instance with the seed
    rng = random.Random(seed)
    
    if allow_duplicates or count > len(data_pool):
        # Select with replacement
        return [rng.choice(data_pool) for _ in range(count)]
    else:
        # Select without replacement (unique items)
        return rng.sample(data_pool, min(count, len(data_pool)))


def seeded_shuffle(data_pool: List[Any], seed: int, limit: Optional[int] = None) -> List[Any]:
    """
    Shuffle data pool using seed, then optionally limit results.
    
    Args:
        data_pool: Master dataset
        seed: Seed value
        limit: Optional limit on number of items
    
    Returns:
        Shuffled items (deterministic based on seed)
    """
    if not data_pool:
        return []
    
    # Convert to list if it's a QuerySet
    if hasattr(data_pool, '__iter__') and not isinstance(data_pool, (list, tuple)):
        data_pool = list(data_pool)
    
    # Create a copy to avoid modifying original
    shuffled = data_pool.copy()
    
    # Shuffle with seed
    rng = random.Random(seed)
    rng.shuffle(shuffled)
    
    if limit is not None:
        return shuffled[:limit]
    
    return shuffled


def seeded_distribution(data_pool: List[Any], seed: int, category_key: str, total_count: int) -> List[Any]:
    """
    Distribute selection across categories proportionally.
    
    Args:
        data_pool: Master dataset (list of model instances)
        seed: Seed value
        category_key: Attribute name that contains category (e.g., 'category' or 'genres')
        total_count: Total number of items to select
    
    Returns:
        Selected items with proportional category distribution
    """
    rng = random.Random(seed)
    
    # Group by category
    categories: Dict[str, List[Any]] = {}
    for item in data_pool:
        # Support both dict and model instance
        if isinstance(item, dict):
            cat = item.get(category_key, "unknown")
        else:
            # Try to get attribute, might be a ManyToMany field
            cat_val = getattr(item, category_key, None)
            if hasattr(cat_val, 'all'):  # ManyToMany field
                # Get first genre name
                first_genre = cat_val.first()
                cat = first_genre.name if first_genre else "unknown"
            elif hasattr(cat_val, 'name'):  # Related object
                cat = cat_val.name
            else:
                cat = str(cat_val) if cat_val else "unknown"
        
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

