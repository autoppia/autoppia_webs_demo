"""
Smart data generator that automatically infers structure from existing data.

This module provides utilities to generate data for any project/entity by:
1. Reading existing example data from initial_data/{project_key}/data/{entity_type}_1.json
2. Using those examples to generate a prompt for OpenAI
3. Generating new data with the same structure
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

# Base path for initial data (inside container: /app/data)
BASE_DATA_PATH = Path(os.getenv("BASE_DATA_PATH", "/app/data"))


def load_example_data(project_key: str, entity_type: str, max_examples: int = 3) -> List[Dict[str, Any]]:
    """
    Load example data from initial_data directory.

    Args:
        project_key: Project key (e.g., 'web_5_autocrm')
        entity_type: Entity type (e.g., 'logs', 'clients')
        max_examples: Maximum number of examples to load

    Returns:
        List of example objects
    """
    # Try to load from initial_data first
    data_file = BASE_DATA_PATH / project_key / "data" / f"{entity_type}_1.json"

    if not data_file.exists():
        raise FileNotFoundError(f"No example data found at {data_file}")

    with open(data_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError(f"Expected list in {data_file}, got {type(data)}")

    if len(data) == 0:
        raise ValueError(f"No examples found in {data_file}")

    # Return up to max_examples
    return data[-max_examples:]


def infer_typescript_interface(examples: List[Dict[str, Any]], entity_type: str) -> str:
    """
    Infer a TypeScript interface from example data.

    Args:
        examples: List of example objects
        entity_type: Entity type name

    Returns:
        TypeScript interface string
    """
    if not examples:
        return f"interface {entity_type.capitalize()} {{ [key: string]: any; }}"

    # Get all keys from all examples
    all_keys = set()
    for example in examples:
        all_keys.update(example.keys())

    # Infer types for each key
    interface_lines = [f"interface {entity_type.capitalize()} {{"]

    for key in sorted(all_keys):
        # Try to infer type from first example that has this key
        value = None
        for example in examples:
            if key in example:
                value = example[key]
                break

        if value is None:
            type_str = "any"
        elif isinstance(value, bool):
            type_str = "boolean"
        elif isinstance(value, int):
            type_str = "number"
        elif isinstance(value, float):
            type_str = "number"
        elif isinstance(value, str):
            type_str = "string"
        elif isinstance(value, list):
            type_str = "any[]"
        elif isinstance(value, dict):
            type_str = "object"
        else:
            type_str = "any"

        # Check if key is optional (missing in some examples)
        is_optional = not all(key in example for example in examples)
        optional_marker = "?" if is_optional else ""

        interface_lines.append(f"  {key}{optional_marker}: {type_str};")

    interface_lines.append("}")
    return "\n".join(interface_lines)


def build_generation_prompt_from_examples(project_key: str, entity_type: str, count: int = 200, additional_requirements: Optional[str] = None) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Build a complete generation prompt by reading existing examples.

    Args:
        project_key: Project key (e.g., 'web_5_autocrm')
        entity_type: Entity type (e.g., 'logs', 'clients')
        count: Number of items to generate
        additional_requirements: Optional additional requirements

    Returns:
        Tuple of (interface_definition, examples)
    """
    examples = load_example_data(project_key, entity_type, max_examples=3)
    interface_definition = infer_typescript_interface(examples, entity_type)

    return interface_definition, examples


