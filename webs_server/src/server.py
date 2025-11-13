import asyncio
import os
import json
from pathlib import Path
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse

import asyncpg
import uvicorn
from asyncpg.exceptions import PostgresError
import orjson
from fastapi import FastAPI, HTTPException, Query, status, Body
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from loguru import logger
from pydantic import BaseModel, Field, field_validator
from openai import AsyncOpenAI

try:
    import fastjsonschema

    HAS_FASTJSONSCHEMA = True
except ImportError:
    HAS_FASTJSONSCHEMA = False

from master_dataset_handler import save_master_pool, select_from_pool, get_pool_info, list_available_pools
from data_handler import save_data_file, load_all_data
from seeded_selector import seeded_select, seeded_shuffle, seeded_filter_and_select, seeded_distribution

# --- Configuration ---
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5433/database")
DB_POOL_MIN = int(os.getenv("DB_POOL_MIN", "10"))
DB_POOL_MAX = int(os.getenv("DB_POOL_MAX", "50"))
GZIP_MIN_SIZE = int(os.getenv("GZIP_MIN_SIZE", "1000"))
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


# --- Helper Function for URL Trimming ---
def trim_url_to_origin(url: str) -> str:
    """Trims a URL to its scheme://host[:port] origin string."""
    parsed = urlparse(url)
    port_str = f":{parsed.port}" if parsed.port else ""
    return f"{parsed.scheme}://{parsed.hostname}{port_str}"


# --- SQL Query Constants ---
INSERT_EVENT_SQL = """
                   INSERT INTO events (web_agent_id, web_url, validator_id, event_data)
                   VALUES ($1, $2, $3, $4) RETURNING id, created_at;
                   """

SELECT_EVENTS_SQL = """
                    SELECT id, web_agent_id, web_url, validator_id, event_data AS data, created_at
                    FROM events
                    WHERE web_url = $1
                      AND web_agent_id = $2
                      AND validator_id = $3
                    ORDER BY created_at DESC;
                    """

DELETE_EVENTS_SQL = """
                    WITH deleted_rows AS (
                        DELETE
                        FROM events
                        WHERE web_url = $1
                          AND web_agent_id = $2
                          AND validator_id = $3
                        RETURNING id
                    )
                    SELECT count(*)
                    FROM deleted_rows;
                    """


