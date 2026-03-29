# Unit/integration coverage tests for master_dataset_handler utilities.
"""
Unit tests for master_dataset_handler: get_master_pool, select_from_pool,
log_seed_usage, get_pool_info, list_available_pools.
Uses mocked asyncpg pool so no real database is required.
"""

import asyncio
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest

from master_dataset_handler import (
    get_master_pool,
    select_from_pool,
    log_seed_usage,
    get_pool_info,
    list_available_pools,
)


def _make_conn_mock(fetchrow_result=None, fetch_result=None, execute_result=None):
    conn = MagicMock()
    conn.__aenter__ = AsyncMock(return_value=conn)
    conn.__aexit__ = AsyncMock(return_value=None)
    # Always set async methods so they are awaitable (default MagicMock is not)
    conn.fetchrow = AsyncMock(return_value=fetchrow_result)
    conn.fetch = AsyncMock(return_value=fetch_result if fetch_result is not None else [])
    conn.execute = AsyncMock(return_value=execute_result)
    return conn


class _AsyncContextManager:
    def __init__(self, conn):
        self.conn = conn

    async def __aenter__(self):
        return self.conn

    async def __aexit__(self, *args):
        return None


def _make_pool_mock(conn_mock):
    pool = MagicMock()
    pool.acquire = MagicMock(return_value=_AsyncContextManager(conn_mock))
    return pool


def _run(coro):
    return asyncio.run(coro)


# --- get_master_pool ---
def test_get_master_pool_returns_none_when_no_row():
    conn = _make_conn_mock(fetchrow_result=None)
    pool = _make_pool_mock(conn)
    result = _run(get_master_pool(pool, "proj1", "products"))
    assert result is None


def test_get_master_pool_returns_data_when_row_has_json_str():
    # Source parses only when str; for bytes it uses row as-is. Use str to hit orjson path.
    raw_str = '[{"id": 1}, {"id": 2}]'
    row = {"data_pool": raw_str, "metadata": "{}"}
    conn = _make_conn_mock(fetchrow_result=row)
    pool = _make_pool_mock(conn)
    result = _run(get_master_pool(pool, "proj1", "products"))
    assert result == [{"id": 1}, {"id": 2}]


def test_get_master_pool_returns_data_when_row_has_list():
    data = [{"id": 1}, {"id": 2}]
    row = {"data_pool": data, "metadata": {}}
    conn = _make_conn_mock(fetchrow_result=row)
    pool = _make_pool_mock(conn)
    result = _run(get_master_pool(pool, "proj1", "products"))
    assert result == data


def test_get_master_pool_raises_on_db_error():
    conn = MagicMock()
    conn.__aenter__ = AsyncMock(return_value=conn)
    conn.__aexit__ = AsyncMock(return_value=None)
    conn.fetchrow = AsyncMock(side_effect=Exception("connection failed"))
    pool = _make_pool_mock(conn)
    with pytest.raises(Exception, match="connection failed"):
        _run(get_master_pool(pool, "proj1", "products"))


# --- select_from_pool ---
def test_select_from_pool_no_master_returns_error_dict():
    conn = _make_conn_mock(fetchrow_result=None)
    pool = _make_pool_mock(conn)
    result = _run(select_from_pool(pool, "proj1", "products", seed=42, count=5, log_usage=False))
    assert result["metadata"]["error"] == "No master pool found"
    assert result["data"] == []
    assert result["metadata"]["project_key"] == "proj1"
    assert result["metadata"]["entity_type"] == "products"


def test_select_from_pool_select_method():
    data = [{"id": i} for i in range(10)]
    row = {"data_pool": data, "metadata": {}}
    conn = _make_conn_mock(fetchrow_result=row)
    pool = _make_pool_mock(conn)
    result = _run(select_from_pool(pool, "proj1", "products", seed=42, count=3, method="select", log_usage=False))
    assert len(result["data"]) == 3
    assert result["metadata"]["selection_method"] == "select"
    assert result["metadata"]["pool_size"] == 10
    assert result["metadata"]["returned_count"] == 3


def test_select_from_pool_shuffle_method():
    data = [{"id": i} for i in range(5)]
    row = {"data_pool": data, "metadata": {}}
    conn = _make_conn_mock(fetchrow_result=row)
    pool = _make_pool_mock(conn)
    result = _run(select_from_pool(pool, "proj1", "products", seed=7, count=3, method="shuffle", log_usage=False))
    assert len(result["data"]) == 3
    assert result["metadata"]["selection_method"] == "shuffle"


def test_select_from_pool_filter_method():
    data = [
        {"id": 1, "cat": "A"},
        {"id": 2, "cat": "B"},
        {"id": 3, "cat": "A"},
    ]
    row = {"data_pool": data, "metadata": {}}
    conn = _make_conn_mock(fetchrow_result=row)
    pool = _make_pool_mock(conn)
    result = _run(select_from_pool(pool, "proj1", "products", seed=1, count=2, method="filter", filter_key="cat", filter_values=["A"], log_usage=False))
    assert result["metadata"]["selection_method"] == "filter"
    assert all(item.get("cat") == "A" for item in result["data"])


