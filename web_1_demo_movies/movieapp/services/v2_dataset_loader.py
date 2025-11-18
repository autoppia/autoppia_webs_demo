import logging
import threading
from typing import Any, Dict, Iterable, List

import requests
from django.conf import settings
from django.db import transaction

from movieapp.models import Genre, Movie

logger = logging.getLogger(__name__)

_DATASET_LOCK = threading.Lock()
_DEFAULT_LIMIT = 120


def is_v2_mode_enabled() -> bool:
    return bool(getattr(settings, "DYNAMIC_V2_DB_MODE_ENABLED", False))


def _get_api_base_url() -> str:
    base_url = getattr(settings, "DYNAMIC_V2_API_URL", None)
    if base_url:
        return base_url.rstrip("/")
    raise RuntimeError("DYNAMIC_V2_API_URL is not configured")


def _build_dataset_params(seed: int, limit: int) -> Dict[str, Any]:
    return {
        "project_key": getattr(settings, "DYNAMIC_V2_PROJECT_KEY", "web_1_demo_movies"),
        "entity_type": getattr(settings, "DYNAMIC_V2_ENTITY_TYPE", "movies"),
        "seed_value": seed,
        "limit": limit,
        "method": getattr(settings, "DYNAMIC_V2_SELECTION_METHOD", "distribute"),
        "filter_key": getattr(settings, "DYNAMIC_V2_CATEGORY_KEY", "category"),
    }


def fetch_seeded_movies(seed: int, limit: int = _DEFAULT_LIMIT) -> List[Dict[str, Any]]:
    base_url = _get_api_base_url()
    params = _build_dataset_params(seed, limit)
    try:
        response = requests.get(f"{base_url}/datasets/load", params=params, timeout=25)
        response.raise_for_status()
        payload = response.json()
    except Exception as exc:
        raise RuntimeError(f"Failed to load seeded dataset (seed={seed})") from exc

    data = payload.get("data") if isinstance(payload, dict) else None
    if not isinstance(data, list):
        raise RuntimeError(f"Seeded dataset returned unexpected payload for seed={seed}")
    if not data:
        raise RuntimeError(f"No dataset entries returned for seed={seed}")
    return data


def _normalize_image_path(path_value: str | None) -> str:
    fallback = "gallery/default_movie.png"
    if not path_value:
        return fallback
    cleaned = path_value.lstrip("/")
    # Ensure we only store media-relative paths
    if cleaned.startswith("media/"):
        cleaned = cleaned[len("media/") :]
    return cleaned or fallback


def _normalize_cast(cast_list: Iterable[Any]) -> str:
    if not cast_list:
        return ""
    return ", ".join(str(member) for member in cast_list if member)


def _clamp_rating(value: Any) -> float:
    try:
        rating = float(value)
    except Exception:
        return 0.0
    return max(0.0, min(5.0, rating))


def _safe_int(value: Any, default: int, *, min_value: int | None = None, max_value: int | None = None) -> int:
    try:
        parsed = int(value)
    except Exception:
        return default
    parsed = parsed or default
    if min_value is not None:
        parsed = max(min_value, parsed)
    if max_value is not None:
        parsed = min(max_value, parsed)
    return parsed


def ensure_movies_for_seed(seed: int, limit: int = _DEFAULT_LIMIT) -> int:
    """
    Ensure the database has deterministic movie rows for the provided seed.
    Returns the number of records available for that seed.
    """
    if not is_v2_mode_enabled():
        return 0

    normalized_seed = max(1, int(seed or 1))
    with _DATASET_LOCK:
        existing_count = Movie.objects.filter(v2_seed=normalized_seed).count()
        if existing_count:
            return existing_count

        dataset_entries = fetch_seeded_movies(normalized_seed, limit=limit)

        with transaction.atomic():
            Movie.objects.filter(v2_seed=normalized_seed).delete()
            created = []
            for entry in dataset_entries:
                dataset_id = str(entry.get("id") or "")
                if not dataset_id:
                    logger.warning("Skipping dataset entry without id for seed=%s", normalized_seed)
                    continue

                movie_defaults = {
                    "name": entry.get("title") or "Untitled Feature",
                    "desc": entry.get("description") or "",
                    "year": _safe_int(entry.get("year"), 2020, min_value=1, max_value=9999),
                    "img": _normalize_image_path(entry.get("image_path")),
                    "director": entry.get("director") or "",
                    "cast": _normalize_cast(entry.get("cast")),
                    "duration": _safe_int(entry.get("duration"), 105, min_value=1, max_value=600),
                    "trailer_url": entry.get("trailer_url") or "",
                    "rating": _clamp_rating(entry.get("rating")),
                }

                movie, _ = Movie.objects.update_or_create(
                    v2_seed=normalized_seed,
                    v2_dataset_id=dataset_id,
                    defaults=movie_defaults,
                )

                genre_names = [g for g in entry.get("genres", []) if g]
                if genre_names:
                    genre_objects: List[Genre] = []
                    for genre_name in genre_names:
                        genre_obj, _ = Genre.objects.get_or_create(name=genre_name)
                        genre_objects.append(genre_obj)
                    movie.genres.set(genre_objects)
                else:
                    movie.genres.clear()

                created.append(movie.id)

        return len(created)
