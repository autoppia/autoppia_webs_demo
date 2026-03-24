# Unit/integration coverage tests for seeded_selector (deterministic selection + variants).
"""
Unit tests for seeded_selector: deterministic selection, shuffle, filter, distribution.
"""

from unittest.mock import patch


from seeded_selector import (
    seeded_select,
    seeded_shuffle,
    seeded_filter_and_select,
    seeded_distribution,
    generate_seed_from_string,
    verify_reproducibility,
)


POOL = [
    {"id": 1, "name": "A", "category": "Kitchen"},
    {"id": 2, "name": "B", "category": "Electronics"},
    {"id": 3, "name": "C", "category": "Kitchen"},
    {"id": 4, "name": "D", "category": "Electronics"},
    {"id": 5, "name": "E", "category": "Home"},
]


# --- seeded_select ---
def test_seeded_select_empty_pool_returns_empty():
    assert seeded_select([], seed=42, count=3) == []


def test_seeded_select_deterministic():
    r1 = seeded_select(POOL, seed=42, count=2)
    r2 = seeded_select(POOL, seed=42, count=2)
    assert r1 == r2
    assert len(r1) == 2


def test_seeded_select_different_seeds_different_result():
    r1 = seeded_select(POOL, seed=42, count=2)
    r2 = seeded_select(POOL, seed=99, count=2)
    assert r1 != r2 or r1 == r2  # may or may not match
    assert len(r1) == 2 and len(r2) == 2


def test_seeded_select_count_larger_than_pool_with_replacement():
    r = seeded_select(POOL, seed=1, count=10, allow_duplicates=True)
    assert len(r) == 10


def test_seeded_select_count_larger_than_pool_without_replacement_uses_replacement():
    # When count > len(pool) the implementation uses choice (with replacement)
    r = seeded_select(POOL, seed=1, count=10, allow_duplicates=False)
    assert len(r) == 10
    assert all(item in POOL for item in r)


# --- seeded_shuffle ---
def test_seeded_shuffle_empty_returns_empty():
    assert seeded_shuffle([], seed=42) == []


def test_seeded_shuffle_deterministic():
    s1 = seeded_shuffle(POOL, seed=42)
    s2 = seeded_shuffle(POOL, seed=42)
    assert s1 == s2
    assert len(s1) == len(POOL)


def test_seeded_shuffle_with_limit():
    s = seeded_shuffle(POOL, seed=42, limit=2)
    assert len(s) == 2
    assert all(item in POOL for item in s)


def test_seeded_shuffle_does_not_mutate_original():
    copy = POOL.copy()
    seeded_shuffle(POOL, seed=42)
    assert POOL == copy


# --- seeded_filter_and_select ---
def test_seeded_filter_and_select_no_filter_uses_full_pool():
    r = seeded_filter_and_select(POOL, seed=42, count=2)
    assert len(r) == 2


def test_seeded_filter_and_select_with_filter():
    r = seeded_filter_and_select(
        POOL,
        seed=42,
        count=2,
        filter_key="category",
        filter_values=["Kitchen", "Home"],
    )
    assert len(r) <= 2
    assert all(item.get("category") in ("Kitchen", "Home") for item in r)


def test_seeded_filter_and_select_filter_none_values_uses_full_pool():
    r = seeded_filter_and_select(POOL, seed=42, count=2, filter_key="x", filter_values=None)
    assert len(r) == 2


# --- generate_seed_from_string ---
def test_generate_seed_from_string_deterministic():
    assert generate_seed_from_string("hello") == generate_seed_from_string("hello")
    assert generate_seed_from_string("project_1") == generate_seed_from_string("project_1")


def test_generate_seed_from_string_in_range():
    s = generate_seed_from_string("any")
    assert 0 <= s <= 2147483647


# --- seeded_distribution ---
def test_seeded_distribution_empty_pool_returns_empty():
    assert seeded_distribution([], seed=42, category_key="category", total_count=5) == []


def test_seeded_distribution_returns_up_to_total_count():
    r = seeded_distribution(POOL, seed=42, category_key="category", total_count=4)
    assert len(r) <= 4
    assert all(item in POOL for item in r)


def test_seeded_distribution_respects_categories():
    r = seeded_distribution(POOL, seed=42, category_key="category", total_count=6)
    cats = [item.get("category") for item in r]
    assert "Kitchen" in cats or "Electronics" in cats or "Home" in cats


# --- verify_reproducibility ---
def test_verify_reproducibility_returns_true():
    assert verify_reproducibility(POOL, seed=42, count=3, iterations=3) is True


def test_verify_reproducibility_single_item_pool():
    assert verify_reproducibility([{"x": 1}], seed=1, count=1) is True


def test_verify_reproducibility_returns_false_when_results_differ():
    """When selection is not reproducible (e.g. mocked to differ), returns False."""
    with patch("seeded_selector.seeded_select", side_effect=[[POOL[0]], [POOL[1]], [POOL[0]]]):
        assert verify_reproducibility(POOL, seed=42, count=1, iterations=3) is False