def test_select_from_pool_distribute_method():
    data = [
        {"id": 1, "category": "X"},
        {"id": 2, "category": "Y"},
        {"id": 3, "category": "X"},
    ]
    row = {"data_pool": data, "metadata": {}}
    conn = _make_conn_mock(fetchrow_result=row)
    pool = _make_pool_mock(conn)
    result = _run(select_from_pool(pool, "proj1", "products", seed=1, count=3, method="distribute", filter_key="category", log_usage=False))
    assert result["metadata"]["selection_method"] == "distribute"
    assert len(result["data"]) <= 3


def test_select_from_pool_log_usage_swallows_exception():
    data = [{"id": 1}]
    row = {"data_pool": data, "metadata": {}}
    conn = _make_conn_mock(fetchrow_result=row)
    conn.execute = AsyncMock(side_effect=Exception("log table missing"))
    pool = _make_pool_mock(conn)
    result = _run(select_from_pool(pool, "proj1", "products", seed=1, count=1, method="select", log_usage=True))
    assert len(result["data"]) == 1


# --- log_seed_usage ---
def test_log_seed_usage_success():
    conn = _make_conn_mock(execute_result="OK")
    conn.execute = AsyncMock(return_value="OK")
    pool = _make_pool_mock(conn)
    _run(log_seed_usage(pool, "proj1", "products", 42, 10, "select"))


def test_log_seed_usage_failure_logs_and_does_not_raise():
    conn = _make_conn_mock()
    conn.execute = AsyncMock(side_effect=Exception("db error"))
    pool = _make_pool_mock(conn)
    _run(log_seed_usage(pool, "proj1", "products", 42, 10, "select"))


# --- get_pool_info ---
def test_get_pool_info_returns_none_when_no_row():
    conn = _make_conn_mock(fetchrow_result=None)
    pool = _make_pool_mock(conn)
    result = _run(get_pool_info(pool, "proj1", "products"))
    assert result is None


def test_get_pool_info_returns_info_when_row_exists():
    now = datetime.now(timezone.utc)
    # Source does orjson.loads(metadata) only when isinstance(metadata, str)
    row = {
        "pool_size": 100,
        "metadata": '{"source": "generated"}',
        "created_at": now,
        "updated_at": now,
    }
    conn = _make_conn_mock(fetchrow_result=row)
    pool = _make_pool_mock(conn)
    result = _run(get_pool_info(pool, "proj1", "products"))
    assert result is not None
    assert result["project_key"] == "proj1"
    assert result["entity_type"] == "products"
    assert result["pool_size"] == 100
    assert result["metadata"] == {"source": "generated"}
    assert "created_at" in result
    assert "updated_at" in result


def test_get_pool_info_raises_on_db_error():
    conn = MagicMock()
    conn.__aenter__ = AsyncMock(return_value=conn)
    conn.__aexit__ = AsyncMock(return_value=None)
    conn.fetchrow = AsyncMock(side_effect=Exception("db error"))
    pool = _make_pool_mock(conn)
    with pytest.raises(Exception, match="db error"):
        _run(get_pool_info(pool, "proj1", "products"))


# --- list_available_pools ---
def test_list_available_pools_empty():
    conn = _make_conn_mock(fetch_result=[])
    pool = _make_pool_mock(conn)
    result = _run(list_available_pools(pool))
    assert result == []


def test_list_available_pools_with_project_filter():
    now = datetime.now(timezone.utc)
    rows = [
        {"project_key": "proj1", "entity_type": "products", "pool_size": 50, "updated_at": now},
    ]
    conn = _make_conn_mock(fetch_result=rows)
    pool = _make_pool_mock(conn)
    result = _run(list_available_pools(pool, project_key="proj1"))
    assert len(result) == 1
    assert result[0]["project_key"] == "proj1"
    assert result[0]["entity_type"] == "products"
    assert result[0]["pool_size"] == 50
    assert "updated_at" in result[0]


def test_list_available_pools_without_filter():
    now = datetime.now(timezone.utc)
    rows = [
        {"project_key": "p1", "entity_type": "e1", "pool_size": 10, "updated_at": now},
    ]
    conn = _make_conn_mock(fetch_result=rows)
    pool = _make_pool_mock(conn)
    result = _run(list_available_pools(pool))
    assert len(result) == 1
    assert result[0]["project_key"] == "p1"


def test_list_available_pools_raises_on_db_error():
    conn = MagicMock()
    conn.__aenter__ = AsyncMock(return_value=conn)
    conn.__aexit__ = AsyncMock(return_value=None)
    conn.fetch = AsyncMock(side_effect=Exception("db error"))
    pool = _make_pool_mock(conn)
    with pytest.raises(Exception, match="db error"):
        _run(list_available_pools(pool))
