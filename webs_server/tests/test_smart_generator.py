"""
Unit tests for smart_generator: load_example_data, infer_typescript_interface,
build_generation_prompt_from_examples, get_project_entity_metadata.
"""

import json
from pathlib import Path

import pytest

# Import after conftest adds src to path; smart_generator lives under generators
from generators import smart_generator as sg


# --- infer_typescript_interface ---
def test_infer_typescript_interface_empty_examples():
    out = sg.infer_typescript_interface([], "Item")
    assert "interface Item" in out
    assert "[key: string]: any" in out


def test_infer_typescript_interface_simple():
    examples = [{"id": 1, "name": "a"}, {"id": 2, "title": "b"}]
    out = sg.infer_typescript_interface(examples, "Product")
    assert "interface Product" in out
    assert "id" in out
    assert "name" in out
    assert "title" in out
    assert "number" in out
    assert "string" in out


def test_infer_typescript_interface_types():
    examples = [
        {"b": True, "n": 42, "f": 3.14, "s": "x", "arr": [], "obj": {}},
    ]
    out = sg.infer_typescript_interface(examples, "T")
    assert "boolean" in out
    assert "number" in out
    assert "string" in out
    assert "any[]" in out
    assert "object" in out


def test_infer_typescript_interface_optional_key():
    examples = [{"a": 1}, {"a": 2, "b": 3}]
    out = sg.infer_typescript_interface(examples, "T")
    assert "b?" in out or "b ?" in out


# --- load_example_data ---
def test_load_example_data_success(tmp_path, monkeypatch):
    monkeypatch.setattr(sg, "BASE_DATA_PATH", tmp_path)
    proj = tmp_path / "web_5_autocrm"
    proj.mkdir(parents=True)
    data = [{"id": 1, "name": "Client A"}, {"id": 2, "name": "Client B"}]
    (proj / "clients.json").write_text(json.dumps(data), encoding="utf-8")
    out = sg.load_example_data("web_5_autocrm", "clients", max_examples=1)
    assert len(out) == 1
    assert out[0]["name"] == "Client B"


def test_load_example_data_file_not_found(monkeypatch):
    monkeypatch.setattr(sg, "BASE_DATA_PATH", Path("/nonexistent"))
    with pytest.raises(FileNotFoundError, match="No example data found"):
        sg.load_example_data("web_5_autocrm", "clients")


def test_load_example_data_not_list_raises(tmp_path, monkeypatch):
    monkeypatch.setattr(sg, "BASE_DATA_PATH", tmp_path)
    proj = tmp_path / "web_5_autocrm"
    proj.mkdir(parents=True)
    (proj / "clients.json").write_text('{"single": "object"}', encoding="utf-8")
    with pytest.raises(ValueError, match="Expected list"):
        sg.load_example_data("web_5_autocrm", "clients")


def test_load_example_data_empty_list_raises(tmp_path, monkeypatch):
    monkeypatch.setattr(sg, "BASE_DATA_PATH", tmp_path)
    proj = tmp_path / "web_5_autocrm"
    proj.mkdir(parents=True)
    (proj / "clients.json").write_text("[]", encoding="utf-8")
    with pytest.raises(ValueError, match="No examples found"):
        sg.load_example_data("web_5_autocrm", "clients")


# --- build_generation_prompt_from_examples ---
def test_build_generation_prompt_from_examples(tmp_path, monkeypatch):
    monkeypatch.setattr(sg, "BASE_DATA_PATH", tmp_path)
    proj = tmp_path / "web_5_autocrm"
    proj.mkdir(parents=True)
    (proj / "clients.json").write_text(
        json.dumps([{"id": 1, "name": "A"}, {"id": 2, "name": "B"}]),
        encoding="utf-8",
    )
    interface_def, examples = sg.build_generation_prompt_from_examples("web_5_autocrm", "clients")
    assert "interface" in interface_def
    assert "Client" in interface_def
    assert len(examples) <= 3


# --- get_project_entity_metadata ---
def test_get_project_entity_metadata_known():
    meta = sg.get_project_entity_metadata("web_1_autocinema", "movies")
    assert "description" in meta
    assert "categories" in meta
    assert "requirements" in meta
    assert "Movie" in meta["description"] or "movie" in meta["description"].lower()


def test_get_project_entity_metadata_unknown_returns_default():
    meta = sg.get_project_entity_metadata("unknown_project", "unknown_entity")
    assert "description" in meta
    assert meta["description"] == "unknown_entity for unknown_project" or "unknown" in meta["description"].lower()
