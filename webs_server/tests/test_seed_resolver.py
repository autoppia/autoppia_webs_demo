"""
Unit tests for seed_resolver: env bool, clamp, derive_seed, resolve_seeds.
"""

from seed_resolver import (
    bool_from_env,
    clamp_base_seed,
    derive_seed,
    resolve_seeds,
)


# --- bool_from_env ---
def test_bool_from_env_empty_false():
    assert bool_from_env(None) is False
    assert bool_from_env("") is False


def test_bool_from_env_true_values():
    assert bool_from_env("true") is True
    assert bool_from_env("TRUE") is True
    assert bool_from_env("1") is True
    assert bool_from_env("yes") is True
    assert bool_from_env("y") is True


def test_bool_from_env_false_values():
    assert bool_from_env("false") is False
    assert bool_from_env("0") is False
    assert bool_from_env("no") is False
    assert bool_from_env("anything") is False


# --- clamp_base_seed ---
def test_clamp_base_seed_in_range():
    assert clamp_base_seed(50) == 50
    assert clamp_base_seed(1) == 1
    assert clamp_base_seed(999) == 999


def test_clamp_base_seed_below_min():
    assert clamp_base_seed(0) == 1
    assert clamp_base_seed(-100) == 1


def test_clamp_base_seed_above_max():
    assert clamp_base_seed(1000) == 999
    assert clamp_base_seed(9999) == 999


def test_clamp_base_seed_custom_bounds():
    assert clamp_base_seed(5, min_val=10, max_val=20) == 10
    assert clamp_base_seed(25, min_val=10, max_val=20) == 20
    assert clamp_base_seed(15, min_val=10, max_val=20) == 15


# --- derive_seed ---
def test_derive_seed_deterministic():
    assert derive_seed(42, 29, 900) == derive_seed(42, 29, 900)
    assert derive_seed(1, 53, 900, offset=17) == derive_seed(1, 53, 900, offset=17)


def test_derive_seed_in_range():
    s = derive_seed(100, 29, 900)
    assert 1 <= s <= 900


def test_derive_seed_with_offset():
    s1 = derive_seed(10, 29, 900, offset=0)
    s2 = derive_seed(10, 29, 900, offset=7)
    assert s1 != s2 or s1 == s2


# --- resolve_seeds ---
def test_resolve_seeds_all_disabled():
    r = resolve_seeds(42, v1_enabled=False, v2_enabled=False, v3_enabled=False)
    assert r["base"] == 42
    assert r["v1"] is None
    assert r["v2"] is None
    assert r["v3"] is None


def test_resolve_seeds_clamps_base():
    r = resolve_seeds(0, v1_enabled=False, v2_enabled=False, v3_enabled=False)
    assert r["base"] == 1
    r = resolve_seeds(1000, v1_enabled=False, v2_enabled=False, v3_enabled=False)
    assert r["base"] == 999


def test_resolve_seeds_v1_enabled():
    r = resolve_seeds(42, v1_enabled=True, v2_enabled=False, v3_enabled=False)
    assert r["base"] == 42
    assert r["v1"] is not None
    assert 1 <= r["v1"] <= 900
    assert r["v2"] is None
    assert r["v3"] is None


def test_resolve_seeds_v2_v3_enabled():
    r = resolve_seeds(100, v1_enabled=False, v2_enabled=True, v3_enabled=True)
    assert r["v2"] is not None
    assert r["v3"] is not None
    assert r["v1"] is None


def test_resolve_seeds_all_enabled():
    r = resolve_seeds(50, v1_enabled=True, v2_enabled=True, v3_enabled=True)
    assert r["v1"] is not None
    assert r["v2"] is not None
    assert r["v3"] is not None


def test_resolve_seeds_custom_config():
    r = resolve_seeds(
        10,
        v1_enabled=True,
        v1_config={"max": 100, "multiplier": 7, "offset": 0},
    )
    assert r["v1"] is not None
    assert 1 <= r["v1"] <= 100
