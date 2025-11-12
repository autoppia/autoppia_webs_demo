#!/usr/bin/env python3
"""
Data Generation Utility for Movies Demo
"""

import os
import json
import requests
import asyncio
from typing import List, Dict, Any, Optional

# Configuration
API_URL = os.getenv("API_URL", "http://localhost:8000")
DATA_GENERATION = os.getenv("DATA_GENERATION", "false").lower() == "true"

# Movie interface definition
MOVIE_INTERFACE = """
export interface Movie {
  id: string;
  name: string;
  desc: string;
  year: number;
  img: string;
  director: string;
  cast: string;
  duration: number;
  trailer_url: string;
  rating: number;
  genres: string[];
}
"""

# Example movies
EXAMPLE_MOVIES = [
    {
        "id": "movie-1",
        "name": "The Dark Knight",
        "desc": "A crime thriller about Batman's battle with the Joker.",
        "year": 2008,
        "img": "/media/gallery/dark_knight.jpg",
        "director": "Christopher Nolan",
        "cast": "Christian Bale, Heath Ledger, Aaron Eckhart",
        "duration": 152,
        "trailer_url": "https://youtube.com/watch?v=EXeTwQWrcwY",
        "rating": 4.5,
        "genres": ["Action", "Crime", "Drama"],
    }
]


def is_data_generation_enabled() -> bool:
    """Check if data generation is enabled"""
    return DATA_GENERATION


def get_api_url() -> str:
    """Get the API base URL"""
    return API_URL


async def generate_movies(count: int = 10, categories: Optional[List[str]] = None) -> Dict[str, Any]:
    """Generate movies using the AI API"""
    if not is_data_generation_enabled():
        return {"success": False, "data": [], "count": 0, "generation_time": 0, "error": "Data generation is not enabled"}

    if not categories:
        categories = ["Action", "Drama", "Comedy", "Thriller", "Sci-Fi", "Horror"]

    payload = {
        "interface_definition": MOVIE_INTERFACE,
        "examples": EXAMPLE_MOVIES,
        "count": max(1, min(200, count)),
        "categories": categories,
        "additional_requirements": "Generate realistic movie data with proper genres, directors, and cast information.",
        "naming_rules": {"id": "movie-{number}", "img": "/media/gallery/{name_snake_case}.jpg"},
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


def generate_movies_sync(count: int = 10, categories: Optional[List[str]] = None) -> Dict[str, Any]:
    """Synchronous wrapper for generate_movies"""
    return asyncio.run(generate_movies(count, categories))


def save_generated_movies(movies: List[Dict[str, Any]], filename: str = "generated_movies.json"):
    """Save generated movies to a file"""
    try:
        with open(filename, "w") as f:
            json.dump(movies, f, indent=2)
        return True
    except Exception as e:
        print(f"Failed to save generated movies: {e}")
        return False


def load_generated_movies(filename: str = "generated_movies.json") -> List[Dict[str, Any]]:
    """Load generated movies from a file"""
    try:
        with open(filename, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Failed to load generated movies: {e}")
        return []


def create_movie_objects(movies_data: List[Dict[str, Any]]):
    """Create Django Movie objects from generated data"""
    from movieapp.models import Movie, Genre

    created_movies = []

    for movie_data in movies_data:
        try:
            # Create or get genres
            genre_objects = []
            for genre_name in movie_data.get("genres", []):
                genre, created = Genre.objects.get_or_create(name=genre_name)
                genre_objects.append(genre)

            # Create movie
            movie = Movie.objects.create(
                name=movie_data["name"],
                desc=movie_data["desc"],
                year=movie_data["year"],
                director=movie_data["director"],
                cast=movie_data["cast"],
                duration=movie_data["duration"],
                trailer_url=movie_data["trailer_url"],
                rating=movie_data["rating"],
            )

            # Add genres
            movie.genres.set(genre_objects)

            created_movies.append(movie)

        except Exception as e:
            print(f"Failed to create movie {movie_data.get('name', 'Unknown')}: {e}")
            continue

    return created_movies


def populate_database_with_generated_movies(count: int = 10, categories: Optional[List[str]] = None):
    """Generate movies and populate the database"""
    if not is_data_generation_enabled():
        print("Data generation is not enabled")
        return []

    print(f"Generating {count} movies...")
    result = generate_movies_sync(count, categories)

    if result["success"]:
        print(f"Successfully generated {result['count']} movies in {result['generation_time']:.2f}s")

        # Save to file
        save_generated_movies(result["data"])

        # Create Django objects
        created_movies = create_movie_objects(result["data"])
        print(f"Created {len(created_movies)} movie objects in database")

        return created_movies
    else:
        print(f"Failed to generate movies: {result.get('error', 'Unknown error')}")
        return []


if __name__ == "__main__":
    # Test the data generation
    if is_data_generation_enabled():
        print("Data generation is enabled")
        result = generate_movies_sync(5, ["Action", "Drama"])
        print(f"Result: {result}")
    else:
        print("Data generation is disabled")
