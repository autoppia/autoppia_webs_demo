"""
File-based data storage handler for webs_server.
Manages reading/writing JSON data files under BASE_DATA_PATH (default /app/data).
Data is usually read-only (baked into the image via COPY); any writes are ephemeral (lost on container restart).

Path layout (flat per project):
  {BASE_PATH}/{web_name}/
    main.json              # Index: { "entity_type": ["./file.json", ...] }
    {entity}.json          # Data files (e.g. movies.json, restaurants.json)
    {entity}_{timestamp}.json   # Optional rollover files
  All paths in main.json are relative to the project dir (e.g. "./movies.json").
"""

import os
import re
import json
import fcntl
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from loguru import logger

try:
    from filelock import FileLock

    HAS_FILELOCK = True
except ImportError:
    HAS_FILELOCK = False

# Base path for file storage (inside container)
BASE_PATH = os.getenv("BASE_DATA_PATH", "/app/data")

# Maximum size for a single data file (10 MB)
DATA_FILE_MAX_BYTES = int(os.getenv("DATA_FILE_MAX_BYTES", 10 * 1024 * 1024))

_MSG_PATH_OUTSIDE_BASE = "Project path outside base"


def get_main_path(web_name: str) -> str:
    """Return path to main.json for a given web_name."""
    return f"{BASE_PATH}/{web_name}/main.json"


def get_data_dir(web_name: str) -> str:
    """Return path to project directory for a given web_name (flat layout: data files live here)."""
    return f"{BASE_PATH}/{web_name}"


def get_allowed_project_keys() -> List[str]:
    """
    Return project keys (directory names under BASE_PATH) that match the safe segment pattern.
    Used so path operations use allowlisted values rather than raw user input (security/taint).
    """
    if not os.path.isdir(BASE_PATH):
        return []
    return [d for d in os.listdir(BASE_PATH) if os.path.isdir(os.path.join(BASE_PATH, d)) and _SAFE_SEGMENT_RE.match(d)]


# Safe path segment: alphanumeric, underscore, hyphen (e.g. web_4_autodining, restaurants)
_SAFE_SEGMENT_RE = re.compile(r"^[a-zA-Z0-9_-]+$")
# Safe filename: alphanumeric, underscore, hyphen, dot (e.g. logs_20250117.json)
_SAFE_FILENAME_RE = re.compile(r"^[a-zA-Z0-9_.-]+$")


def _validate_safe_segment(value: str, name: str = "value") -> None:
    """Raise ValueError if value is not a safe path segment (prevents path traversal)."""
    if not value or not _SAFE_SEGMENT_RE.match(value):
        raise ValueError(f"Invalid {name}: only alphanumeric, underscore, hyphen allowed")


def _validate_safe_filename(filename: str) -> None:
    """Raise ValueError if filename is not safe (no path separators or traversal)."""
    if not filename or ".." in filename or "/" in filename or "\\" in filename:
        raise ValueError("Invalid filename: path separators or '..' not allowed")
    if not _SAFE_FILENAME_RE.match(filename):
        raise ValueError("Invalid filename: only alphanumeric, underscore, hyphen, dot allowed")


def _resolve_path_under_base(base_dir: str, relative_path: str) -> Optional[str]:
    """
    Return absolute path if relative_path resolves under base_dir; else None.
    Prevents path traversal when building paths from untrusted data (e.g. main.json).
    """
    try:
        base_real = os.path.realpath(base_dir)
        combined = os.path.normpath(os.path.join(base_dir, relative_path))
        combined_real = os.path.realpath(combined)
        if os.path.commonpath([base_real, combined_real]) != base_real:
            return None
        return combined_real
    except (ValueError, OSError):
        return None


def _path_for_io_under_base(path: str) -> str:
    """
    Return path only when it resolves under BASE_PATH (constant). Use this result for open()/exists()
    so CodeQL path-injection sees validation against a constant base.
    """
    base_real = os.path.realpath(BASE_PATH)
    path_real = os.path.realpath(path)
    if os.path.commonpath([base_real, path_real]) != base_real:
        raise ValueError(_MSG_PATH_OUTSIDE_BASE)
    return path_real


