# Unit/integration coverage tests for data_handler (path validation + safe I/O).
"""
Unit tests for data_handler path validation and safe I/O (new code coverage for SonarCloud).
Tests run with BASE_DATA_PATH set to a temp dir so no real /app/data is used.
"""

import os
import json
from pathlib import Path

import pytest

# Import after conftest adds src to path
import data_handler as dh


# --- Fixtures: isolated temp base path ---
@pytest.fixture
def temp_base(tmp_path):
    """Use a temp directory as BASE_PATH for tests."""
    base = tmp_path / "data"
    base.mkdir()
    return str(base)


@pytest.fixture(autouse=True)
def patch_base_path(temp_base, monkeypatch):
    """Point data_handler.BASE_PATH at temp dir for the test run."""
    monkeypatch.setattr(dh, "BASE_PATH", temp_base)
    return temp_base


# --- _validate_safe_segment ---
def test_validate_safe_segment_accepts_valid():
    dh._validate_safe_segment("web_4_autodining", "web_name")
    dh._validate_safe_segment("restaurants", "entity_type")
    dh._validate_safe_segment("a1-b2_c3", "value")


def test_validate_safe_segment_rejects_empty():
    with pytest.raises(ValueError, match="Invalid .* only alphanumeric"):
        dh._validate_safe_segment("", "web_name")


def test_validate_safe_segment_rejects_path_traversal():
    with pytest.raises(ValueError, match="Invalid .* only alphanumeric"):
        dh._validate_safe_segment("../../../etc", "web_name")
    with pytest.raises(ValueError, match="Invalid .* only alphanumeric"):
        dh._validate_safe_segment("web/4", "web_name")


# --- _validate_safe_filename ---
def test_validate_safe_filename_accepts_valid():
    dh._validate_safe_filename("logs_20250117.json")
    dh._validate_safe_filename("entity.json")


def test_validate_safe_filename_rejects_path_separators():
    with pytest.raises(ValueError, match="path separators"):
        dh._validate_safe_filename("dir/file.json")
    with pytest.raises(ValueError, match="path separators"):
        dh._validate_safe_filename("..\\file.json")
    with pytest.raises(ValueError, match="'\\.\\.' not allowed"):
        dh._validate_safe_filename("..")


# --- _resolve_path_under_base ---
def test_resolve_path_under_base_under_dir(temp_base):
    out = dh._resolve_path_under_base(temp_base, "web_1/movies.json")
    assert out is not None
    assert temp_base in out or Path(temp_base).resolve().as_posix() in Path(out).resolve().as_posix()


def test_resolve_path_under_base_traversal_returns_none(temp_base):
    assert dh._resolve_path_under_base(temp_base, "../../etc/passwd") is None
    assert dh._resolve_path_under_base(temp_base, "..") is None


# --- _path_for_io_under_base ---
def test_path_for_io_under_base_accepts_under_base(temp_base):
    p = os.path.join(temp_base, "web_1", "main.json")
    Path(p).parent.mkdir(parents=True, exist_ok=True)
    res = dh._path_for_io_under_base(p)
    assert res == os.path.realpath(p)


def test_path_for_io_under_base_rejects_outside_base(temp_base):
    with pytest.raises(ValueError, match="outside base"):
        dh._path_for_io_under_base("/etc/passwd")


# --- load_all_data: validation and behaviour ---
def test_load_all_data_invalid_web_name_raises():
    with pytest.raises(ValueError, match="Invalid web_name"):
        dh.load_all_data("invalid name with space")


def test_load_all_data_invalid_entity_type_raises():
    with pytest.raises(ValueError, match="Invalid entity_type"):
        dh.load_all_data("web_1_autocinema", entity_type="bad/entity")


def test_load_all_data_empty_when_no_main_json(temp_base):
    # No main.json under project dir -> empty list (no exception)
    os.environ["ENABLE_DYNAMIC_V2"] = "true"
    try:
        result = dh.load_all_data("web_1_autocinema", entity_type="movies")
        assert result == []
    finally:
        os.environ.pop("ENABLE_DYNAMIC_V2", None)


