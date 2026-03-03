"""
File-based data storage handler for webs_server.
Manages reading/writing JSON data files under /app/data.

Flat layout: entity files (e.g. {entity_type}_1.json) live next to main.json
under {BASE_PATH}/{web_name}/ (no data/ subdirectory).
- Original data: first file per entity, e.g. {entity_type}_1.json.
- Full pool: all files for that entity listed in main.json.
- v2 disabled or seed=1 → load original only (first file).
- v2 enabled and 1 < seed <= 999 → load full pool and apply seeded selection (reproducible).

Debug: set log level to DEBUG (e.g. LOG_LEVEL=DEBUG or loguru level=DEBUG) to see
detailed flow (paths, file counts, load/save branches) from this module.
"""

import os
import re
import json
import fcntl
from datetime import datetime
from typing import Dict, Any, List, Optional
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


def get_main_path(web_name: str) -> str:
    """Return path to main.json for a given web_name."""
    path = f"{BASE_PATH}/{web_name}/main.json"
    logger.debug("get_main_path", extra={"web_name": web_name, "path": path})
    return path


def get_data_dir(web_name: str) -> str:
    """Return path to project directory for a given web_name (flat layout: no data/ subdir)."""
    path = f"{BASE_PATH}/{web_name}"
    logger.debug("get_data_dir", extra={"web_name": web_name, "path": path})
    return path


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
    if not filename or ".." in filename or os.path.sep in filename:
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


def _ensure_dir(path: str) -> None:
    """Ensure directory exists, creating it if necessary."""
    try:
        existed = os.path.isdir(path)
        os.makedirs(path, exist_ok=True)
        logger.debug("_ensure_dir", extra={"path": path, "created": not existed})
    except OSError as e:
        logger.error("_ensure_dir failed", extra={"path": path, "error": str(e)})
        raise IOError(f"OS error while creating directory: {path}: {e}") from e


def _parse_json_file_to_items(file_path: str) -> Optional[List[Dict[str, Any]]]:
    """
    Read a JSON file and return a list of items (handles both array and single object).
    Returns None if file is missing, empty, or invalid.
    """
    if not os.path.exists(file_path):
        logger.debug("_parse_json_file_to_items: file missing", extra={"path": file_path})
        return None
    try:
        if os.path.getsize(file_path) == 0:
            logger.warning("JSON file is empty", extra={"path": file_path})
            return None
        with open(file_path, "r", encoding="utf-8") as f:
            contents = json.load(f)
        if isinstance(contents, list):
            logger.debug("_parse_json_file_to_items: loaded list", extra={"path": file_path, "count": len(contents)})
            return contents
        if isinstance(contents, dict):
            logger.debug("_parse_json_file_to_items: loaded single dict as list", extra={"path": file_path, "count": 1})
            return [contents]
        logger.debug("_parse_json_file_to_items: unexpected type", extra={"path": file_path, "type": type(contents).__name__})
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in file {file_path}: {e}")
        return None
    except Exception as e:
        logger.error(f"Error reading file {file_path}: {e}")
        return None


