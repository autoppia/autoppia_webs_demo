#!/usr/bin/env python3
"""
Data Generation Utility for Books Demo
"""

import os
import json
import requests
import asyncio
from typing import List, Dict, Any, Optional

# Configuration
API_URL = os.getenv("API_URL", "http://localhost:8000")
DATA_GENERATION = os.getenv("DATA_GENERATION", "false").lower() == "true"

# Book interface definition
BOOK_INTERFACE = """
export interface Book {
  id: string;
  name: string;
  desc: string;
  year: number;
  img: string;
  director: string;
  duration: number;
  trailer_url: string;
  rating: number;
  price: number;
  genres: string[];
}
"""

# Example books
EXAMPLE_BOOKS = [
    {
        "id": "book-1",
        "name": "The Great Gatsby",
        "desc": "A classic American novel about the Jazz Age.",
        "year": 1925,
        "img": "/media/gallery/great_gatsby.jpg",
        "director": "F. Scott Fitzgerald",
        "duration": 180,
        "trailer_url": "https://youtube.com/watch?v=example",
        "rating": 4.8,
        "price": 12.99,
        "genres": ["Fiction", "Classic", "Literature"],
    }
]


def is_data_generation_enabled() -> bool:
    """Check if data generation is enabled"""
    return DATA_GENERATION


def get_api_url() -> str:
    """Get the API base URL"""
    return API_URL


async def generate_books(count: int = 10, categories: Optional[List[str]] = None) -> Dict[str, Any]:
    """Generate books using the AI API"""
    if not is_data_generation_enabled():
        return {"success": False, "data": [], "count": 0, "generation_time": 0, "error": "Data generation is not enabled"}

    if not categories:
        categories = ["Fiction", "Non-Fiction", "Mystery", "Romance", "Sci-Fi", "Biography"]

    payload = {
        "interface_definition": BOOK_INTERFACE,
        "examples": EXAMPLE_BOOKS,
        "count": max(1, min(200, count)),
        "categories": categories,
        "additional_requirements": "Generate realistic book data with proper genres, authors, and pricing.",
        "naming_rules": {"id": "book-{number}", "img": "/media/gallery/{name_snake_case}.jpg"},
    }

    try:
        response = requests.post(f"{API_URL}/datasets/generate", json=payload, timeout=60)

        if response.status_code == 200:
            result = response.json()
            return {"success": True, "data": result.get("generated_data", []), "count": result.get("count", 0), "generation_time": result.get("generation_time", 0)}
        else:
            return {"success": False, "data": [], "count": 0, "generation_time": 0, "error": f"API request failed with status {response.status_code}"}
    except Exception as e:
        return {"success": False, "data": [], "count": 0, "generation_time": 0, "error": str(e)}


def generate_books_sync(count: int = 10, categories: Optional[List[str]] = None) -> Dict[str, Any]:
    """Synchronous wrapper for generate_books"""
    return asyncio.run(generate_books(count, categories))


def save_generated_books(books: List[Dict[str, Any]], filename: str = "generated_books.json"):
    """Save generated books to a file"""
    try:
        with open(filename, "w") as f:
            json.dump(books, f, indent=2)
        return True
    except Exception as e:
        print(f"Failed to save generated books: {e}")
        return False


def load_generated_books(filename: str = "generated_books.json") -> List[Dict[str, Any]]:
    """Load generated books from a file"""
    try:
        with open(filename, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Failed to load generated books: {e}")
        return []


def create_book_objects(books_data: List[Dict[str, Any]], user_id: int = 1):
    """Create Django Book objects from generated data"""
    from booksapp.models import Book, Genre
    from django.contrib.auth.models import User

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        # Create a default user if none exists
        user = User.objects.create_user(username="default_user", email="default@example.com", password="default_password")

    created_books = []

    for book_data in books_data:
        try:
            # Create or get genres
            genre_objects = []
            for genre_name in book_data.get("genres", []):
                genre, created = Genre.objects.get_or_create(name=genre_name)
                genre_objects.append(genre)

            # Create book
            book = Book.objects.create(
                user=user,
                name=book_data["name"],
                desc=book_data["desc"],
                year=book_data["year"],
                director=book_data["director"],
                duration=book_data["duration"],
                trailer_url=book_data["trailer_url"],
                rating=book_data["rating"],
                price=book_data["price"],
            )

            # Add genres
            book.genres.set(genre_objects)

            created_books.append(book)

        except Exception as e:
            print(f"Failed to create book {book_data.get('name', 'Unknown')}: {e}")
            continue

    return created_books


def populate_database_with_generated_books(count: int = 10, categories: Optional[List[str]] = None, user_id: int = 1):
    """Generate books and populate the database"""
    if not is_data_generation_enabled():
        print("Data generation is not enabled")
        return []

    print(f"Generating {count} books...")
    result = generate_books_sync(count, categories)

    if result["success"]:
        print(f"Successfully generated {result['count']} books in {result['generation_time']:.2f}s")

        # Save to file
        save_generated_books(result["data"])

        # Create Django objects
        created_books = create_book_objects(result["data"], user_id)
        print(f"Created {len(created_books)} book objects in database")

        return created_books
    else:
        print(f"Failed to generate books: {result.get('error', 'Unknown error')}")
        return []


if __name__ == "__main__":
    # Test the data generation
    if is_data_generation_enabled():
        print("Data generation is enabled")
        result = generate_books_sync(5, ["Fiction", "Mystery"])
        print(f"Result: {result}")
    else:
        print("Data generation is disabled")