def test_load_all_data_v2_disabled_loads_first_file_only(patch_base_path):
    """When V2 disabled, load_all_data uses first file only; needs valid main.json."""
    base = Path(patch_base_path)
    proj = base / "web_1_autocinema"
    proj.mkdir(parents=True)
    main_json = proj / "main.json"
    main_json.write_text(json.dumps({"movies": ["./movies.json"]}), encoding="utf-8")
    (proj / "movies.json").write_text(json.dumps([{"id": 1}]), encoding="utf-8")
    result = dh.load_all_data("web_1_autocinema", entity_type="movies")
    assert result == [{"id": 1}]


def test_get_main_path_and_get_data_dir(temp_base):
    assert "web_1" in dh.get_main_path("web_1")
    assert "main.json" in dh.get_main_path("web_1")
    assert "web_1" in dh.get_data_dir("web_1")


# --- _parse_json_file_to_items ---
def test_parse_json_file_to_items_list(patch_base_path):
    base = Path(patch_base_path)
    f = base / "web_1" / "data.json"
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps([{"a": 1}, {"b": 2}]), encoding="utf-8")
    out = dh._parse_json_file_to_items(str(f))
    assert out == [{"a": 1}, {"b": 2}]


def test_parse_json_file_to_items_single_dict(patch_base_path):
    base = Path(patch_base_path)
    f = base / "web_1" / "single.json"
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps({"id": 1}), encoding="utf-8")
    out = dh._parse_json_file_to_items(str(f))
    assert out == [{"id": 1}]


def test_parse_json_file_to_items_missing_returns_none(patch_base_path):
    base = Path(patch_base_path)
    out = dh._parse_json_file_to_items(str(base / "nonexistent.json"))
    assert out is None


def test_parse_json_file_to_items_empty_file_returns_none(patch_base_path):
    base = Path(patch_base_path)
    f = base / "empty.json"
    f.write_text("", encoding="utf-8")
    out = dh._parse_json_file_to_items(str(f))
    assert out is None


def test_parse_json_file_to_items_invalid_json_returns_none(patch_base_path):
    base = Path(patch_base_path)
    f = base / "bad.json"
    f.write_text("not json", encoding="utf-8")
    out = dh._parse_json_file_to_items(str(f))
    assert out is None


