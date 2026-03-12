"""
Integration tests for the FastAPI server.
Uses TestClient with mocked DB pool so endpoints can be tested without a real database.
"""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# Import after conftest adds src to path
import server


async def _fake_init_db_pool():
    """Set app.state.pool = None so routes that check pool get 503; others work."""
    server.app.state.pool = None


def _make_mock_pool():
    """Create a mock pool with fetchrow/fetch/fetchval returning success-style results."""
    mock = MagicMock()
    mock.fetchrow = AsyncMock(
        return_value={"id": 1, "created_at": datetime.now(timezone.utc)},
    )
    mock.fetch = AsyncMock(
        return_value=[
            {
                "id": 1,
                "web_agent_id": "agent1",
                "web_url": "https://example.com",
                "validator_id": "v1",
                "data": '{"event": "click"}',
                "created_at": datetime.now(timezone.utc),
            },
        ],
    )
    mock.fetchval = AsyncMock(return_value=2)
    return mock


async def _fake_init_db_pool_with_mock():
    """Set app.state.pool to a mock so event endpoints return 200."""
    server.app.state.pool = _make_mock_pool()


@pytest.fixture
def client():
    """Create TestClient with DB pool mocked so app starts without Postgres."""
    with patch.object(server, "init_db_pool", side_effect=_fake_init_db_pool):
        with TestClient(server.app) as c:
            yield c


@pytest.fixture
def client_with_pool():
    """Create TestClient with a mock pool so save/get/reset events return success."""
    with patch.object(server, "init_db_pool", side_effect=_fake_init_db_pool_with_mock):
        with TestClient(server.app) as c:
            yield c


# --- Root and health ---
def test_root_returns_200_and_endpoints(client):
    r = client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data
    assert "endpoints" in data
    assert data["endpoints"]["health"] == "/health"
    assert "save_events" in data["endpoints"] or "save_events/" in str(data["endpoints"])


def test_health_returns_200(client):
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert "status" in data
    assert data["database_pool_operational"] is False  # we mocked pool = None
    assert "timestamp" in data


def test_health_with_pool_operational(client):
    """When pool exists and fetchval('SELECT 1') returns 1, health is healthy."""
    from unittest.mock import AsyncMock, MagicMock

    class _AsyncCtx:
        def __init__(self, conn):
            self.conn = conn

        async def __aenter__(self):
            return self.conn

        async def __aexit__(self, *args):
            return None

    conn = MagicMock()
    conn.fetchval = AsyncMock(return_value=1)
    pool = MagicMock()
    pool.acquire.return_value = _AsyncCtx(conn)
    server.app.state.pool = pool
    try:
        r = client.get("/health")
    finally:
        server.app.state.pool = None
    assert r.status_code == 200
    data = r.json()
    assert data["database_pool_operational"] is True
    assert data["status"] == "healthy"


def test_health_pool_exists_but_fetchval_raises(client):
    """When pool exists but fetchval raises, health reports unhealthy."""
    from unittest.mock import AsyncMock, MagicMock
    from asyncpg.exceptions import PostgresError

    class _AsyncCtx:
        def __init__(self, conn):
            self.conn = conn

        async def __aenter__(self):
            return self.conn

        async def __aexit__(self, *args):
            return None

    conn = MagicMock()
    conn.fetchval = AsyncMock(side_effect=PostgresError("connection failed"))
    pool = MagicMock()
    pool.acquire.return_value = _AsyncCtx(conn)
    server.app.state.pool = pool
    try:
        r = client.get("/health")
    finally:
        server.app.state.pool = None
    assert r.status_code == 200
    data = r.json()
    assert data["database_pool_operational"] is False
    assert "PostgresError" in data.get("debug_message", "")


def test_health_pool_exists_but_fetchval_raises_generic(client):
    """When pool exists but fetchval raises generic Exception, health reports unhealthy."""
    from unittest.mock import AsyncMock, MagicMock

    class _AsyncCtx:
        def __init__(self, conn):
            self.conn = conn

        async def __aenter__(self):
            return self.conn

        async def __aexit__(self, *args):
            return None

    conn = MagicMock()
    conn.fetchval = AsyncMock(side_effect=RuntimeError("timeout"))
    pool = MagicMock()
    pool.acquire.return_value = _AsyncCtx(conn)
    server.app.state.pool = pool
    try:
        r = client.get("/health")
    finally:
        server.app.state.pool = None
    assert r.status_code == 200
    data = r.json()
    assert data["database_pool_operational"] is False