def _safe_remove_temp_for_io(validated_io_path: str) -> None:
    """
    Safely remove "<validated_io_path>.tmp" only when it resolves under BASE_PATH.
    This keeps cleanup paths constrained to the same trusted base used for file I/O.
    """
    try:
        temp_io = _path_for_io_under_base(f"{validated_io_path}.tmp")
    except ValueError:
        return
    if os.path.exists(temp_io):
        os.remove(temp_io)


def _get_validated_main_io_path(web_name: str) -> Optional[Tuple[str, str]]:
    """
    Resolve main.json path only from allowlisted project keys (not from web_name in path).
    Path is built from BASE_PATH + allowlist entry so CodeQL does not see user input in path.
    """
    _validate_safe_segment(web_name, "web_name")
    allowed = get_allowed_project_keys()
    if web_name not in allowed:
        return None
    for main_dir in allowed:
        if main_dir == web_name:
            main_path = os.path.join(BASE_PATH, main_dir, "main.json")
            try:
                main_io = _path_for_io_under_base(main_path)
            except ValueError:
                return None
            web_base = os.path.dirname(main_path)
            return (web_base, main_io)
    return None


def _get_validated_path_under_base(web_base: str, rel_path: str) -> Optional[str]:
    """
    Return path safe for I/O only when it matches a file under web_base (from listdir).
    Path is built from filesystem list, not from rel_path, so CodeQL does not see user input in path.
    """
    normalized_rel = rel_path.lstrip("./")
    resolved = _resolve_path_under_base(web_base, normalized_rel)
    if resolved is None:
        return None
    try:
        target_norm = os.path.normpath(resolved)
    except ValueError:
        return None
    if not os.path.isdir(web_base):
        return None
    for name in os.listdir(web_base):
        path_from_base = os.path.join(web_base, name)
        if os.path.isfile(path_from_base) and os.path.normpath(path_from_base) == target_norm:
            try:
                return _path_for_io_under_base(path_from_base)
            except ValueError:
                return None
    return None


def _ensure_dir(path: str) -> None:
    """Ensure directory exists, creating it if necessary."""
    try:
        os.makedirs(path, exist_ok=True)
    except OSError as e:
        raise IOError(f"OS error while creating directory: {path}: {e}") from e


def _parse_json_file_to_items(
    file_path: str,
    *,
    allowed_base: Optional[str] = None,
) -> Optional[List[Dict[str, Any]]]:
    """
    Read a JSON file and return a list of items (handles both array and single object).
    Returns None if file is missing, empty, or invalid.
    When allowed_base is set, file_path is resolved under that base; only the resolved
    path is used for I/O (prevents path traversal from tainted input).
    """
    if allowed_base is not None:
        try:
            rel = os.path.relpath(file_path, allowed_base)
        except ValueError:
            return None
        resolved = _resolve_path_under_base(allowed_base, rel)
        if resolved is None:
            return None
        try:
            path_to_use = _path_for_io_under_base(resolved)
        except ValueError:
            return None
    else:
        try:
            path_to_use = _path_for_io_under_base(file_path)
        except ValueError:
            return None
    if not os.path.exists(path_to_use):
        return None
    try:
        if os.path.getsize(path_to_use) == 0:
            logger.warning("JSON file is empty", extra={"path": path_to_use})
            return None
        with open(path_to_use, "r", encoding="utf-8") as f:
            contents = json.load(f)
        if isinstance(contents, list):
            return contents
        if isinstance(contents, dict):
            return [contents]
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in file {path_to_use}: {e}")
        return None
    except OSError as e:
        logger.error(f"Error reading file {path_to_use}: {e}")
        return None


def _load_json_file_with_fallback(
    primary_path: str,
    fallback_path: Optional[str],
    fallback_label: str = "data/",
) -> List[Dict[str, Any]]:
    """Try loading from primary path; on failure or empty, try fallback path. Returns combined list (one source only)."""
    items = _parse_json_file_to_items(primary_path)
    if items is not None:
        return items
    if fallback_path and os.path.exists(fallback_path):
        items = _parse_json_file_to_items(fallback_path)
        if items is not None:
            logger.info(f"Loaded data from fallback location: {fallback_path}")
            return items
        logger.warning(f"Fallback file also empty or invalid: {fallback_path}")
    else:
        logger.warning(f"File does not exist at primary path, trying fallback to {fallback_label}: {primary_path}")
    return []