def _load_first_file_only(web_name: str, entity_type: Optional[str]) -> List[Dict[str, Any]]:
    """
    Load only the first file for the entity from the project directory (original data).
    Used when v2 is disabled or seed=1. Flat layout: files next to main.json.
    """
    data_dir = get_data_dir(web_name)
    if entity_type:
        first_file = f"{data_dir}/{entity_type}_1.json"
        logger.debug(
            "_load_first_file_only: single entity",
            extra={"web_name": web_name, "entity_type": entity_type, "first_file": first_file, "exists": os.path.exists(first_file)},
        )
        items = _parse_json_file_to_items(first_file)
        result = items if items is not None else []
        logger.debug("_load_first_file_only: result", extra={"entity_type": entity_type, "count": len(result)})
        return result
    # No entity_type: load first file of each entity from main.json (first path per entity)
    main_path = get_main_path(web_name)
    if not os.path.exists(main_path):
        logger.debug("_load_first_file_only: no main.json", extra={"web_name": web_name, "main_path": main_path})
        return []
    try:
        with open(main_path, "r", encoding="utf-8") as f:
            main = json.load(f)
    except Exception as e:
        logger.debug("_load_first_file_only: failed to read main", extra={"web_name": web_name, "error": str(e)})
        return []
    if not isinstance(main, dict):
        logger.debug("_load_first_file_only: main is not dict", extra={"web_name": web_name})
        return []
    all_data: List[Dict[str, Any]] = []
    for entity_key, paths in main.items():
        if not isinstance(paths, list) or not paths:
            logger.debug("_load_first_file_only: skip non-list or empty", extra={"entity_key": entity_key})
            continue
        first_rel = paths[0].lstrip("./")
        abs_path = f"{BASE_PATH}/{web_name}/{first_rel}"
        logger.debug("_load_first_file_only: loading first file", extra={"entity_key": entity_key, "abs_path": abs_path})
        items = _parse_json_file_to_items(abs_path)
        if items is not None:
            all_data.extend(items)
            logger.debug("_load_first_file_only: added items", extra={"entity_key": entity_key, "added": len(items), "total_so_far": len(all_data)})
    logger.debug("_load_first_file_only: total loaded", extra={"web_name": web_name, "total_count": len(all_data)})
    return all_data


