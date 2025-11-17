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
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        raise ValueError(f"Expected list in {data_file}, got {type(data)}")
    
    if len(data) == 0:
        raise ValueError(f"No examples found in {data_file}")
    
    # Return up to max_examples
    return data[:max_examples]


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


def build_generation_prompt_from_examples(
    project_key: str,
    entity_type: str,
    count: int = 200,
    additional_requirements: Optional[str] = None
) -> Tuple[str, List[Dict[str, Any]]]:
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
        "web_5_autocrm": {
            "logs": {
                "description": "Time tracking logs for legal work",
                "categories": ["Billable", "Billed", "Non-billable"],
                "requirements": "Include realistic legal matters, client names, hours (0.5-8h), dates, and descriptions."
            },
            "clients": {
                "description": "Legal clients",
                "categories": ["Active", "Inactive", "Pending"],
                "requirements": "Include realistic company names, emails, and matter counts."
            },
            "matters": {
                "description": "Legal matters/cases",
                "categories": ["Litigation", "Corporate", "IP", "Real Estate"],
                "requirements": "Include realistic case titles, client assignments, and status."
            },
            "events": {
                "description": "Calendar events",
                "categories": ["Meeting", "Court Date", "Deadline", "Call"],
                "requirements": "Include realistic event types, dates, and descriptions."
            },
            "files": {
                "description": "Legal documents",
                "categories": ["Contract", "Brief", "Motion", "Evidence"],
                "requirements": "Include realistic file names, types, and sizes."
            }
        },
        "web_4_autodining": {
            "restaurants": {
                "description": "Restaurants",
                "categories": ["Italian", "Mexican", "Asian", "American", "Mediterranean"],
                "requirements": "Include realistic restaurant names, cuisines, areas, ratings, and prices."
            }
        },
        "web_6_automail": {
            "emails": {
                "description": "Email messages",
                "categories": ["inbox", "sent", "draft", "trash"],
                "requirements": "Include realistic senders, subjects, previews, dates, and priorities."
            }
        },
        "web_7_autodelivery": {
            "restaurants": {
                "description": "Delivery restaurants",
                "categories": ["Fast Food", "Pizza", "Asian", "Healthy", "Desserts"],
                "requirements": "Include realistic restaurant names, cuisines, delivery times, and ratings."
            }
        }
    }
    
    project_meta = metadata_map.get(project_key, {})
    entity_meta = project_meta.get(entity_type, {
        "description": f"{entity_type} for {project_key}",
        "categories": [],
        "requirements": "Generate realistic, diverse data."
    })
    
    return entity_meta

