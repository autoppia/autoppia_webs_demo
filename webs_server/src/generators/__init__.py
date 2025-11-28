"""
Data generators module.

Contains utilities for intelligent data generation using AI.
"""

from .smart_generator import (
    build_generation_prompt_from_examples,
    get_project_entity_metadata,
    load_example_data,
    infer_typescript_interface,
)

__all__ = [
    "build_generation_prompt_from_examples",
    "get_project_entity_metadata",
    "load_example_data",
    "infer_typescript_interface",
]