# --- Pydantic Models ---
class EventInput(BaseModel):
    web_agent_id: str = Field(default="UNKNOWN_AGENT", max_length=255)
    web_url: str
    validator_id: str
    data: Dict[str, Any]

    @field_validator("web_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        try:
            parsed = urlparse(v)
            if not all([parsed.scheme, parsed.hostname]):
                raise ValueError("Invalid URL format")
            return v
        except Exception as e:
            raise ValueError(f"Invalid URL: {str(e)}")


class EventOutput(BaseModel):
    id: int
    web_agent_id: str
    web_url: str
    validator_id: str
    data: Dict[str, Any]
    created_at: datetime


class EventSaveResponse(BaseModel):
    message: str
    event_id: int
    created_at: datetime


class ResetResponse(BaseModel):
    message: str
    web_url: str
    deleted_count: int


# --- Data Generation Models (generic) ---
class DataGenerationRequest(BaseModel):
    interface_definition: str = Field(..., description="TypeScript interface definition")
    examples: List[Dict[str, Any]] = Field(..., description="Few-shot JSON examples")
    count: int = Field(..., ge=1, le=200, description="How many objects to generate")
    categories: Optional[List[str]] = Field(None, description="Optional categories/themes")
    additional_requirements: Optional[str] = Field(None, description="Free-form guidance")
    json_schema: Optional[Dict[str, Any]] = Field(None, description="Optional JSON Schema to validate the result shape")
    naming_rules: Optional[Dict[str, Any]] = Field(None, description="Optional rules e.g. id or image path patterns")
    project_key: Optional[str] = Field(None, description="Project key for saving data to specific project directory")
    entity_type: Optional[str] = Field(None, description="Entity type (e.g., 'products', 'movies', 'tasks')")
    save_to_file: bool = Field(default=False, description="Whether to save generated data to JSON file")
    save_to_db: bool = Field(default=False, description="Whether to save generated data to database")
    seed_value: Optional[int] = Field(None, description="Seed value for reproducible generation")


class DataGenerationResponse(BaseModel):
    message: str
    generated_data: List[Dict[str, Any]]
    count: int
    generation_time: float
    saved_path: Optional[str] = Field(None, description="Path where data was saved (if save_to_file=True)")


# --- Database Initialization ---
async def init_db_pool():
    """Initializes the database connection pool and prepared statements."""
    retry_count = 0
    max_retries = 5
    retry_delay = 5  # seconds

    logger.info(f"Initializing database connection pool to: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'localhost'}")

    while retry_count < max_retries:
        try:
            app.state.pool = await asyncpg.create_pool(
                DATABASE_URL,
                min_size=DB_POOL_MIN,
                max_size=DB_POOL_MAX,
                timeout=30,  # Connection acquisition timeout
                command_timeout=30,  # Default timeout for commands on a connection
                server_settings={
                    "application_name": "webs_server_api",
                    "timezone": "UTC",
                },
            )

            # Test the connection pool
            async with app.state.pool.acquire() as conn:
                await conn.fetchval("SELECT 1")

            logger.success(f"Database connection pool established (min: {DB_POOL_MIN}, max: {DB_POOL_MAX})")
            return
        except asyncpg.PostgresError as e:
            retry_count += 1
            logger.warning(f"Database pool creation failed (attempt {retry_count}/{max_retries}): {str(e)}")
            if retry_count >= max_retries:
                logger.error("Failed to create database pool after multiple attempts.")
                raise RuntimeError(f"Database pool creation failed: {str(e)}")
            await asyncio.sleep(retry_delay)
        except Exception as e:
            retry_count += 1
            logger.error(f"An unexpected error occurred during database pool creation (attempt {retry_count}/{max_retries}): {e}")
            if retry_count >= max_retries:
                logger.error("Failed to create database pool after multiple attempts due to unexpected error.")
                raise RuntimeError(f"Database pool creation failed due to unexpected error: {str(e)}")
            await asyncio.sleep(retry_delay)


# --- Application Lifespan Management ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db_pool()
    logger.info("Application startup complete.")
    yield
    # Shutdown
    if hasattr(app.state, "pool") and app.state.pool:
        try:
            await app.state.pool.close()
            logger.info("Database connection pool closed.")
        except Exception as e:
            logger.error(f"Error during database pool close: {e}")
    logger.info("Application shutdown complete.")


# --- FastAPI Application ---
app = FastAPI(
    title="Blazing Fast Event API",
    description="API for saving, retrieving, and resetting web agent events. Enhanced version with Python 3.11 support.",
    version="1.0.0",
    lifespan=lifespan,
    default_response_class=ORJSONResponse,
    redoc_url=None,
)

# Add CORS middleware to allow requests from Next.js local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://app:8002",
        "http://app:8003",
        "http://localhost:8000",
        "http://localhost:8001",
        "http://localhost:8002",
        "http://localhost:8003",
        "http://localhost:8004",
        "http://localhost:8005",
        "http://localhost:8006",
        "http://localhost:8007",
        "http://localhost:8008",
        "http://localhost:8009",
        "http://localhost:8010",
        "http://localhost:8011",
        "http://localhost:8012",
        "http://localhost:8013",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.add_middleware(GZipMiddleware, minimum_size=GZIP_MIN_SIZE)


# --- Root Endpoint ---
@app.get("/", summary="API Root")
async def root():
    """
    Root endpoint providing basic API information and available endpoints.
    """
    return {
        "message": "Blazing Fast Event API",
        "version": "1.0.0",
        "python_version": f"{__import__('sys').version_info.major}.{__import__('sys').version_info.minor}.{__import__('sys').version_info.micro}",
        "endpoints": {
            "health": "/health",
            "save_events": "/save_events/",
            "get_events": "/get_events/",
            "reset_events": "/reset_events/",
            "generate_dataset": "/datasets/generate",
        },
        "status": "operational",
    }


# --- API Endpoints ---
@app.post("/save_events/", response_model=EventSaveResponse, status_code=status.HTTP_201_CREATED, summary="Save a single event")
async def save_event_endpoint(event: EventInput):
    """
    Saves a single event using a prepared statement obtained from the pool.
    The web_url is stored as its origin (scheme://host[:port]).
    """
    if not hasattr(app.state, "pool") or app.state.pool is None:
        logger.error("Database pool not available for saving event.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service temporarily unavailable.",
        )
    try:
        event_data_json_string = orjson.dumps(event.data).decode("utf-8")
        # --- Apply trimming before saving ---
        trimmed_url = trim_url_to_origin(event.web_url)
        if not trimmed_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid web_url provided after trimming.",
            )

        result = await app.state.pool.fetchrow(INSERT_EVENT_SQL, event.web_agent_id, trimmed_url, event.validator_id, event_data_json_string)
        if result:
            logger.info(f"Event saved successfully with ID: {result['id']}")
            return EventSaveResponse(
                message="Event saved successfully",
                event_id=result["id"],
                created_at=result["created_at"],
            )
        else:
            logger.error("Event save operation did not return expected result.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save event due to unexpected DB response.",
            )

    except PostgresError as e:
        logger.error(f"Database error during event save: {e} (SQLState: {e.sqlstate}).")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database operation failed during save: {e.pgcode}.",
        ) from e
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during event save: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while saving the event.",
        ) from e


