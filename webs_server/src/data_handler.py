import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

# Base path inside the container for persistent data storage (mounted volume)
BASE_PATH = os.getenv("DATA_BASE_PATH", "/app/data")
MAX_FILE_SIZE_BYTES = int(os.getenv("DATA_FILE_MAX_BYTES", "2097152"))  # 2 MiB default

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
    try:
        if HAS_FILELOCK:
            lock = FileLock(path + ".lock")
            with lock:
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
        else:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
    except FileNotFoundError as e:
        raise IOError(f"Directory does not exist for path: {path}") from e
    except PermissionError as e:
        raise IOError(f"Permission denied writing file: {path}") from e
    except OSError as e:
        raise IOError(f"OS error while writing file: {path}: {e}") from e


def _load_json(path: str) -> Any:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return None
    except json.JSONDecodeError:
        return None
    except Exception:
        return None


def _get_rel_and_abs(web_name: str, rel_path: str) -> str:
    normalized_rel = rel_path.lstrip("./")
    return f"{BASE_PATH}/{web_name}/{normalized_rel}"


def _ensure_dir(path: str) -> None:
    try:
        os.makedirs(path, exist_ok=True)
    except PermissionError as e:
        raise IOError(f"Permission denied creating directory: {path}") from e
    except OSError as e:
        raise IOError(f"OS error while creating directory: {path}: {e}") from e


def save_data_file(web_name: str, filename: str, data: List[Dict[str, Any]], entity_type: str) -> str:
    """
    Save a payload list into a data file and update main.json index for the given entity_type.
    Returns the absolute file path to the saved file.
    """
    _ensure_dir(get_data_dir(web_name))
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


def append_or_rollover_entity_data(web_name: str, entity_type: str, data: List[Dict[str, Any]]) -> str:
    """
    Append data to the most recent file for an entity. If appending would exceed the
    size limit, roll over to a new file and write the new data there.
    Returns the absolute path where data was written.
    """
    if not isinstance(data, list):
        raise ValueError("Data must be a list of JSON-serializable objects")

    # Ensure target directory exists
    data_dir = get_data_dir(web_name)
    _ensure_dir(data_dir)

    # Load or initialize main index
    main_path = get_main_path(web_name)
    main: Dict[str, Any] = {}
    if os.path.exists(main_path):
        try:
            with open(main_path, "r", encoding="utf-8") as f:
                loaded = json.load(f)
                main = loaded if isinstance(loaded, dict) else {}
        except Exception:
            # Corrupted index: reset to keep system operational
            main = {}

    entity_files: List[str] = main.setdefault(entity_type, [])
    current_rel: Optional[str] = entity_files[-1] if entity_files else None
    current_abs: Optional[str] = _get_rel_and_abs(web_name, current_rel) if current_rel else None

    def _serialize(items: List[Dict[str, Any]]) -> bytes:
        try:
            return json.dumps(items, ensure_ascii=False, indent=2).encode("utf-8")
        except Exception as e:
            raise ValueError(f"Failed to serialize data to JSON: {e}") from e

    # Try to append to current file if exists and is a list
    if current_abs and os.path.exists(current_abs):
        existing = _load_json(current_abs)
        if isinstance(existing, list):
            # Compute prospective size after append
            combined = existing + data
            prospective_size = len(_serialize(combined))
            if prospective_size <= MAX_FILE_SIZE_BYTES:
                _safe_write(current_abs, combined)
                return current_abs
        # Fallthrough: need to roll over

    # Create a new file (first file for entity or rollover)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{entity_type}_{timestamp}.json"
    abs_path = f"{data_dir}/{filename}"
    rel_path = f"./data/{filename}"

    # Write only the new data into new file
    payload_size = len(_serialize(data))
    if payload_size > MAX_FILE_SIZE_BYTES:
        # If a single batch exceeds limit, still write it to its own file to avoid data loss
        # This is logged by callers as needed.
        pass

    _safe_write(abs_path, data)

    # Update index
    if rel_path not in entity_files:
        entity_files.append(rel_path)
    _safe_write(main_path, main)

    return abs_path

