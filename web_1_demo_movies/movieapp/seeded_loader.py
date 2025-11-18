"""
Seeded data loader for web_1_demo_movies (Django).
Loads data from webs_server API using v2-seed for deterministic selection.
"""
import os
import requests
from typing import List, Dict, Any, Optional
from django.conf import settings


def get_api_base_url() -> str:
    """Get the API base URL from environment or settings."""
    api_url = os.environ.get("API_URL") or getattr(settings, "API_URL", None)
    if api_url:
        return api_url.rstrip("/")
    # Default to webs_server in Docker network
    return "http://app:8080"


def is_db_load_mode_enabled() -> bool:
    """Check if V2 DB load mode is enabled."""
    enabled = os.environ.get("ENABLE_DYNAMIC_V2_DB_MODE", "false").lower() == "true"
    if not enabled:
        enabled = getattr(settings, "ENABLE_DYNAMIC_V2_DB_MODE", False)
    return enabled


def fetch_seeded_selection(
    entity_type: str,
    seed_value: int,
    limit: int = 50,
    method: str = "distribute",
    filter_key: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Fetch seeded selection from webs_server API.
    
    Args:
        entity_type: Entity type (e.g., "movies")
        seed_value: Seed value for deterministic selection
        limit: Maximum number of items to return
        method: Selection method (select, shuffle, filter, distribute)
        filter_key: Key to filter on (for filter/distribute methods)
    
    Returns:
        List of dictionaries representing the selected entities
    """
    if not is_db_load_mode_enabled():
        return []
    
    api_url = get_api_base_url()
    project_key = "web_1_demo_movies"
    
    params = {
        "project_key": project_key,
        "entity_type": entity_type,
        "seed_value": seed_value,
        "limit": limit,
        "method": method,
    }
    
    if filter_key:
        params["filter_key"] = filter_key
    
    try:
        response = requests.get(
            f"{api_url}/datasets/load",
            params=params,
            timeout=10,
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("data", [])
        else:
            print(f"[seeded_loader] API error: {response.status_code} - {response.text}")
            return []
    except requests.exceptions.RequestException as e:
        print(f"[seeded_loader] Request failed: {e}")
        return []
    except Exception as e:
        print(f"[seeded_loader] Unexpected error: {e}")
        return []


def load_movies_from_api(seed_value: Optional[int] = None, limit: int = 100) -> List[Dict[str, Any]]:
    """
    Load movies from webs_server API using v2-seed.
    
    Args:
        seed_value: Seed value (defaults to 1 if None and v2 is enabled)
        limit: Maximum number of movies to return
    
    Returns:
        List of movie dictionaries
    """
    if not is_db_load_mode_enabled():
        return []
    
    effective_seed = seed_value if seed_value is not None else 1
    
    movies = fetch_seeded_selection(
        entity_type="movies",
        seed_value=effective_seed,
        limit=limit,
        method="distribute",
        filter_key="category",  # Distribute by category if available
    )
    
    return movies