@app.get("/get_events/", response_model=List[EventOutput], summary="Get events for a web agent and URL")
async def get_events_endpoint(
    web_url: str = Query(..., description="The specific web URL to filter events for."),
    web_agent_id: str = Query(
        default="UNKNOWN_AGENT",
        max_length=255,
        description="The specific web agent ID to filter events for.",
    ),
    validator_id: str = Query(
        default="UNKNOWN_VALIDATOR",
        max_length=255,
        description="The specific validator ID to filter events for.",
    ),
):
    """
    Retrieves events, utilizing prepared statements.
    Filtering is done based on the origin (scheme://host[:port]) of the provided web_url.
    """
    if not hasattr(app.state, "pool") or app.state.pool is None:
        logger.error("Database pool not available for fetching events.")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service temporarily unavailable.")

    # --- Apply trimming to the query parameter before using it in the WHERE clause ---
    trimmed_url = trim_url_to_origin(web_url)
    if not trimmed_url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid web_url provided after trimming.")

    try:
        rows: List[asyncpg.Record] = await app.state.pool.fetch(SELECT_EVENTS_SQL, trimmed_url, web_agent_id, validator_id)

        processed_rows = []
        for row in rows:
            row_dict = dict(row)
            raw_data = row_dict.get("data")
            if isinstance(raw_data, str):
                try:
                    row_dict["data"] = orjson.loads(raw_data)
                except orjson.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON data for event ID {row_dict.get('id', 'unknown')}: {e}")
                    row_dict["data"] = {}
            elif raw_data is None:
                row_dict["data"] = {}

            processed_rows.append(row_dict)

        logger.info(f"Retrieved {len(processed_rows)} events for trimmed URL: {trimmed_url}, Agent ID: {web_agent_id}, Validator ID: {validator_id}")
        return processed_rows

    except PostgresError as e:
        logger.error(f"Database query failed for get_events: {e} (SQLState: {e.sqlstate})")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database operation failed during event retrieval: {e.pgcode}.") from e
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during get_events: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An internal server error occurred while fetching events.") from e