def test_parse_json_file_to_items_with_allowed_base(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_1"
    proj.mkdir(parents=True)
    (proj / "data.json").write_text(json.dumps([{"x": 1}]), encoding="utf-8")
    out = dh._parse_json_file_to_items(str(proj / "data.json"), allowed_base=str(base))
    assert out == [{"x": 1}]


def test_parse_json_file_to_items_neither_list_nor_dict_returns_none(patch_base_path):
    base = Path(patch_base_path)
    f = base / "num.json"
    f.write_text("42", encoding="utf-8")
    out = dh._parse_json_file_to_items(str(f))
    assert out is None


# --- _load_json_file_with_fallback ---
def test_load_json_file_with_fallback_primary_success(patch_base_path):
    base = Path(patch_base_path)
    primary = base / "primary.json"
    primary.write_text(json.dumps([{"a": 1}]), encoding="utf-8")
    out = dh._load_json_file_with_fallback(str(primary), str(base / "fallback.json"))
    assert out == [{"a": 1}]


def test_load_json_file_with_fallback_fallback_success(patch_base_path):
    base = Path(patch_base_path)
    fallback = base / "fallback.json"
    fallback.write_text(json.dumps([{"b": 2}]), encoding="utf-8")
    out = dh._load_json_file_with_fallback(str(base / "missing.json"), str(fallback))
    assert out == [{"b": 2}]


def test_load_json_file_with_fallback_both_missing_returns_empty(patch_base_path):
    base = Path(patch_base_path)
    out = dh._load_json_file_with_fallback(str(base / "a.json"), str(base / "b.json"))
    assert out == []


# --- _ensure_dir ---
def test_ensure_dir_creates_dir(patch_base_path):
    base = Path(patch_base_path)
    new_dir = base / "new" / "nested"
    dh._ensure_dir(str(new_dir))
    assert new_dir.is_dir()


# --- save_data_file ---
def test_save_data_file_creates_file_and_main_json(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_2_app"
    proj.mkdir(parents=True)
    path = dh.save_data_file("web_2_app", "logs.json", [{"id": 1}, {"id": 2}], "logs")
    assert Path(path).exists()
    assert path.endswith("logs.json") or "logs.json" in path
    main_path = proj / "main.json"
    assert main_path.exists()
    main = json.loads(main_path.read_text(encoding="utf-8"))
    assert main.get("logs") == ["./logs.json"]


def test_save_data_file_appends_to_existing_main(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_3_app"
    proj.mkdir(parents=True)
    (proj / "main.json").write_text(json.dumps({"logs": ["./old.json"]}), encoding="utf-8")
    dh.save_data_file("web_3_app", "new.json", [{"x": 1}], "logs")
    main = json.loads((proj / "main.json").read_text(encoding="utf-8"))
    assert "./old.json" in main["logs"] and "./new.json" in main["logs"]


def test_save_data_file_invalid_web_name_raises():
    with pytest.raises(ValueError, match="Invalid web_name"):
        dh.save_data_file("bad name", "f.json", [], "e")


def test_save_data_file_invalid_filename_raises(patch_base_path):
    with pytest.raises(ValueError, match="Invalid filename"):
        dh.save_data_file("web_1", "../evil.json", [], "e")


# --- load_all_data: V2 enabled, multiple files, no entity filter ---
def test_load_all_data_v2_enabled_multiple_files(patch_base_path, monkeypatch):
    monkeypatch.setenv("ENABLE_DYNAMIC_V2", "true")
    base = Path(patch_base_path)
    proj = base / "web_4_app"
    proj.mkdir(parents=True)
    (proj / "main.json").write_text(json.dumps({"movies": ["./m1.json", "./m2.json"]}), encoding="utf-8")
    (proj / "m1.json").write_text(json.dumps([{"a": 1}]), encoding="utf-8")
    (proj / "m2.json").write_text(json.dumps([{"a": 2}]), encoding="utf-8")
    result = dh.load_all_data("web_4_app", entity_type="movies")
    assert len(result) == 2
    assert result == [{"a": 1}, {"a": 2}]


def test_load_all_data_entity_type_none_loads_first_per_entity(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_5_app"
    proj.mkdir(parents=True)
    (proj / "main.json").write_text(json.dumps({"a": ["./a1.json"], "b": ["./b1.json"]}), encoding="utf-8")
    (proj / "a1.json").write_text(json.dumps([{"ea": 1}]), encoding="utf-8")
    (proj / "b1.json").write_text(json.dumps([{"eb": 1}]), encoding="utf-8")
    result = dh.load_all_data("web_5_app", entity_type=None)
    assert len(result) == 2
    assert {"ea": 1} in result and {"eb": 1} in result


def test_load_all_data_seed_value_1_uses_first_file_only(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_6_app"
    proj.mkdir(parents=True)
    (proj / "main.json").write_text(json.dumps({"x": ["./first.json", "./second.json"]}), encoding="utf-8")
    (proj / "first.json").write_text(json.dumps([{"first": 1}]), encoding="utf-8")
    (proj / "second.json").write_text(json.dumps([{"second": 1}]), encoding="utf-8")
    result = dh.load_all_data("web_6_app", entity_type="x", seed_value=1)
    assert result == [{"first": 1}]


# --- _read_main_json_safe ---
def test_read_main_json_safe_allow_missing_returns_empty_dict(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_7_app"
    proj.mkdir(parents=True)
    web_base, main_io, main = dh._read_main_json_safe("web_7_app", allow_missing=True)
    assert web_base is not None
    assert main_io is not None
    assert main == {}


def test_read_main_json_safe_existing_file(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_8_app"
    proj.mkdir(parents=True)
    (proj / "main.json").write_text(json.dumps({"k": ["./f.json"]}), encoding="utf-8")
    web_base, main_io, main = dh._read_main_json_safe("web_8_app")
    assert main is not None and main.get("k") == ["./f.json"]


def test_read_main_json_safe_invalid_json_returns_none(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_9_app"
    proj.mkdir(parents=True)
    (proj / "main.json").write_text("not json", encoding="utf-8")
    result = dh._read_main_json_safe("web_9_app")
    assert result == (None, None, None)


# --- _collect_items_from_rel_paths ---
def test_collect_items_from_rel_paths_empty_returns_empty(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_a"
    proj.mkdir(parents=True)
    out = dh._collect_items_from_rel_paths(str(proj), [], "web_a")
    assert out == []


def test_collect_items_from_rel_paths_valid_path(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_b"
    proj.mkdir(parents=True)
    (proj / "d.json").write_text(json.dumps([{"i": 1}]), encoding="utf-8")
    out = dh._collect_items_from_rel_paths(str(proj), ["./d.json"], "web_b")
    assert out == [{"i": 1}]


# --- _load_from_main_json entity_type None ---
def test_load_from_main_json_entity_type_none_merges_all(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_c"
    proj.mkdir(parents=True)
    (proj / "main.json").write_text(json.dumps({"a": ["./a.json"], "b": ["./b.json"]}), encoding="utf-8")
    (proj / "a.json").write_text(json.dumps([{"ea": 1}]), encoding="utf-8")
    (proj / "b.json").write_text(json.dumps([{"eb": 1}]), encoding="utf-8")
    result = dh._load_from_main_json("web_c", entity_type=None)
    assert len(result) == 2
    assert {"ea": 1} in result and {"eb": 1} in result


# --- _load_first_file_only entity_type None ---
def test_load_first_file_only_entity_type_none(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_d"
    proj.mkdir(parents=True)
    (proj / "main.json").write_text(json.dumps({"x": ["./x1.json", "./x2.json"], "y": ["./y1.json"]}), encoding="utf-8")
    (proj / "x1.json").write_text(json.dumps([{"x": 1}]), encoding="utf-8")
    (proj / "x2.json").write_text(json.dumps([{"x": 2}]), encoding="utf-8")
    (proj / "y1.json").write_text(json.dumps([{"y": 1}]), encoding="utf-8")
    result = dh._load_first_file_only("web_d", entity_type=None)
    assert len(result) == 2
    assert {"x": 1} in result and {"y": 1} in result


# --- append_or_rollover_entity_data ---
def test_append_or_rollover_creates_new_file_when_no_entity_files(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_e"
    proj.mkdir(parents=True)
    (proj / "main.json").write_text(json.dumps({"logs": []}), encoding="utf-8")
    path = dh.append_or_rollover_entity_data("web_e", "logs", [{"e": 1}])
    assert Path(path).exists()
    assert "logs" in path and path.endswith(".json")


def test_append_or_rollover_appends_to_existing_small_file(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_f"
    proj.mkdir(parents=True)
    (proj / "main.json").write_text(json.dumps({"logs": ["./logs.json"]}), encoding="utf-8")
    (proj / "logs.json").write_text(json.dumps([{"old": 1}]), encoding="utf-8")
    path = dh.append_or_rollover_entity_data("web_f", "logs", [{"new": 2}])
    assert Path(path).exists()
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    assert data == [{"old": 1}, {"new": 2}]


def test_append_or_rollover_invalid_web_name_raises():
    with pytest.raises(ValueError, match="Invalid web_name"):
        dh.append_or_rollover_entity_data("bad/name", "logs", [])


# --- append_to_entity_data ---
def test_append_to_entity_data_creates_file_when_missing(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_g"
    proj.mkdir(parents=True)
    path = dh.append_to_entity_data("web_g", "items", [{"id": 1}])
    assert Path(path).exists()
    assert json.loads(Path(path).read_text(encoding="utf-8")) == [{"id": 1}]


def test_append_to_entity_data_appends_to_existing(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_h"
    proj.mkdir(parents=True)
    (proj / "items.json").write_text(json.dumps([{"a": 1}]), encoding="utf-8")
    path = dh.append_to_entity_data("web_h", "items", [{"b": 2}])
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    assert data == [{"a": 1}, {"b": 2}]


def test_append_to_entity_data_updates_main_json(patch_base_path):
    base = Path(patch_base_path)
    proj = base / "web_i"
    proj.mkdir(parents=True)
    dh.append_to_entity_data("web_i", "entities", [{"x": 1}])
    main = json.loads((proj / "main.json").read_text(encoding="utf-8"))
    assert main.get("entities") == ["./entities.json"]


def test_append_to_entity_data_invalid_web_name_raises():
    with pytest.raises(ValueError, match="Invalid web_name"):
        dh.append_to_entity_data("invalid name", "e", [])