def get_project_entity_metadata(project_key: str, entity_type: str) -> Dict[str, Any]:
    """
    Get metadata about a project/entity combination.

    Returns:
        Dict with metadata like description, categories, etc.
    """
    # Define known metadata for common entity types
    metadata_map = {
        "web_1_autocinema": {
            "movies": {
                "description": "Movie catalog entries",
                "categories": ["Action", "Adventure", "Animation", "Comedy", "Documentary", "Drama", "Fantasy", "Romance", "Sci-Fi", "Thriller"],
                "requirements": "Include realistic movie titles, descriptions, years (1900-2025), durations (60-180 minutes), ratings (0-5), directors, cast arrays, trailer URLs, image paths, genres arrays, and category field.",
            }
        },
        "web_2_autobooks": {
            "books": {
                "description": "Book catalog entries",
                "categories": ["Adventure", "Drama", "Education", "Fantasy", "Fiction", "Historical Fiction", "Horror", "Literary", "Mystery", "Nonfiction", "Romance", "Science", "Sci-Fi", "Thriller"],
                "requirements": "Include realistic book titles, descriptions, years (1900-2025), durations (pages: 200-1000), ratings (0-5), authors (director field), cast arrays (optional), purchase URLs (trailer_url field), image paths, genres arrays, and optional price field.",
            }
        },
        "web_5_autocrm": {
            "logs": {
                "description": "Time tracking logs for legal work",
                "categories": ["Billable", "Billed", "Non-billable"],
                "requirements": "Include realistic legal matters, client names, hours (0.5-8h), dates, and descriptions.",
            },
            "clients": {"description": "Legal clients", "categories": ["Active", "Inactive", "Pending"], "requirements": "Include realistic company names, emails, and matter counts."},
            "matters": {
                "description": "Legal matters/cases",
                "categories": ["Litigation", "Corporate", "IP", "Real Estate"],
                "requirements": "Include realistic case titles, client assignments, and status.",
            },
            "events": {"description": "Calendar events", "categories": ["Meeting", "Court Date", "Deadline", "Call"], "requirements": "Include realistic event types, dates, and descriptions."},
            "files": {"description": "Legal documents", "categories": ["Contract", "Brief", "Motion", "Evidence"], "requirements": "Include realistic file names, types, and sizes."},
        },
        "web_4_autodining": {
            "restaurants": {
                "description": "Restaurants",
                "categories": ["Italian", "Mexican", "Asian", "American", "Mediterranean"],
                "requirements": "Include realistic restaurant names, cuisines, areas, ratings, and prices.",
            }
        },
        "web_3_autozone": {
            "products": {
                "description": "E-commerce products across kitchen, electronics, home, fitness, and technology",
                "categories": ["Kitchen", "Electronics", "Home", "Fitness", "Technology"],
                "requirements": "Return objects with id, title, $price string, description, category, rating (1-5), brand, boolean inStock, and image paths that can be local (/images/...) or Unsplash URLs.",
            }
        },
        "web_6_automail": {
            "emails": {"description": "Email messages", "categories": ["inbox", "sent", "draft", "trash"], "requirements": "Include realistic senders, subjects, previews, dates, and priorities."}
        },
        "web_7_autodelivery": {
            "restaurants": {
                "description": "Delivery restaurants",
                "categories": ["Fast Food", "Pizza", "Asian", "Healthy", "Desserts"],
                "requirements": "Include realistic restaurant names, cuisines, delivery times, and ratings.",
            }
        },
        "web_9_autoconnect": {
            "users": {
                "description": "Professional network users",
                "categories": ["Engineering", "Design", "Product", "Marketing"],
                "requirements": "Include usernames, names, avatars, bios, titles, and 1-3 experience entries with company, duration, and description.",
            },
            "posts": {
                "description": "Social feed posts",
                "categories": ["Announcement", "Advice", "Highlight", "Launch"],
                "requirements": "Include linked user info, 1-3 sentence content, timestamps in the last week, likes count, comments array, and optional image URLs.",
            },
            "jobs": {
                "description": "Job listings",
                "categories": ["Full-time", "Contract", "Remote"],
                "requirements": "Include title, company, location, salary, requirements list, benefits, posted date, application count, company size, industry, and remote flag.",
            },
            "recommendations": {
                "description": "Recommended people or opportunities",
                "categories": ["User", "Job", "Learning", "Event"],
                "requirements": "Include title, description, reason, relevance score, category, hero image, and metadata such as location, company, or skills.",
            },
        },
        "web_10_autowork": {
            "jobs": {
                "description": "Freelance job listings",
                "categories": ["Open", "Assigned", "In progress", "Completed"],
                "requirements": "Include project titles, statuses, start dates, tracked time, activity summaries, and whether the job is currently active.",
            },
            "hires": {
                "description": "Freelancer profiles",
                "categories": ["Developers", "Designers", "Data", "Marketing"],
                "requirements": "Include name, country, hourly rate, rating, job count, role, avatar, and a boolean rehire flag.",
            },
            "experts": {
                "description": "Expert talent marketplace profiles",
                "categories": ["Product", "Design", "Engineering", "Marketing", "Data"],
                "requirements": "Include slug, consultation rate, stats (earnings/jobs/hours), languages, availability, and nested lastReview information.",
            },
            "skills": {
                "description": "Popular marketplace skills",
                "categories": ["Programming", "Design", "Cloud", "AI", "Security"],
                "requirements": "Return diverse skill names as simple strings.",
            },
        },
        "web_11_autocalendar": {
            "calendar_events": {
                "description": "Calendar events with recurrence and attendees",
                "categories": ["Work", "Personal", "Wellness", "Friends", "Family"],
                "requirements": "Each event must include a unique id, date, numeric start and end hours, label, calendar category, color, startTime and endTime arrays, description, location, allDay flag, recurrence type with optional recurrenceEndDate, attendees list, reminder offsets in minutes, busy status, visibility level, and an optional meeting link."
            }
        },
        "web_12_autolist": {
            "tasks": {
                "description": "Productivity tasks with priorities and due dates",
                "categories": ["Inbox", "Today", "Upcoming", "Completed"],
                "requirements": "Include title, description, due_date, priority (1-4), and optional completed_at timestamp.",
            }
        },
        "web_13_autodrive": {
            "trips": {
                "description": "Ride bookings (upcoming/completed/cancelled)",
                "categories": ["upcoming", "completed", "cancelled"],
                "requirements": "Include ride info (pickup, dropoff, date, time, price, driver details, payment) with realistic strings and status.",
            }
        },
        "web_8_autolodge": {
            "hotels": {
                "description": "Hotel and accommodation listings",
                "categories": ["Lake Tahoe", "Goa", "Zermatt", "Bali", "Tokyo", "Paris", "New York", "Barcelona"],
                "requirements": "Include realistic hotel titles, locations, ratings, reviews, guest capacity, bedrooms, beds, baths, dates, prices, host info (name, since years, avatar), and amenities array with icon, title, and desc.",
            }
        },
    }

    project_meta = metadata_map.get(project_key, {})
    entity_meta = project_meta.get(entity_type, {"description": f"{entity_type} for {project_key}", "categories": [], "requirements": "Generate realistic, diverse data."})

    return entity_meta