def save_data_file(web_name: str, filename: str, data: List[Dict[str, Any]], entity_type: str) -> str:
    """
    Save data to a single file under {BASE_PATH}/{web_name}/{filename}.
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

    data_dir = get_data_dir(web_name)
    _ensure_dir(data_dir)

    file_path = f"{data_dir}/{filename}"
    logger.debug(
        "save_data_file: writing",
        extra={"web_name": web_name, "filename": filename, "entity_type": entity_type, "item_count": len(data), "file_path": file_path},
    )

    # Write data atomically
    temp_path = f"{file_path}.tmp"
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
        os.replace(temp_path, file_path)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    # Update main.json to reference this file
    main_path = get_main_path(web_name)
    _ensure_dir(os.path.dirname(main_path))

    # Read existing main.json or create new
    if os.path.exists(main_path):
        with open(main_path, "r", encoding="utf-8") as f:
            main = json.load(f)
    else:
        main = {}

    # Add file reference under entity_type
    relative_path = f"./{filename}"
    if entity_type not in main:
        main[entity_type] = []

    if relative_path not in main[entity_type]:
        main[entity_type].append(relative_path)

    # Save updated main.json
    with open(main_path, "w", encoding="utf-8") as f:
        json.dump(main, f, indent=2, ensure_ascii=False)

    logger.debug("save_data_file: done", extra={"web_name": web_name, "file_path": file_path})
    return file_path


def load_all_data(
    web_name: str,
    entity_type: Optional[str] = None,
    *,
    seed_value: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """
    Load data from the project directory (flat layout) for the given web_name.

    - When v2 is disabled or seed=1: return original data only (first file per entity:
      {entity_type}_1.json). Same data every time.
    - When v2 is enabled and 1 < seed <= 999: load the full pool (all files
      referenced in main.json), then the caller applies seeded selection for reproducible
      picks (same seed => same selection).
    """
    _validate_safe_segment(web_name, "web_name")
    if entity_type is not None:
        _validate_safe_segment(entity_type, "entity_type")

    # Check if V2 DB mode is disabled - if so, load from original/ directory
    # v2_disabled is True when ENABLE_DYNAMIC_V2 is "false", "0", "no", or "off"
    v2_disabled_env_flag = os.getenv("ENABLE_DYNAMIC_V2", "false").lower() in {"false", "0", "no", "off"}
    use_original_only = v2_disabled_env_flag or (seed_value == 1)

    logger.info(
        "Loading data",
        extra={
            "web_name": web_name,
            "entity_type": entity_type,
            "base_path": BASE_PATH,
            "use_original_only": use_original_only,
            "seed_value": seed_value,
        },
    )

    if use_original_only:
        result = _load_first_file_only(web_name, entity_type)
        logger.debug("load_all_data: branch=first_file_only", extra={"web_name": web_name, "entity_type": entity_type, "count": len(result)})
        return result
    result = _load_from_main_json(web_name, entity_type)
    logger.debug("load_all_data: branch=main_json", extra={"web_name": web_name, "entity_type": entity_type, "count": len(result)})
    return result


def _load_from_main_json(web_name: str, entity_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Helper function to load data from main.json (used when V2 is enabled or as fallback).
    """
    _validate_safe_segment(web_name, "web_name")
    if entity_type is not None:
        _validate_safe_segment(entity_type, "entity_type")
    main_path = get_main_path(web_name)
    if not os.path.exists(main_path):
        logger.warning("main.json missing for web", extra={"web_name": web_name, "path": main_path})
        return []

    try:
        with open(main_path, "r", encoding="utf-8") as f:
            main = json.load(f)
    except Exception as exc:
        logger.error("Failed to read main.json", extra={"web_name": web_name, "path": main_path, "error": str(exc)})
        return []

    all_data: List[Dict[str, Any]] = []
    # Build list of relative paths depending on entity filter
    if isinstance(main, dict):
        if entity_type:
            rel_paths = main.get(entity_type) or []
            logger.debug("_load_from_main_json: entity filter", extra={"web_name": web_name, "entity_type": entity_type, "rel_paths": rel_paths})
        else:
            # Merge all entity lists
            rel_paths = []
            for key, value in main.items():
                if isinstance(value, list):
                    rel_paths.extend(value)
            logger.debug("_load_from_main_json: all entities", extra={"web_name": web_name, "main_keys": list(main.keys()), "rel_paths_count": len(rel_paths)})
    else:
        rel_paths = []
        logger.debug("_load_from_main_json: main is not dict", extra={"web_name": web_name})

    web_base = f"{BASE_PATH}/{web_name}"
    for rel_path in rel_paths:
        normalized_rel = rel_path.lstrip("./")
        abs_path = _resolve_path_under_base(web_base, normalized_rel)
        if abs_path is None or not os.path.exists(abs_path):
            if abs_path is None:
                logger.warning("Referenced path outside base", extra={"rel_path": rel_path, "web_name": web_name})
            else:
                logger.warning("Referenced data file missing", extra={"path": abs_path, "rel_path": rel_path, "web_name": web_name})
            continue
        items = _parse_json_file_to_items(abs_path)
        if items is not None:
            all_data.extend(items)
            logger.debug(
                "_load_from_main_json: file loaded",
                extra={"rel_path": rel_path, "abs_path": abs_path, "items_added": len(items), "total_after": len(all_data)},
            )

    logger.debug("_load_from_main_json: total", extra={"web_name": web_name, "entity_type": entity_type, "total_count": len(all_data)})
    return all_data


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

    main_path = get_main_path(web_name)

    # Load or create main.json
    if os.path.exists(main_path):
        with open(main_path, "r", encoding="utf-8") as f:
            main = json.load(f)
    else:
        main = {}

    # Get existing files for this entity
    entity_files = main.get(entity_type, [])
    logger.debug(
        "append_or_rollover_entity_data: state",
        extra={"web_name": web_name, "entity_type": entity_type, "entity_files_count": len(entity_files), "data_count": len(data)},
    )

    # Determine if we append to existing or create new
    should_create_new = True
    last_file_rel: Optional[str] = None
    web_base = f"{BASE_PATH}/{web_name}"

    if entity_files:
        # Get the last file; resolve path safely to prevent path traversal
        last_file_rel = entity_files[-1].lstrip("./")
        last_file_abs = _resolve_path_under_base(web_base, last_file_rel)

        if last_file_abs and os.path.exists(last_file_abs):
            # Check file size
            file_size = os.path.getsize(last_file_abs)
            estimated_new_size = file_size + len(json.dumps(data))

            if estimated_new_size < DATA_FILE_MAX_BYTES:
                # Append to existing file
                should_create_new = False
                target_file = last_file_abs
                logger.debug(
                    "append_or_rollover_entity_data: will append",
                    extra={"target_file": target_file, "file_size": file_size, "estimated_new_size": estimated_new_size},
                )
            else:
                logger.debug(
                    "append_or_rollover_entity_data: rollover (size)",
                    extra={"last_file_abs": last_file_abs, "file_size": file_size, "estimated_new_size": estimated_new_size, "max_bytes": DATA_FILE_MAX_BYTES},
                )
        else:
            logger.debug("append_or_rollover_entity_data: last file missing, will create new", extra={"last_file_abs": last_file_abs})
    else:
        logger.debug("append_or_rollover_entity_data: no entity files yet, will create new", extra={"web_name": web_name, "entity_type": entity_type})

    if should_create_new:
        # Create new file with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{entity_type}_{timestamp}.json"
        out_path = save_data_file(web_name, filename, data, entity_type)
        logger.debug("append_or_rollover_entity_data: created new file", extra={"web_name": web_name, "entity_type": entity_type, "path": out_path})
        return out_path
    else:
        # Append to existing file; path is sanitized by _resolve_path_under_base (under web_base only)
        safe_path = _resolve_path_under_base(web_base, last_file_rel or "")
        if not safe_path:
            raise ValueError("Resolved path is not under base")
        with open(safe_path, "r", encoding="utf-8") as f:  # NOSONAR (S2083) path from _resolve_path_under_base
            existing_data = json.load(f)

        if isinstance(existing_data, list):
            existing_data.extend(data)
        else:
            # If not a list, convert to list
            existing_data = [existing_data] + data

        # Write back
        with open(safe_path, "w", encoding="utf-8") as f:  # NOSONAR (S2083) path from _resolve_path_under_base
            json.dump(existing_data, f, indent=2, ensure_ascii=False)

        logger.debug(
            "append_or_rollover_entity_data: appended to existing",
            extra={"target_file": target_file, "appended_count": len(data), "total_count": len(existing_data)},
        )
        return target_file


