import json
import os
from typing import List, Dict, Any, Optional

# Base path inside the container for persistent data storage (mounted volume)
BASE_PATH = os.getenv("DATA_BASE_PATH", "/app/data")

try:
    from filelock import FileLock  # Optional locking to avoid concurrent write races

    HAS_FILELOCK = True
except Exception:
    HAS_FILELOCK = False


def get_data_dir(web_name: str) -> str:
    return f"{BASE_PATH}/{web_name}/data"


def get_main_path(web_name: str) -> str:
    return f"{BASE_PATH}/{web_name}/main.json"


def _safe_write(path: str, data: Any) -> None:
    """
    Write JSON to path with optional file lock to avoid concurrent write corruption.
    """
    if HAS_FILELOCK:
        lock = FileLock(path + ".lock")
        with lock:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
    else:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)


def save_data_file(web_name: str, filename: str, data: List[Dict[str, Any]], entity_type: str) -> str:
    """
    Save a payload list into a data file and update main.json index for the given entity_type.
    Returns the absolute file path to the saved file.
    """
    os.makedirs(get_data_dir(web_name), exist_ok=True)
    file_path = f"{get_data_dir(web_name)}/{filename}"

    # Write the actual data
    _safe_write(file_path, data)

    # Update main.json with reference
    main_path = get_main_path(web_name)
    main: Dict[str, Any] = {}
    if os.path.exists(main_path):
        try:
            with open(main_path, "r", encoding="utf-8") as f:
                main = json.load(f)
            if not isinstance(main, dict):
                main = {}
        except Exception:
            # If corrupted, reset to a new index to avoid blocking writes
            main = {}

    rel_path = f"./data/{filename}"
    if rel_path not in main.setdefault(entity_type, []):
        main[entity_type].append(rel_path)

    _safe_write(main_path, main)
    return file_path


def load_all_data(web_name: str, entity_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Load and return all JSON objects referenced in main.json for a given web_name.
    If entity_type is provided, only load files listed under that entity key.
    """
    main_path = get_main_path(web_name)
    if not os.path.exists(main_path):
        return []

    try:
        with open(main_path, "r", encoding="utf-8") as f:
            main = json.load(f)
    except Exception:
        return []

    all_data: List[Dict[str, Any]] = []
    # Build list of relative paths depending on entity filter
    if isinstance(main, dict):
        if entity_type:
            rel_paths = main.get(entity_type) or []
        else:
            # Merge all entity lists
            rel_paths = []
            for value in main.values():
                if isinstance(value, list):
                    rel_paths.extend(value)
    else:
        rel_paths = []

    for rel_path in rel_paths:
        # Normalize leading ./ if present
        normalized_rel = rel_path.lstrip("./")
        abs_path = f"{BASE_PATH}/{web_name}/{normalized_rel}"
        if os.path.exists(abs_path):
            try:
                with open(abs_path, "r", encoding="utf-8") as f:
                    contents = json.load(f)
                    if isinstance(contents, list):
                        all_data.extend(contents)
                    elif isinstance(contents, dict):
                        all_data.append(contents)
            except Exception as e:
                print(f"Error reading file {abs_path}: {e}")
                # Skip unreadable or malformed file
                continue

    return all_data