def save_data_file(web_name: str, filename: str, data: List[Dict[str, Any]], entity_type: str) -> str:
    """
    Save data to a single file under {BASE_PATH}/{web_name}/{filename} (flat layout).
    Also updates main.json to reference this file under the entity_type key.

    Args:
        web_name: Project name (e.g., 'web_5_autocrm')
        filename: File name (e.g., 'logs_20250117.json')
        data: List of objects to save
        entity_type: Entity type (e.g., 'logs')

    Returns:
        Path to saved file
    """
    _validate_safe_segment(web_name, "web_name")
    _validate_safe_segment(entity_type, "entity_type")
    _validate_safe_filename(filename)

    data_dir = _resolve_path_under_base(BASE_PATH, web_name)
    if data_dir is None:
        raise ValueError(_MSG_PATH_OUTSIDE_BASE)
    file_path = _resolve_path_under_base(data_dir, filename)
    if file_path is None:
        raise ValueError("Resolved file path is not under project dir")
    file_io = _path_for_io_under_base(file_path)
    _ensure_dir(data_dir)

    # Write data atomically
    temp_path = _path_for_io_under_base(f"{file_io}.tmp")
    try:
        with open(temp_path, "w", encoding="utf-8") as f:
            if HAS_FILELOCK:
                lock = FileLock(f"{temp_path}.lock")
                with lock:
                    json.dump(data, f, indent=2, ensure_ascii=False)
            else:
                fcntl.flock(f.fileno(), fcntl.LOCK_EX)
                json.dump(data, f, indent=2, ensure_ascii=False)
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)

        # Atomic replace
        os.replace(temp_path, file_io)
    finally:
        _safe_remove_temp_for_io(file_io)

    # Update main.json to reference this file
    main_path = os.path.join(data_dir, "main.json")
    main_io = _path_for_io_under_base(main_path)
    _ensure_dir(os.path.dirname(main_io))

    # Read existing main.json or create new
    if os.path.exists(main_io):
        with open(main_io, "r", encoding="utf-8") as f:
            main = json.load(f)
    else:
        main = {}

    # Add file reference under entity_type (flat: paths are ./filename relative to project dir)
    relative_path = f"./{filename}"
    if entity_type not in main:
        main[entity_type] = []

    if relative_path not in main[entity_type]:
        main[entity_type].append(relative_path)

    # Save updated main.json
    with open(main_io, "w", encoding="utf-8") as f:
        json.dump(main, f, indent=2, ensure_ascii=False)

    return file_io


