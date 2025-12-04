"""
File-based data storage handler for webs_server.
Manages reading/writing JSON data files under /app/data.
"""

import os
import json
import fcntl
from datetime import datetime
from typing import Dict, Any, List, Optional

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
    return f"{BASE_PATH}/{web_name}/main.json"


def get_data_dir(web_name: str) -> str:
    """Return path to data directory for a given web_name."""
    return f"{BASE_PATH}/{web_name}/data"


def _ensure_dir(path: str) -> None:
    """Ensure directory exists, creating it if necessary."""
    try:
        os.makedirs(path, exist_ok=True)
    except OSError as e:
        raise IOError(f"OS error while creating directory: {path}: {e}") from e


def save_data_file(web_name: str, filename: str, data: List[Dict[str, Any]], entity_type: str) -> str:
    """
    Save data to a single file under {BASE_PATH}/{web_name}/data/{filename}.
    Also updates main.json to reference this file under the entity_type key.

    Args:
        web_name: Project name (e.g., 'web_5_autocrm')
        filename: File name (e.g., 'logs_20250117.json')
        data: List of objects to save
        entity_type: Entity type (e.g., 'logs')

    Returns:
        Path to saved file
    """
    data_dir = get_data_dir(web_name)
    _ensure_dir(data_dir)

    file_path = f"{data_dir}/{filename}"

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
    relative_path = f"./data/{filename}"
    if entity_type not in main:
        main[entity_type] = []

    if relative_path not in main[entity_type]:
        main[entity_type].append(relative_path)

    # Save updated main.json
    with open(main_path, "w", encoding="utf-8") as f:
        json.dump(main, f, indent=2, ensure_ascii=False)

    return file_path


def load_all_data(web_name: str, entity_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Load and return all JSON objects referenced in main.json for a given web_name.
    If entity_type is provided, only load files listed under that entity key.
    
    If V2 DB mode is disabled, loads from original/ directory directly (high quality, fewer records).
    Otherwise, loads from data/ directory as referenced in main.json.
    """
    # Check if V2 DB mode is disabled - if so, load from original/ directory
    # v2_disabled is True when ENABLE_DYNAMIC_V2_DB_MODE is "false", "0", "no", or "off"
    v2_disabled = os.getenv("ENABLE_DYNAMIC_V2_DB_MODE", "false").lower() in {"false", "0", "no", "off"}
    
    if v2_disabled:
        # V2 disabled: load from original/ directory (high quality dataset)
        original_dir = f"{BASE_PATH}/{web_name}/original"
        if not os.path.exists(original_dir):
            # Fallback to main.json if original/ doesn't exist
            return _load_from_main_json(web_name, entity_type)
        
        all_data: List[Dict[str, Any]] = []
        # Load all JSON files from original/ directory
        if entity_type:
            # Load specific entity type
            original_file = f"{original_dir}/{entity_type}_1.json"
            if os.path.exists(original_file):
                try:
                    with open(original_file, "r", encoding="utf-8") as f:
                        contents = json.load(f)
                        if isinstance(contents, list):
                            all_data.extend(contents)
                        elif isinstance(contents, dict):
                            all_data.append(contents)
                except Exception as e:
                    print(f"Error reading file {original_file}: {e}")
        else:
            # Load all JSON files from original/
            for filename in sorted(os.listdir(original_dir)):
                if not filename.endswith(".json"):
                    continue
                original_file = f"{original_dir}/{filename}"
                try:
                    with open(original_file, "r", encoding="utf-8") as f:
                        contents = json.load(f)
                        if isinstance(contents, list):
                            all_data.extend(contents)
                        elif isinstance(contents, dict):
                            all_data.append(contents)
                except Exception as e:
                    print(f"Error reading file {original_file}: {e}")
                    continue
        
        return all_data
    else:
        # V2 enabled: load from main.json (which references data/ directory)
        return _load_from_main_json(web_name, entity_type)


def _load_from_main_json(web_name: str, entity_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Helper function to load data from main.json (used when V2 is enabled or as fallback).
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
    Append data to the latest file for this entity, or create a new file if:
    - No files exist yet
    - The latest file would exceed DATA_FILE_MAX_BYTES after appending

    Returns:
        Path to the file where data was saved
    """
    main_path = get_main_path(web_name)

    # Load or create main.json
    if os.path.exists(main_path):
        with open(main_path, "r", encoding="utf-8") as f:
            main = json.load(f)
    else:
        main = {}

    # Get existing files for this entity
    entity_files = main.get(entity_type, [])

    # Determine if we append to existing or create new
    should_create_new = True
    target_file = None

    if entity_files:
        # Get the last file
        last_file_rel = entity_files[-1].lstrip("./")
        last_file_abs = f"{BASE_PATH}/{web_name}/{last_file_rel}"

        if os.path.exists(last_file_abs):
            # Check file size
            file_size = os.path.getsize(last_file_abs)
            estimated_new_size = file_size + len(json.dumps(data))

            if estimated_new_size < DATA_FILE_MAX_BYTES:
                # Append to existing file
                should_create_new = False
                target_file = last_file_abs

    if should_create_new:
        # Create new file with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{entity_type}_{timestamp}.json"
        return save_data_file(web_name, filename, data, entity_type)
    else:
        # Append to existing file
        with open(target_file, "r", encoding="utf-8") as f:
            existing_data = json.load(f)

        if isinstance(existing_data, list):
            existing_data.extend(data)
        else:
            # If not a list, convert to list
            existing_data = [existing_data] + data

        # Write back
        with open(target_file, "w", encoding="utf-8") as f:
            json.dump(existing_data, f, indent=2, ensure_ascii=False)

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
    # Target file is always {entity_type}_1.json
    data_dir = get_data_dir(web_name)
    _ensure_dir(data_dir)

    filename = f"{entity_type}_1.json"
    file_path = f"{data_dir}/{filename}"

    # Read existing data if file exists
    existing_data = []
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
                if not isinstance(existing_data, list):
                    existing_data = [existing_data]
        except Exception as e:
            print(f"Warning: Could not read existing file {file_path}: {e}")
            existing_data = []

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

    relative_path = f"./data/{filename}"
    if entity_type not in main:
        main[entity_type] = []

    if relative_path not in main[entity_type]:
        main[entity_type].append(relative_path)

    with open(main_path, "w", encoding="utf-8") as f:
        json.dump(main, f, indent=2, ensure_ascii=False)

    print(f"✅ Appended {len(data)} records to {file_path} (total: {len(combined_data)})")
    return file_path