@app.delete("/reset_events/", response_model=ResetResponse, summary="Delete all events for a web URL")
async def reset_events_endpoint(
    web_url: str = Query(..., description="The web URL for which all events should be deleted."),
    web_agent_id: str = Query(default="UNKNOWN_AGENT", max_length=255, description="The specific web agent ID."),
    validator_id: str = Query(..., description="The validator ID associated with the events."),
):
    """
    Deletes all events for a given web_url, web_agent_id, and validator_id using a prepared statement.
    Deletion is based on the origin (scheme://host[:port]) of the provided web_url.
    """
    if not hasattr(app.state, "pool") or app.state.pool is None:
        logger.error("Database pool not available for resetting events.")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service temporarily unavailable.")

    # --- Apply trimming to the query parameter before using it in the WHERE clause ---
    trimmed_url = trim_url_to_origin(web_url)
    if not trimmed_url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid web_url provided after trimming.")

    try:
        deleted_count: Optional[int] = await app.state.pool.fetchval(DELETE_EVENTS_SQL, trimmed_url, web_agent_id, validator_id)
        actual_deleted_count = deleted_count if deleted_count is not None else 0
        logger.info(f"Successfully deleted {actual_deleted_count} events for trimmed URL: {trimmed_url}, Agent ID: {web_agent_id}, Validator ID: {validator_id}")
        return ResetResponse(message=f"Successfully deleted {actual_deleted_count} events for '{web_url}'", web_url=web_url, deleted_count=actual_deleted_count, validator_id=validator_id)
    except PostgresError as e:
        logger.error(f"Database deletion failed for reset_events: {e} (SQLState: {e.sqlstate}).")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database operation failed during event reset: {e.pgcode}.") from e
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during reset_events: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An internal server error occurred while resetting events.") from e


# --- Data Generation Functions (generic) ---
async def generate_with_openai(request: DataGenerationRequest) -> List[Dict[str, Any]]:
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="OpenAI API key not configured")

    client = AsyncOpenAI(api_key=OPENAI_API_KEY)

    examples_json = orjson.dumps(request.examples, option=orjson.OPT_INDENT_2).decode("utf-8")
    naming_rules = orjson.dumps(request.naming_rules or {}, option=orjson.OPT_INDENT_2).decode("utf-8")

    prompt = f"""
You generate strictly valid JSON arrays for synthetic datasets.

Return ONLY a JSON array (no preface, no markdown).

Generate exactly {request.count} items that conform to this TypeScript interface:

{request.interface_definition}

Few-shot examples to mimic style/shape:
{examples_json}

Guidance:
- Follow the interface types exactly.
- Make realistic, diverse data.
- Required fields must always be present.
- Prefer consistent keys; avoid null unless optional.
- If arrays/tuples/enums exist, respect them.
- IDs must be unique per item.
- Avoid placeholders like "lorem ipsum" or "image.png".

Naming rules (may be empty JSON):
{naming_rules}

{f"Focus on categories mentioning the EXACT names: {', '.join(request.categories)}" if request.categories else ""}

{request.additional_requirements or ""}

Output strictly a JSON array only.
"""

    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict JSON data generator. Output must be a JSON array only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            # max_tokens=6000,
        )
        content = resp.choices[0].message.content.strip()

        try:
            data = orjson.loads(content)
            if not isinstance(data, list):
                raise ValueError("Model response is not a JSON array")
        except Exception as e:
            # Log raw content for debugging
            logger.error(f"Failed to parse generation as JSON array: {e}")
            logger.error(f"Raw content: {content[:1000]}...")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Generated output is not valid JSON")

        # Optional JSON Schema validation if provided
        if request.json_schema:
            if not HAS_FASTJSONSCHEMA:
                logger.warning("JSON Schema validation requested but fastjsonschema not available")
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="JSON Schema validation not available - fastjsonschema not installed")

            try:
                validate = fastjsonschema.compile(request.json_schema)
                for idx, item in enumerate(data):
                    validate(item)
            except Exception as e:
                logger.error(f"Schema validation failed: {e}")
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"JSON Schema validation failed: {e}")

        return data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OpenAI generation failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Data generation failed: {str(e)}")