def append_to_entity_data(web_name: str, entity_type: str, data: List[Dict[str, Any]]) -> str:
    """
    Append data to the FIRST file for this entity (e.g., {entity_type}_1.json).
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

    # Target file is always {entity_type}_1.json
    data_dir = get_data_dir(web_name)
    _ensure_dir(data_dir)

    filename = f"{entity_type}_1.json"
    file_path = f"{data_dir}/{filename}"
    logger.debug(
        "append_to_entity_data: start",
        extra={"web_name": web_name, "entity_type": entity_type, "file_path": file_path, "data_count": len(data)},
    )

    # Read existing data if file exists
    existing_data = []
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
                if not isinstance(existing_data, list):
                    existing_data = [existing_data]
            logger.debug("append_to_entity_data: read existing", extra={"file_path": file_path, "existing_count": len(existing_data)})
        except Exception as e:
            logger.warning("append_to_entity_data: could not read existing file", extra={"file_path": file_path, "error": str(e)})
            existing_data = []
    else:
        logger.debug("append_to_entity_data: file does not exist, will create", extra={"file_path": file_path})

    # Append new data
    combined_data = existing_data + data

    # Write combined data
    temp_path = f"{file_path}.tmp"
    try:
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(combined_data, f, indent=2, ensure_ascii=False)
        os.replace(temp_path, file_path)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    # Update main.json to reference this file (if not already)
    main_path = get_main_path(web_name)
    _ensure_dir(os.path.dirname(main_path))

    if os.path.exists(main_path):
        with open(main_path, "r", encoding="utf-8") as f:
            main = json.load(f)
    else:
        main = {}

    relative_path = f"./{filename}"
    if entity_type not in main:
        main[entity_type] = []

    if relative_path not in main[entity_type]:
        main[entity_type].append(relative_path)

    with open(main_path, "w", encoding="utf-8") as f:
        json.dump(main, f, indent=2, ensure_ascii=False)

    logger.info(
        "append_to_entity_data: done",
        extra={"file_path": file_path, "appended": len(data), "total": len(combined_data)},
    )
    return file_path