def load_all_data(
    web_name: str,
    entity_type: Optional[str] = None,
    *,
    seed_value: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """
    Load and return all JSON objects referenced in main.json for a given web_name.
    If entity_type is provided, only load files listed under that entity key.

    If V2 DB mode is disabled, loads only the first file per entity (original data).
    Otherwise, loads all files referenced in main.json (flat layout: paths under project dir).
    """
    _validate_safe_segment(web_name, "web_name")
    if entity_type is not None:
        _validate_safe_segment(entity_type, "entity_type")

    # When V2 disabled: load first file per entity only
    # v2_disabled is True when ENABLE_DYNAMIC_V2 is "false", "0", "no", or "off"
    v2_disabled_env_flag = os.getenv("ENABLE_DYNAMIC_V2", "false").lower() in {"false", "0", "no", "off"}
    force_seed_disabled = seed_value == 1
    v2_disabled = v2_disabled_env_flag or force_seed_disabled

    logger.info(
        "Loading data",
        extra={
            "web_name": web_name,
            "entity_type": entity_type,
            "base_path": BASE_PATH,
            "v2_disabled": v2_disabled,
            "seed_value": seed_value,
        },
    )

    if v2_disabled:
        result = _load_first_file_only(web_name, entity_type)
        logger.debug("load_all_data: branch=first_file_only", extra={"web_name": web_name, "entity_type": entity_type, "count": len(result)})
        return result
    result = _load_from_main_json(web_name, entity_type)
    logger.debug("load_all_data: branch=main_json", extra={"web_name": web_name, "entity_type": entity_type, "count": len(result)})
    return result


def _read_main_json_safe(
    web_name: str,
    *,
    allow_missing: bool = False,
) -> Tuple[Optional[str], Optional[str], Optional[Dict[str, Any]]]:
    """
    Resolve web_name/main.json under BASE_PATH, read it, return (web_base, main_io, main_dict).
    Returns (None, None, None) if path invalid or read error.
    When allow_missing=True, returns (web_base, main_io, {}) if file is missing; otherwise (None, None, None).
    Path used for I/O comes from _get_validated_main_io_path (CodeQL path-injection).
    """
    validated = _get_validated_main_io_path(web_name)
    if validated is None:
        logger.warning(_MSG_PATH_OUTSIDE_BASE, extra={"web_name": web_name})
        return (None, None, None)
    web_base, main_io = validated
    if not os.path.exists(main_io):
        if allow_missing:
            return (web_base, main_io, {})
        logger.warning("main.json missing for web", extra={"web_name": web_name, "path": main_io})
        return (None, None, None)
    try:
        with open(main_io, "r", encoding="utf-8") as f:
            main = json.load(f)
        return (web_base, main_io, main if isinstance(main, dict) else None)
    except (OSError, json.JSONDecodeError) as exc:
        logger.error("Failed to read main.json", extra={"web_name": web_name, "path": main_io, "error": str(exc)})
        return (None, None, None)


def _collect_items_from_rel_paths(
    web_base: str,
    rel_paths: List[str],
    web_name: str,
    log_prefix: str = "Referenced",
) -> List[Dict[str, Any]]:
    """Load and merge items from resolved paths under web_base; skip invalid or missing files.
    Path used for I/O comes from _get_validated_path_under_base (CodeQL path-injection).
    """
    all_data: List[Dict[str, Any]] = []
    for rel_path in rel_paths:
        path_io = _get_validated_path_under_base(web_base, rel_path)
        if path_io is None:
            logger.warning(f"{log_prefix} path outside base", extra={"rel_path": rel_path, "web_name": web_name})
            continue
        if not os.path.exists(path_io):
            logger.warning(f"{log_prefix} data file missing", extra={"path": path_io, "rel_path": rel_path, "web_name": web_name})
            continue
        items = _parse_json_file_to_items(path_io, allowed_base=web_base)
        if items is not None:
            all_data.extend(items)
    return all_data


def _load_from_main_json(web_name: str, entity_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Helper function to load data from main.json (used when V2 is enabled or as fallback).
    """
    _validate_safe_segment(web_name, "web_name")
    if entity_type is not None:
        _validate_safe_segment(entity_type, "entity_type")
    _web_base, _main_io, main = _read_main_json_safe(web_name)
    if _web_base is None or main is None:
        return []
    web_base = _web_base
    if entity_type:
        rel_paths = main.get(entity_type) or []
    else:
        rel_paths = []
        for value in main.values():
            if isinstance(value, list):
                rel_paths.extend(value)
    return _collect_items_from_rel_paths(web_base, rel_paths, web_name, "Referenced")


def _load_first_file_only(web_name: str, entity_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Load only the first file per entity from main.json (used when V2 is disabled or seed=1).
    Paths in main.json are relative to project dir (flat layout: ./entity.json, ./entity_timestamp.json).
    """
    _validate_safe_segment(web_name, "web_name")
    if entity_type is not None:
        _validate_safe_segment(entity_type, "entity_type")
    _web_base, _main_io, main = _read_main_json_safe(web_name)
    if _web_base is None or main is None:
        return []
    web_base = _web_base
    paths_to_load: List[str] = []
    if entity_type:
        rel_paths = main.get(entity_type) or []
        paths_to_load = [rel_paths[0]] if rel_paths else []
    else:
        for value in main.values():
            if isinstance(value, list) and value:
                paths_to_load.append(value[0])
    return _collect_items_from_rel_paths(web_base, paths_to_load, web_name, "First file")


def append_or_rollover_entity_data(web_name: str, entity_type: str, data: List[Dict[str, Any]]) -> str:
    """
    Append data to the latest file for this entity, or create a new file if:
    - No files exist yet
    - The latest file would exceed DATA_FILE_MAX_BYTES after appending

    Returns:
        Path to the file where data was saved
    """
    _validate_safe_segment(web_name, "web_name")
    _validate_safe_segment(entity_type, "entity_type")

    web_base, main_io, main = _read_main_json_safe(web_name, allow_missing=True)
    if web_base is None or main_io is None or main is None:
        raise ValueError(_MSG_PATH_OUTSIDE_BASE)

    # Get existing files for this entity
    entity_files = main.get(entity_type, [])

    # Determine if we append to existing or create new
    should_create_new = True
    last_file_rel: Optional[str] = None
    last_file_abs: Optional[str] = None

    if entity_files:
        # Get the last file; resolve path safely to prevent path traversal
        last_file_rel = entity_files[-1].lstrip("./")
        resolved_last = _resolve_path_under_base(web_base, last_file_rel)
        if resolved_last:
            try:
                last_file_abs = _path_for_io_under_base(resolved_last)
            except ValueError:
                last_file_abs = None
        else:
            last_file_abs = None

        if last_file_abs and os.path.exists(last_file_abs):
            # Check file size
            file_size = os.path.getsize(last_file_abs)
            estimated_new_size = file_size + len(json.dumps(data))

            if estimated_new_size < DATA_FILE_MAX_BYTES:
                # Append to existing file
                should_create_new = False

    if should_create_new:
        # Create new file with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{entity_type}_{timestamp}.json"
        return save_data_file(web_name, filename, data, entity_type)
    else:
        # Append to existing file; path is sanitized by _resolve_path_under_base (under web_base only)
        safe_path = _resolve_path_under_base(web_base, last_file_rel or "")
        if not safe_path:
            raise ValueError(_MSG_PATH_OUTSIDE_BASE)
        io_path = _path_for_io_under_base(safe_path)
        with open(io_path, "r", encoding="utf-8") as f:
            existing_data = json.load(f)

        if isinstance(existing_data, list):
            existing_data.extend(data)
        else:
            # If not a list, convert to list
            existing_data = [existing_data] + data

        # Write back
        with open(io_path, "w", encoding="utf-8") as f:
            json.dump(existing_data, f, indent=2, ensure_ascii=False)

        return io_path


def append_to_entity_data(web_name: str, entity_type: str, data: List[Dict[str, Any]]) -> str:
    """
    Append data to the FIRST file for this entity (e.g., {entity_type}.json).
    If the file doesn't exist, creates it.

    This is useful for appending to initial_data files.

    Args:
        web_name: Project name (e.g., 'web_4_autodining')
        entity_type: Entity type (e.g., 'restaurants')
        data: New data to append

    Returns:
        Path to the updated file
    """
    _validate_safe_segment(web_name, "web_name")
    _validate_safe_segment(entity_type, "entity_type")

    # Target file is always {entity_type}.json
    data_dir = _resolve_path_under_base(BASE_PATH, web_name)
    if data_dir is None:
        raise ValueError(_MSG_PATH_OUTSIDE_BASE)
    _ensure_dir(data_dir)
    filename = f"{entity_type}.json"
    file_path = _resolve_path_under_base(data_dir, filename)
    if file_path is None:
        raise ValueError("Resolved file path is not under project dir")
    file_io = _path_for_io_under_base(file_path)

    # Read existing data if file exists
    existing_data = []
    if os.path.exists(file_io):
        try:
            with open(file_io, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
                if not isinstance(existing_data, list):
                    existing_data = [existing_data]
        except OSError as e:
            logger.warning("Could not read existing file", extra={"path": file_io, "error": str(e)})
            existing_data = []

    # Append new data
    combined_data = existing_data + data

    # Write combined data
    temp_path = _path_for_io_under_base(f"{file_io}.tmp")
    try:
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(combined_data, f, indent=2, ensure_ascii=False)
        os.replace(temp_path, file_io)
    finally:
        _safe_remove_temp_for_io(file_io)

    # Update main.json to reference this file (if not already)
    main_path = os.path.join(data_dir, "main.json")
    main_io = _path_for_io_under_base(main_path)
    _ensure_dir(os.path.dirname(main_io))

    if os.path.exists(main_io):
        with open(main_io, "r", encoding="utf-8") as f:
            main = json.load(f)
    else:
        main = {}

    relative_path = f"./{filename}"
    if entity_type not in main:
        main[entity_type] = []

    if relative_path not in main[entity_type]:
        main[entity_type].append(relative_path)

    with open(main_io, "w", encoding="utf-8") as f:
        json.dump(main, f, indent=2, ensure_ascii=False)

    logger.info("Appended records to file", extra={"path": file_io, "appended": len(data), "total": len(combined_data)})
    return file_io
