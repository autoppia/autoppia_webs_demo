"""
Master Dataset Handler
Manages master data pools and provides seeded selection.
One master pool per project/entity - selections made dynamically using seeds.
"""

import orjson
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncpg
from loguru import logger
from seeded_selector import seeded_select, seeded_shuffle, seeded_filter_and_select, seeded_distribution


async def save_master_pool(pool: asyncpg.Pool, project_key: str, entity_type: str, data_pool: List[Dict[str, Any]], metadata: Optional[Dict[str, Any]] = None) -> int:
    """
    Save or update master data pool for a project/entity.
    Only ONE pool exists per project/entity combination.

    Returns the ID of the saved/updated record
    """
    if metadata is None:
        metadata = {}

    metadata.update({"pool_size": len(data_pool), "updated_at": datetime.now().isoformat(), "version": "1.0"})

    # Deduplicate incoming data by id or title to ensure unique items
    def _dedupe_items(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen_keys = set()
        unique_items: List[Dict[str, Any]] = []
        for item in items:
            # Prefer id; fallback to (title, category) composite; else index-based key
            key = None
            if isinstance(item, dict):
                if item.get("id"):
                    key = ("id", str(item.get("id")))
                elif item.get("title"):
                    key = ("title+category", f"{item.get('title')}::{item.get('category', '')}")
            if key is None:
                key = ("index", str(len(unique_items)))
            if key in seen_keys:
                continue
            seen_keys.add(key)
            unique_items.append(item)
        return unique_items

    # Upsert query (insert or update if exists)
    query = """
        INSERT INTO master_datasets (project_key, entity_type, data_pool, pool_size, metadata, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (project_key, entity_type) 
        DO UPDATE SET 
            data_pool = EXCLUDED.data_pool,
            pool_size = EXCLUDED.pool_size,
            metadata = EXCLUDED.metadata,
            updated_at = NOW()
        RETURNING id
    """

    try:
        async with pool.acquire() as conn:
            # If a pool already exists, merge with new data and dedupe
            existing = await conn.fetchrow(
                "SELECT data_pool FROM master_datasets WHERE project_key = $1 AND entity_type = $2",
                project_key,
                entity_type,
            )
            merged_pool: List[Dict[str, Any]]
            if existing and existing.get("data_pool"):
                try:
                    existing_items = orjson.loads(existing["data_pool"]) if isinstance(existing["data_pool"], str) else existing["data_pool"]
                except Exception:
                    existing_items = []
                merged_pool = _dedupe_items((existing_items or []) + (data_pool or []))
            else:
                merged_pool = _dedupe_items(data_pool or [])

            # Convert merged, deduped data to JSONB
            data_json = orjson.dumps(merged_pool).decode("utf-8")
            metadata_json = orjson.dumps(metadata).decode("utf-8")

            record_id = await conn.fetchval(query, project_key, entity_type, data_json, len(merged_pool), metadata_json)

            logger.info(f"Saved master pool: project={project_key}, entity={entity_type}, size={len(merged_pool)}, id={record_id}")
            return record_id
    except Exception as e:
        logger.error(f"Failed to save master pool: {e}")
        raise


async def get_master_pool(pool: asyncpg.Pool, project_key: str, entity_type: str) -> Optional[List[Dict[str, Any]]]:
    """
    Get the master data pool for a project/entity.

    Returns None if no pool exists.
    """
    query = """
        SELECT data_pool, metadata
        FROM master_datasets
        WHERE project_key = $1 AND entity_type = $2
    """

    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(query, project_key, entity_type)

            if not row:
                logger.warning(f"No master pool found for project={project_key}, entity={entity_type}")
                return None

            # Parse JSONB data
            data_pool = orjson.loads(row["data_pool"]) if isinstance(row["data_pool"], str) else row["data_pool"]

            logger.info(f"Retrieved master pool: project={project_key}, entity={entity_type}, size={len(data_pool)}")
            return data_pool

    except Exception as e:
        logger.error(f"Failed to get master pool: {e}")
        raise


async def select_from_pool(
    pool: asyncpg.Pool,
    project_key: str,
    entity_type: str,
    seed: int,
    count: int,
    method: str = "select",
    filter_key: Optional[str] = None,
    filter_values: Optional[List[str]] = None,
    log_usage: bool = True,
) -> Dict[str, Any]:
    """
    Select data from master pool using seed for reproducibility.

    Args:
        pool: Database connection pool
        project_key: Project identifier
        entity_type: Entity type
        seed: Seed value for deterministic selection
        count: Number of items to select
        method: Selection method - "select", "shuffle", "filter", or "distribute"
        filter_key: Optional key to filter on (for "filter" method)
        filter_values: Optional values to filter (for "filter" method)
        log_usage: Whether to log this access for analytics

    Returns:
        Dict with metadata and selected data
    """
    # Get master pool
    master_pool = await get_master_pool(pool, project_key, entity_type)

    if not master_pool:
        return {"metadata": {"error": "No master pool found", "project_key": project_key, "entity_type": entity_type}, "data": []}

    # Select based on method
    if method == "shuffle":
        selected_data = seeded_shuffle(master_pool, seed, count)
    elif method == "filter" and filter_key and filter_values:
        selected_data = seeded_filter_and_select(master_pool, seed, count, filter_key, filter_values)
    elif method == "distribute" and filter_key:
        selected_data = seeded_distribution(master_pool, seed, filter_key, count)
    else:  # default: select
        selected_data = seeded_select(master_pool, seed, count, allow_duplicates=False)

    # Log usage if requested
    if log_usage:
        try:
            await log_seed_usage(pool, project_key, entity_type, seed, count, method)
        except Exception as e:
            logger.warning(f"Failed to log seed usage: {e}")

    result = {
        "metadata": {
            "project_key": project_key,
            "entity_type": entity_type,
            "seed_value": seed,
            "selection_method": method,
            "pool_size": len(master_pool),
            "requested_count": count,
            "returned_count": len(selected_data),
            "selected_at": datetime.now().isoformat(),
        },
        "data": selected_data,
    }

    logger.info(f"Selected from pool: project={project_key}, entity={entity_type}, seed={seed}, method={method}, count={len(selected_data)}")
    return result


async def log_seed_usage(pool: asyncpg.Pool, project_key: str, entity_type: str, seed_value: int, requested_count: int, selection_method: str) -> None:
    """
    Log seed usage for analytics (optional).
    """
    query = """
        INSERT INTO seed_usage_log (project_key, entity_type, seed_value, requested_count, selection_method)
        VALUES ($1, $2, $3, $4, $5)
    """

    try:
        async with pool.acquire() as conn:
            await conn.execute(query, project_key, entity_type, seed_value, requested_count, selection_method)
    except Exception as e:
        # Don't fail if logging fails
        logger.warning(f"Failed to log seed usage: {e}")


async def get_pool_info(pool: asyncpg.Pool, project_key: str, entity_type: str) -> Optional[Dict[str, Any]]:
    """
    Get information about a master pool without loading all data.
    """
    query = """
        SELECT pool_size, metadata, created_at, updated_at
        FROM master_datasets
        WHERE project_key = $1 AND entity_type = $2
    """

    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(query, project_key, entity_type)

            if not row:
                return None

            metadata = orjson.loads(row["metadata"]) if isinstance(row["metadata"], str) else row["metadata"]

            return {
                "project_key": project_key,
                "entity_type": entity_type,
                "pool_size": row["pool_size"],
                "metadata": metadata,
                "created_at": row["created_at"].isoformat(),
                "updated_at": row["updated_at"].isoformat(),
            }

    except Exception as e:
        logger.error(f"Failed to get pool info: {e}")
        raise


async def list_available_pools(pool: asyncpg.Pool, project_key: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    List all available master pools, optionally filtered by project.
    """
    if project_key:
        query = """
            SELECT project_key, entity_type, pool_size, updated_at
            FROM master_datasets
            WHERE project_key = $1
            ORDER BY entity_type
        """
        params = [project_key]
    else:
        query = """
            SELECT project_key, entity_type, pool_size, updated_at
            FROM master_datasets
            ORDER BY project_key, entity_type
        """
        params = []

    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, *params)

            result = [{"project_key": row["project_key"], "entity_type": row["entity_type"], "pool_size": row["pool_size"], "updated_at": row["updated_at"].isoformat()} for row in rows]

            return result

    except Exception as e:
        logger.error(f"Failed to list pools: {e}")
        raise