# --- Seeds resolve (no DB required) ---
def test_seeds_resolve_post(client):
    r = client.post(
        "/seeds/resolve",
        json={"seed": 42, "v1_enabled": True, "v2_enabled": False, "v3_enabled": False},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["base"] == 42
    assert data["v1"] is not None
    assert data["v2"] is None
    assert data["v3"] is None


def test_seeds_resolve_post_with_trailing_slash(client):
    r = client.post(
        "/seeds/resolve/",
        json={"seed": 1, "v1_enabled": False, "v2_enabled": True},
    )
    assert r.status_code == 200
    assert r.json()["base"] == 1
    assert r.json()["v2"] is not None


def test_seeds_resolve_get(client):
    r = client.get("/seeds/resolve?seed=99&v1_enabled=true&v2_enabled=true")
    assert r.status_code == 200
    data = r.json()
    assert data["base"] == 99
    assert data["v1"] is not None
    assert data["v2"] is not None


def test_seeds_resolve_post_with_config(client):
    r = client.post(
        "/seeds/resolve",
        json={
            "seed": 50,
            "v1_enabled": True,
            "v2_enabled": False,
            "v3_enabled": False,
            "v1_config": {"max": 100, "multiplier": 2, "offset": 10},
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert data["base"] == 50
    assert data["v1"] is not None


def test_seeds_resolve_validation_seed_too_low(client):
    r = client.post("/seeds/resolve", json={"seed": 0, "v1_enabled": False})
    assert r.status_code == 422  # validation error


def test_seeds_resolve_validation_seed_too_high(client):
    r = client.post("/seeds/resolve", json={"seed": 1000, "v1_enabled": False})
    assert r.status_code == 422


def test_seeds_resolve_post_exception_500(client):
    with patch.object(server, "resolve_seeds", side_effect=RuntimeError("resolve failed")):
        r = client.post("/seeds/resolve", json={"seed": 42, "v1_enabled": False})
    assert r.status_code == 500


def test_seeds_resolve_get_exception_500(client):
    with patch.object(server, "resolve_seeds", side_effect=ValueError("bad seed")):
        r = client.get("/seeds/resolve?seed=42&v1_enabled=false")
    assert r.status_code == 500


# --- Endpoints that require DB return 503 when pool is None ---
def test_save_events_returns_503_without_pool(client):
    r = client.post(
        "/save_events/",
        json={
            "web_agent_id": "test-agent",
            "web_url": "https://example.com/page",
            "data": {"event": "click"},
        },
    )
    assert r.status_code == 503


def test_get_events_returns_503_without_pool(client):
    r = client.get(
        "/get_events/",
        params={"web_url": "https://example.com", "web_agent_id": "agent1"},
    )
    assert r.status_code == 503


# --- URL trimming helper (unit test via server module) ---
def test_trim_url_to_origin():
    assert server.trim_url_to_origin("https://example.com:443/path?q=1") == "https://example.com:443"
    assert server.trim_url_to_origin("http://localhost:8000/") == "http://localhost:8000"


# --- extract_json_from_content ---
def test_extract_json_from_content_direct():
    raw = '[{"id": 1}]'
    assert server.extract_json_from_content(raw) == raw


def test_extract_json_from_content_markdown_block():
    content = '```json\n[{"id": 1}]\n```'
    out = server.extract_json_from_content(content)
    assert "[{" in out and "}]" in out


def test_extract_json_from_content_empty():
    assert server.extract_json_from_content("") == ""


def test_extract_json_from_content_markdown_block_no_lang():
    content = '```\n[{"id": 1}]\n```'
    out = server.extract_json_from_content(content)
    assert out == '[{"id": 1}]'


def test_extract_json_from_content_text_with_json():
    content = 'Here is the data: [{"x": 1}, {"x": 2}] end'
    out = server.extract_json_from_content(content)
    assert '[{"x": 1}' in out and '{"x": 2}]' in out


def test_extract_json_from_content_multiple_blocks_returns_first_json_array():
    content = '```\nnot json\n```\n```json\n[{"a": 1}]\n```'
    out = server.extract_json_from_content(content)
    assert '[{"a": 1}]' in out or out.strip().startswith("[")


def test_extract_json_from_content_no_pattern_returns_original():
    content = "no brackets here"
    assert server.extract_json_from_content(content) == content


def test_extract_json_from_content_code_blocks_none_json_array_returns_last_block():
    """When code blocks exist but none is a JSON array, returns last block."""
    content = "```\nnot json\n```\n```\nalso not\n```"
    out = server.extract_json_from_content(content)
    assert "also not" in out


# --- Event endpoints with mock pool (success paths) ---
def test_save_events_success(client_with_pool):
    r = client_with_pool.post(
        "/save_events/",
        json={
            "web_agent_id": "agent1",
            "web_url": "https://example.com/page",
            "data": {"event": "click"},
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert data.get("event_id") == 1
    assert "created_at" in data


def test_get_events_success(client_with_pool):
    r = client_with_pool.get(
        "/get_events/",
        params={"web_url": "https://example.com", "web_agent_id": "agent1"},
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["id"] == 1
    assert data[0]["data"] == {"event": "click"}


def test_reset_events_success(client_with_pool):
    r = client_with_pool.delete(
        "/reset_events/",
        params={"web_url": "https://example.com", "web_agent_id": "agent1"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["deleted_count"] == 2
    assert "web_url" in data


# --- Server helpers (unit) ---
def test_use_docker_network_for_webs_false(monkeypatch):
    monkeypatch.delenv("WEBS_HEALTH_USE_DOCKER_NETWORK", raising=False)
    assert server._use_docker_network_for_webs() is False
    monkeypatch.setenv("WEBS_HEALTH_USE_DOCKER_NETWORK", "false")
    assert server._use_docker_network_for_webs() is False


def test_use_docker_network_for_webs_true(monkeypatch):
    monkeypatch.setenv("WEBS_HEALTH_USE_DOCKER_NETWORK", "true")
    assert server._use_docker_network_for_webs() is True
    monkeypatch.setenv("WEBS_HEALTH_USE_DOCKER_NETWORK", "1")
    assert server._use_docker_network_for_webs() is True


def test_build_web_url():
    assert server._build_web_url("http://localhost", 8000) == "http://localhost:8000"
    assert server._build_web_url("https://example.com", 443) == "https://example.com:443"


def test_build_docker_web_url():
    assert server._build_docker_web_url("autocrm", 8004) == "http://autocrm_8004-web-1:8004"


def test_health_webs_endpoint(client):
    """GET /health/webs returns structure; mock _check_single_web_health to avoid HTTP."""
    from server import WebHealthItem

    async def _fake_check(*args, **kwargs):
        return WebHealthItem(
            project_key="web_1_autocinema",
            name="autocinema",
            url="http://localhost:8000",
            status="healthy",
            status_code=200,
            error=None,
        )

    with patch.object(server, "_check_single_web_health", side_effect=_fake_check):
        r = client.get("/health/webs")
    assert r.status_code == 200
    data = r.json()
    assert "webs" in data
    assert "healthy_count" in data
    assert "total_count" in data
    assert "overall_status" in data
    assert data["total_count"] == min(14, len(server.DEPLOYED_WEBS))


def test_health_pool_fetchval_returns_non_one(client):
    """When fetchval returns something other than 1, health is unhealthy."""
    from unittest.mock import AsyncMock, MagicMock

    class _AsyncCtx:
        def __init__(self, conn):
            self.conn = conn

        async def __aenter__(self):
            return self.conn

        async def __aexit__(self, *args):
            return None

    conn = MagicMock()
    conn.fetchval = AsyncMock(return_value=0)
    pool = MagicMock()
    pool.acquire.return_value = _AsyncCtx(conn)
    server.app.state.pool = pool
    try:
        r = client.get("/health")
    finally:
        server.app.state.pool = None
    assert r.status_code == 200
    data = r.json()
    assert data["database_pool_operational"] is False
    assert "unexpected result" in data.get("debug_message", "").lower()


def test_is_v2_enabled_false(monkeypatch):
    monkeypatch.setenv("ENABLE_DYNAMIC_V2", "false")
    assert server._is_v2_enabled() is False
    monkeypatch.setenv("ENABLE_DYNAMIC_V2", "0")
    assert server._is_v2_enabled() is False


def test_is_v2_enabled_true(monkeypatch):
    monkeypatch.setenv("ENABLE_DYNAMIC_V2", "true")
    assert server._is_v2_enabled() is True


def test_apply_seeded_selection_select():
    pool = [{"id": 1}, {"id": 2}, {"id": 3}]
    out = server._apply_seeded_selection(pool, seed=42, limit=2, method="select", filter_key=None, filter_values=None)
    assert len(out) == 2
    assert all(x in pool for x in out)


def test_apply_seeded_selection_shuffle():
    pool = [{"id": 1}, {"id": 2}, {"id": 3}]
    out = server._apply_seeded_selection(pool, seed=42, limit=2, method="shuffle", filter_key=None, filter_values=None)
    assert len(out) == 2


def test_apply_seeded_selection_filter():
    pool = [{"id": 1, "cat": "A"}, {"id": 2, "cat": "B"}, {"id": 3, "cat": "A"}]
    out = server._apply_seeded_selection(
        pool,
        seed=42,
        limit=1,
        method="filter",
        filter_key="cat",
        filter_values="A",
    )
    assert len(out) <= 1
    assert all(x.get("cat") == "A" for x in out)


def test_apply_seeded_selection_distribute():
    pool = [{"id": 1, "category": "X"}, {"id": 2, "category": "Y"}]
    out = server._apply_seeded_selection(
        pool,
        seed=42,
        limit=2,
        method="distribute",
        filter_key="category",
        filter_values=None,
    )
    assert len(out) <= 2


def test_build_load_metadata():
    meta = server._build_load_metadata(
        "web_1",
        "movies",
        seed=42,
        limit=10,
        method="select",
        filter_key=None,
        filter_values=None,
        total_available=100,
    )
    assert meta["projectKey"] == "web_1"
    assert meta["entityType"] == "movies"
    assert meta["seed"] == 42
    assert meta["limit"] == 10
    assert meta["totalAvailable"] == 100


# --- GET /datasets/load with mocked load_all_data ---
def test_datasets_load_success(client, monkeypatch):
    mock_data = [{"id": 1, "name": "A"}, {"id": 2, "name": "B"}]
    with patch.object(server, "load_all_data", return_value=mock_data):
        r = client.get(
            "/datasets/load",
            params={
                "project_key": "web_1_autocinema",
                "entity_type": "movies",
                "seed_value": 1,
                "limit": 50,
            },
        )
    assert r.status_code == 200
    data = r.json()
    assert data["count"] == 2
    assert data["data"] == mock_data
    assert "metadata" in data


def test_datasets_load_empty_404(client, monkeypatch):
    with patch.object(server, "load_all_data", return_value=[]):
        r = client.get(
            "/datasets/load",
            params={
                "project_key": "web_1_autocinema",
                "entity_type": "movies",
                "seed_value": 1,
                "limit": 50,
            },
        )
    assert r.status_code == 404


def test_datasets_load_exception_500(client, monkeypatch):
    with patch.object(server, "load_all_data", side_effect=RuntimeError("load failed")):
        r = client.get(
            "/datasets/load",
            params={
                "project_key": "web_1",
                "entity_type": "movies",
                "seed_value": 1,
                "limit": 50,
            },
        )
    assert r.status_code == 500


def test_datasets_load_v2_seeded(client, monkeypatch):
    monkeypatch.setenv("ENABLE_DYNAMIC_V2", "true")
    mock_data = [{"id": i} for i in range(100)]
    with patch.object(server, "load_all_data", return_value=mock_data):
        r = client.get(
            "/datasets/load",
            params={
                "project_key": "web_1",
                "entity_type": "movies",
                "seed_value": 42,
                "limit": 5,
                "method": "select",
            },
        )
    assert r.status_code == 200
    data = r.json()
    assert data["count"] == 5
    assert len(data["data"]) == 5


def test_datasets_load_v2_filter_method(client, monkeypatch):
    monkeypatch.setenv("ENABLE_DYNAMIC_V2", "true")
    mock_data = [
        {"id": 1, "cat": "A"},
        {"id": 2, "cat": "B"},
        {"id": 3, "cat": "A"},
    ]
    with patch.object(server, "load_all_data", return_value=mock_data):
        r = client.get(
            "/datasets/load",
            params={
                "project_key": "web_1",
                "entity_type": "items",
                "seed_value": 42,
                "limit": 10,
                "method": "filter",
                "filter_key": "cat",
                "filter_values": "A",
            },
        )
    assert r.status_code == 200
    data = r.json()
    assert data["metadata"]["method"] == "filter"
    assert all(item.get("cat") == "A" for item in data["data"])


# --- GET /datasets/pools and GET /datasets/pool/info (require pool) ---
def test_datasets_pools_returns_503_without_pool(client):
    r = client.get("/datasets/pools")
    assert r.status_code == 503


def test_datasets_pools_exception_500(client_with_pool):
    async def _raise(*args, **kwargs):
        raise RuntimeError("db error")

    with patch.object(server, "list_available_pools", side_effect=_raise):
        r = client_with_pool.get("/datasets/pools")
    assert r.status_code == 500


def test_datasets_pools_success(client_with_pool):
    pools_data = [
        {"project_key": "p1", "entity_type": "e1", "pool_size": 10, "updated_at": "2025-01-01T00:00:00"},
    ]

    async def _async_list_pools(*args, **kwargs):
        return pools_data

    with patch.object(server, "list_available_pools", side_effect=_async_list_pools):
        r = client_with_pool.get("/datasets/pools")
    assert r.status_code == 200
    data = r.json()
    assert data["pools"] == pools_data
    assert data["count"] == 1


def test_datasets_pools_with_project_filter(client_with_pool):
    pools_data = [
        {"project_key": "proj1", "entity_type": "e1", "pool_size": 5, "updated_at": "2025-01-01T00:00:00"},
    ]

    async def _async_list_pools(*args, **kwargs):
        return pools_data

    with patch.object(server, "list_available_pools", side_effect=_async_list_pools):
        r = client_with_pool.get("/datasets/pools", params={"project_key": "proj1"})
    assert r.status_code == 200
    assert r.json()["count"] == 1
    assert r.json()["pools"][0]["project_key"] == "proj1"


def test_datasets_pool_info_returns_503_without_pool(client):
    r = client.get("/datasets/pool/info", params={"project_key": "p1", "entity_type": "e1"})
    assert r.status_code == 503


def test_datasets_pool_info_exception_500(client_with_pool):
    async def _raise(*args, **kwargs):
        raise RuntimeError("db error")

    with patch.object(server, "get_pool_info", side_effect=_raise):
        r = client_with_pool.get("/datasets/pool/info", params={"project_key": "p1", "entity_type": "e1"})
    assert r.status_code == 500


def test_datasets_pool_info_404_when_not_found(client_with_pool):
    async def _async_none(*args, **kwargs):
        return None

    with patch.object(server, "get_pool_info", side_effect=_async_none):
        r = client_with_pool.get("/datasets/pool/info", params={"project_key": "p1", "entity_type": "e1"})
    assert r.status_code == 404


def test_datasets_pool_info_success(client_with_pool):
    info_data = {
        "project_key": "p1",
        "entity_type": "e1",
        "pool_size": 50,
        "metadata": {},
        "created_at": "2025-01-01T00:00:00",
        "updated_at": "2025-01-01T00:00:00",
    }

    async def _async_info(*args, **kwargs):
        return info_data

    with patch.object(server, "get_pool_info", side_effect=_async_info):
        r = client_with_pool.get("/datasets/pool/info", params={"project_key": "p1", "entity_type": "e1"})
    assert r.status_code == 200
    data = r.json()
    assert data["project_key"] == "p1"
    assert data["entity_type"] == "e1"
    assert data["pool_size"] == 50


# --- Data generation endpoint (mocked OpenAI) ---
def test_datasets_generate_success(client):
    """POST /datasets/generate with mocked generate_with_openai returns 200."""
    mock_data = [{"id": "1", "name": "A"}, {"id": "2", "name": "B"}]

    async def _fake_generate(request):
        return mock_data

    with patch.object(server, "generate_with_openai", side_effect=_fake_generate):
        with patch.object(server, "append_or_rollover_entity_data", return_value="/tmp/out.json"):
            r = client.post(
                "/datasets/generate",
                json={
                    "interface_definition": "interface X { id: string; name: string; }",
                    "examples": [{"id": "0", "name": "Example"}],
                    "count": 2,
                },
            )
    assert r.status_code == 200
    data = r.json()
    assert data["count"] == 2
    assert data["generated_data"] == mock_data
    assert "generation_time" in data


def test_datasets_generate_smart_success(client):
    """POST /datasets/generate-smart with all deps mocked returns 200."""
    mock_data = [{"id": 1, "name": "A"}]

    with patch.object(server, "get_allowed_project_keys", return_value=["web_5_autocrm"]):
        with patch.object(server, "build_generation_prompt_from_examples", return_value=("interface X {}", [{}])):
            with patch.object(server, "get_project_entity_metadata", return_value={"categories": None, "requirements": ""}):

                async def _fake_generate(request):
                    return mock_data

                with patch.object(server, "generate_with_openai", side_effect=_fake_generate):
                    with patch.object(server, "append_to_entity_data", return_value="/tmp/out.json"):
                        r = client.post(
                            "/datasets/generate-smart",
                            json={
                                "project_key": "web_5_autocrm",
                                "entity_type": "logs",
                                "count": 1,
                                "mode": "append",
                            },
                        )
    assert r.status_code == 200
    data = r.json()
    assert data["count"] == 1
    assert data["generated_data"] == mock_data


# --- EventInput validation (invalid URL) ---
def test_save_events_invalid_url_returns_400(client_with_pool):
    r = client_with_pool.post(
        "/save_events/",
        json={
            "web_agent_id": "agent1",
            "web_url": "not-a-valid-url",
            "data": {"event": "click"},
        },
    )
    assert r.status_code == 422