# --- Helper Function to Save Data to File Storage (/app/data) ---
def save_generated_data_file_storage(data: List[Dict[str, Any]], project_key: str, entity_type: str) -> str:
    """
    Save generated data to file storage using the new persistent volume structure:
    /app/data/<project_key>/data/<entity_type>_<timestamp>.json
    Returns the absolute path where the file was saved.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{entity_type}_{timestamp}.json"
    saved_path = save_data_file(project_key, filename, data, entity_type)
    logger.info(f"Saved {len(data)} items to file storage: {saved_path}")
    return saved_path


# --- Data Generation Endpoint (generic) ---
@app.post("/datasets/generate", response_model=DataGenerationResponse, status_code=status.HTTP_200_OK)
async def generate_dataset_endpoint(request: DataGenerationRequest):
    start = datetime.now()
    data = await generate_with_openai(request)
    elapsed = (datetime.now() - start).total_seconds()
    logger.info(f"Generated {len(data)} items in {elapsed:.2f}s")
    logger.debug("=" * 60 + f"DATA: {data}" + "=" * 60)

    # Always save to file storage (files-only mode)
    saved_path = None
    if request.project_key and request.entity_type:
        try:
            # Use new file-storage saver under /app/data (persistent volume)
            saved_path = save_generated_data_file_storage(data, request.project_key, request.entity_type)
        except Exception as e:
            logger.error(f"Failed to save data to file storage: {e}")
            # Don't fail the request if saving fails
    # Ignore DB save in files-only mode

    return DataGenerationResponse(
        message=f"Successfully generated {len(data)} items",
        generated_data=data,
        count=len(data),
        generation_time=elapsed,
        saved_path=saved_path,
    )


# --- Data Loading Models ---
class DatasetLoadRequest(BaseModel):
    project_key: str = Field(..., description="Project key")
    entity_type: str = Field(..., description="Entity type")
    seed_value: int = Field(..., description="Seed value to load")
    limit: int = Field(default=50, ge=1, le=500, description="Maximum number of items to return")


class DatasetLoadResponse(BaseModel):
    message: str
    metadata: Dict[str, Any]
    data: List[Dict[str, Any]]
    count: int


# --- Data Loading Endpoint (Seeded Selection) ---
@app.get("/datasets/load", response_model=DatasetLoadResponse, summary="Load dataset using seeded selection")
async def load_dataset_endpoint(
    project_key: str = Query(..., description="Project key"),
    entity_type: str = Query(..., description="Entity type"),
    seed_value: int = Query(..., description="Seed value for deterministic selection"),
    limit: int = Query(default=50, ge=1, le=500, description="Maximum items to return"),
    method: str = Query(default="select", description="Selection method: select, shuffle, filter, distribute"),
    filter_key: Optional[str] = Query(None, description="Key to filter on (for filter method)"),
    filter_values: Optional[str] = Query(None, description="Comma-separated values to filter (for filter method)"),
):
    """
    Select data from master pool using seed for reproducible selection.
    This endpoint uses deterministic seeded selection - same seed always returns same data.
    No duplicate data storage - all selections are computed from master pool.

    This endpoint is used when projects are deployed with --load_from_db parameter.
    """
    try:
        # Load from file-based storage under /app/data only (files-only mode)
        file_data_pool = load_all_data(project_key, entity_type)

        if not file_data_pool:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No file-based data found for project={project_key}. Generate data first.")

        # Apply seeded selection based on requested method
        method_normalized = (method or "select").lower()
        selected: List[Dict[str, Any]]

        # Parse filters
        filter_list = [v.strip() for v in filter_values.split(",")] if filter_values else None

        if method_normalized == "shuffle":
            selected = seeded_shuffle(file_data_pool, seed_value, limit=limit)
        elif method_normalized == "filter":
            selected = seeded_filter_and_select(file_data_pool, seed_value, limit, filter_key=filter_key, filter_values=filter_list)
        elif method_normalized == "distribute":
            # Use filter_key as category_key for distribution if provided, else default 'category'
            category_key = filter_key or "category"
            selected = seeded_distribution(file_data_pool, seed_value, category_key=category_key, total_count=limit)
        else:
            # Default 'select' method
            selected = seeded_select(file_data_pool, seed=seed_value, count=limit, allow_duplicates=False)

        metadata = {
            "source": "file_storage",
            "projectKey": project_key,
            "entityType": entity_type,
            "seed": seed_value,
            "limit": limit,
            "method": method_normalized,
            "filterKey": filter_key,
            "filterValues": filter_list,
            "totalAvailable": len(file_data_pool),
        }
        return DatasetLoadResponse(message=f"Successfully selected {len(selected)} items from file storage using seed={seed_value}", metadata=metadata, data=selected, count=len(selected))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to load dataset: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to load dataset: {str(e)}")


# --- List Pools Endpoint ---
@app.get("/datasets/pools", summary="List available master pools")
async def list_pools_endpoint(project_key: Optional[str] = Query(None, description="Optional project key filter")):
    """
    List all available master data pools.
    Each pool can be queried with any seed value for reproducible selection.
    """
    if not hasattr(app.state, "pool") or app.state.pool is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database pool not available")

    try:
        pools = await list_available_pools(app.state.pool, project_key)
        return {"pools": pools, "count": len(pools), "message": "Master pools available for seeded selection"}
    except Exception as e:
        logger.error(f"Failed to list pools: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to list pools: {str(e)}")


# --- Get Pool Info Endpoint ---
@app.get("/datasets/pool/info", summary="Get master pool information")
async def get_pool_info_endpoint(project_key: str = Query(..., description="Project key"), entity_type: str = Query(..., description="Entity type")):
    """
    Get information about a master pool without loading all data.
    """
    if not hasattr(app.state, "pool") or app.state.pool is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database pool not available")

    try:
        info = await get_pool_info(app.state.pool, project_key, entity_type)

        if not info:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No pool found for project={project_key}, entity={entity_type}")

        return info

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get pool info: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get pool info: {str(e)}")


# --- Health Check Models ---
class HealthResponse(BaseModel):
    status: str
    database_pool_operational: bool
    timestamp: datetime
    version: str = "1.0.0"
    python_version: str
    debug_message: Optional[str] = None

# --- Health Check ---
@app.get("/health", response_model=HealthResponse, summary="Perform a health check of the API")
async def health_check_endpoint():
    """
    Provides a comprehensive health check, including the status of the database pool,
    system information, and detailed diagnostics.
    """
    import sys

    db_pool_operational = False
    debug_message = "Database pool not initialized or available."
    timestamp = datetime.utcnow()

    if hasattr(app.state, "pool") and app.state.pool is not None:
        try:
            # Test database connection with a simple query
            async with app.state.pool.acquire() as conn:
                result = await conn.fetchval("SELECT 1")
                if result == 1:
                    db_pool_operational = True
                    debug_message = "Database connection pool is active and responding."
                else:
                    debug_message = "Database query returned unexpected result."
        except PostgresError as e:
            db_pool_operational = False
            debug_message = f"Database connection failed with PostgresError: {e}"
            logger.error(f"Health check DB query failed with PostgresError: {e}")
        except Exception as e:
            db_pool_operational = False
            debug_message = f"Database connection pool exists but failed health check query: {e}"
            logger.error(f"Health check DB query failed: {e}")

    # Determine overall health status
    overall_status = "healthy" if db_pool_operational else "unhealthy"

    logger.debug(f"Health check status: {debug_message}")

    return HealthResponse(
        status=overall_status,
        database_pool_operational=db_pool_operational,
        timestamp=timestamp,
        python_version=f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        debug_message=debug_message,
    )


if __name__ == "__main__":
    app_host = os.environ.get("APP_HOST", "0.0.0.0")
    app_port = int(os.environ.get("APP_PORT", 8000))
    uvicorn.run(app, host=app_host, port=app_port)
