"""
Data Generation Utility for Web 1 Movies Demo

This utility provides data generation capabilities for the movies demo project.
It integrates with the OpenAI pipeline through the webs_server API.
"""

import os
from typing import List, Dict, Any, Optional
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from loguru import logger

class DataGenerationResponse:
    """Response object for data generation operations"""
    
    def __init__(self, success: bool, data: List[Dict[str, Any]], count: int, 
                 generation_time: float, error: Optional[str] = None):
        self.success = success
        self.data = data
        self.count = count
        self.generation_time = generation_time
        self.error = error


class MovieDataGenerator:
    """Data generator for movies and related entities"""
    
    def __init__(self):
        self.api_base_url = self._get_api_base_url()
        self.project_key = "web_1_demo_movies"
        self.entity_type = "movies"
        logger.debug(f"MovieDataGenerator initialized with api_base_url={self.api_base_url}")

    def _get_api_base_url(self) -> str:
        """Get the API base URL from environment variables"""
        return (
            os.environ.get("API_URL") or 
            os.environ.get("NEXT_PUBLIC_API_URL") or 
            "http://localhost:8090"
        )

    def is_data_generation_enabled(self) -> bool:
        """Check if data generation is enabled via environment variables"""
        raw = (
            os.environ.get("ENABLE_DATA_GENERATION") or
            os.environ.get("NEXT_PUBLIC_DATA_GENERATION") or
            os.environ.get("NEXT_ENABLE_DATA_GENERATION") or
            ""
        ).lower()
        enabled = raw in ("true", "1", "yes", "on")
        logger.debug(f"is_data_generation_enabled -> {enabled} (raw='{raw}')")
        return enabled

    def _get_movie_interface_definition(self) -> str:
        """Get the TypeScript interface definition for movies"""
        return """
export interface MovieGenerated {
  id: string;
  name: string;
  desc: string;
  year: number;
  director: string;
  cast: string;
  duration: number;
  trailer_url: string;
  rating: number;
  img: string;
  genres: string[];
}
        """.strip()
    
    def _get_movie_examples(self) -> List[Dict[str, Any]]:
        """Get example movies for few-shot generation"""
        return [
            {
                "id": "movie-101",
                "name": "The Shawshank Redemption",
                "desc": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
                "year": 1994,
                "director": "Frank Darabont",
                "cast": "Tim Robbins, Morgan Freeman, Bob Gunton",
                "duration": 142,
                "trailer_url": "https://www.youtube.com/watch?v=6hB3S9bIaco",
                "rating": 4.8,
                "img": "https://images.unsplash.com/photo-1489599808414-4b5b3b5b5b5b?w=640&h=480&fit=crop&auto=format&q=60",
                "genres": ["Drama"]
            },
            {
                "id": "movie-102",
                "name": "The Godfather",
                "desc": "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
                "year": 1972,
                "director": "Francis Ford Coppola",
                "cast": "Marlon Brando, Al Pacino, James Caan",
                "duration": 175,
                "trailer_url": "https://www.youtube.com/watch?v=sY1S34973zA",
                "rating": 4.7,
                "img": "https://images.unsplash.com/photo-1489599808414-4b5b3b5b5b5b?w=640&h=480&fit=crop&auto=format&q=60",
                "genres": ["Crime", "Drama"]
            }
        ]
    
    def _get_movie_categories(self) -> List[str]:
        """Get movie categories for generation"""
        return [
            "Action", "Adventure", "Animation", "Comedy", "Crime", "Biography",
            "Documentary", "Drama", "Fantasy", "Horror", "Mystery", "Romance",
            "Sci-Fi", "Thriller", "War", "Western"
        ]
    
    def _get_naming_rules(self) -> Dict[str, Any]:
        """Get naming rules for generated data"""
        return {
            "id": "movie-{number}",
            "img": "https://images.unsplash.com/photo-{random_movie_hash}?w=640&h=480&fit=crop&auto=format&q=60"
        }
    
    def _get_additional_requirements(self) -> str:
        """Get additional requirements for movie generation"""
        return """
Generate realistic movie records suitable for a movie database. Ensure:
- 'img' uses Unsplash images related to movies/cinema and includes size/quality params
- Provide balanced 'rating' (3.0-5.0), realistic 'year' (1950-2024), and plausible 'duration' (60-240 minutes)
- 'cast' should be comma-separated actor names
- 'genres' should be an array of valid movie genres
- 'trailer_url' should be realistic YouTube URLs
- Prefer distinct 'name' values and avoid duplicates
- 'desc' should be engaging movie descriptions (2-3 sentences)
        """.strip()
    
    def generate_movies(self, count: int = 50, categories: Optional[List[str]] = None) -> DataGenerationResponse:
        """
        Generate movies using the OpenAI pipeline
        
        Args:
            count: Number of movies to generate (1-200)
            categories: Optional list of movie categories to focus on
            
        Returns:
            DataGenerationResponse with generated data
        """
        if not self.is_data_generation_enabled():
            return DataGenerationResponse(
                success=False,
                data=[],
                count=0,
                generation_time=0.0,
                error="Data generation is not enabled. Set ENABLE_DATA_GENERATION=true"
            )
        
        import time
        start_time = time.time()
        logger.info(f"Generate movies: count={count}")

        try:
            # Prepare the request payload
            payload = {
                "interface_definition": self._get_movie_interface_definition(),
                "examples": self._get_movie_examples(),
                "count": max(1, min(200, count)),
                "categories": categories or self._get_movie_categories(),
                "additional_requirements": self._get_additional_requirements(),
                "naming_rules": self._get_naming_rules(),
                "project_key": self.project_key,
                "entity_type": self.entity_type,
                "save_to_db": False,  # Don't save to webs_server DB
                "save_to_file": False  # Don't save to file, we'll save to Django DB
            }

            # Make the API request
            response = requests.post(
                f"{self.api_base_url}/datasets/generate",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=60
            )

            if not response.ok:
                raise Exception(f"API request failed: {response.status_code} - {response.text}")
            
            result = response.json()
            generation_time = time.time() - start_time
            logger.info(f"Received {len(result.get('generated_data', []))} generated items in {generation_time:.2f}s")

            # Save generated data directly to Django database
            saved_data = self._save_movies_to_database(result.get("generated_data", []))
            logger.info(f"Saved {len(saved_data)} movies to DB")

            return DataGenerationResponse(
                success=True,
                data=saved_data,
                count=len(saved_data),
                generation_time=generation_time
            )
            
        except Exception as e:
            generation_time = time.time() - start_time
            logger.error(f"Movie generation failed: {e}")
            return DataGenerationResponse(
                success=False,
                data=[],
                count=0,
                generation_time=generation_time,
                error=str(e)
            )

    def generate_genres(self, count: int = 20) -> DataGenerationResponse:
        """
        Generate movie genres using the OpenAI pipeline

        Args:
            count: Number of genres to generate

        Returns:
            DataGenerationResponse with generated data
        """
        if not self.is_data_generation_enabled():
            return DataGenerationResponse(
                success=False,
                data=[],
                count=0,
                generation_time=0.0,
                error="Data generation is not enabled. Set ENABLE_DATA_GENERATION=true"
            )

        import time
        start_time = time.time()
        logger.info(f"Generate genres: count={count}")

        try:
            # Prepare the request payload for genres
            payload = {
                "interface_definition": """
export interface GenreGenerated {
  id: string;
  name: string;
  description: string;
}
                """.strip(),
                "examples": [
                    {
                        "id": "genre-101",
                        "name": "Action",
                        "description": "Fast-paced movies with physical stunts and chases"
                    },
                    {
                        "id": "genre-102",
                        "name": "Drama",
                        "description": "Serious, plot-driven presentations with realistic characters"
                    }
                ],
                "count": max(1, min(50, count)),
                "categories": ["Action", "Drama", "Comedy", "Horror", "Sci-Fi", "Romance", "Thriller", "Fantasy"],
                "additional_requirements": "Generate realistic movie genre names and descriptions. Focus on common, well-known genres.",
                "naming_rules": {
                    "id": "genre-{number}"
                },
                "project_key": self.project_key,
                "entity_type": "genres",
                "save_to_db": False,  # Don't save to webs_server DB
                "save_to_file": False  # Don't save to file, we'll save to Django DB
            }

            # Make the API request
            response = requests.post(
                f"{self.api_base_url}/datasets/generate",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )

            if not response.ok:
                raise Exception(f"API request failed: {response.status_code} - {response.text}")

            result = response.json()
            generation_time = time.time() - start_time
            logger.info(f"Received {len(result.get('generated_data', []))} generated genres in {generation_time:.2f}s")

            # Save generated data directly to Django database
            saved_data = self._save_genres_to_database(result.get("generated_data", []))
            logger.info(f"Saved {len(saved_data)} genres to DB")

            return DataGenerationResponse(
                success=True,
                data=saved_data,
                count=len(saved_data),
                generation_time=generation_time
            )

        except Exception as e:
            generation_time = time.time() - start_time
            logger.error(f"Genre generation failed: {e}")
            return DataGenerationResponse(
                success=False,
                data=[],
                count=0,
                generation_time=generation_time,
                error=str(e)
            )

    def _save_movies_to_database(self, movies_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Save generated movies to Django database"""
        from django.db import transaction
        from .models import Movie, Genre

        saved_movies = []
        logger.info(f"Saving {len(movies_data)} movies to DB")

        try:
            with transaction.atomic():
                for movie_data in movies_data:
                    try:
                        # Create the movie
                        movie = Movie.objects.create(
                            name=movie_data['name'],
                            desc=movie_data['desc'],
                            year=movie_data['year'],
                            director=movie_data['director'],
                            cast=movie_data['cast'],
                            duration=movie_data['duration'],
                            trailer_url=movie_data['trailer_url'],
                            rating=movie_data['rating']
                        )

                        # Add genres
                        for genre_name in movie_data.get('genres', []):
                            genre, created = Genre.objects.get_or_create(name=genre_name)
                            movie.genres.add(genre)

                        saved_movies.append({
                            'id': movie.id,
                            'name': movie.name,
                            'desc': movie.desc,
                            'year': movie.year,
                            'director': movie.director,
                            'cast': movie.cast,
                            'duration': movie.duration,
                            'trailer_url': movie.trailer_url,
                            'rating': movie.rating,
                            'genres': [g.name for g in movie.genres.all()]
                        })

                        logger.info(f"Saved movie: {movie.name}")

                    except Exception as e:
                        logger.error(f"Failed to save movie '{movie_data.get('name', 'Unknown')}': {e}")
                        continue

        except Exception as e:
            logger.error(f"Database transaction failed: {e}")
            raise

        logger.info(f"_save_movies_to_database completed: saved {len(saved_movies)} movies")
        return saved_movies

    def _save_genres_to_database(self, genres_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Save generated genres to Django database"""
        from django.db import transaction
        from .models import Genre

        saved_genres = []
        logger.info(f"Saving {len(genres_data)} genres to DB")

        try:
            with transaction.atomic():
                for genre_data in genres_data:
                    try:
                        # Create or get the genre
                        genre, created = Genre.objects.get_or_create(
                            name=genre_data['name'],
                            defaults={'name': genre_data['name']}
                        )

                        saved_genres.append({
                            'id': genre.id,
                            'name': genre.name
                        })

                        if created:
                            logger.debug(f"Created genre: {genre.name}")
                        else:
                            logger.debug(f"Genre already exists: {genre.name}")

                    except Exception as e:
                        logger.error(f"Failed to save genre '{genre_data.get('name', 'Unknown')}': {e}")
                        continue

        except Exception as e:
            logger.error(f"Database transaction failed: {e}")
            raise

        logger.info(f"_save_genres_to_database completed: saved {len(saved_genres)} genres")
        return saved_genres


def generate_movies_data(count: int = 50, categories: Optional[List[str]] = None) -> DataGenerationResponse:
    """
    Convenience function to generate movies data

    Args:
        count: Number of movies to generate
        categories: Optional list of movie categories

    Returns:
        DataGenerationResponse with generated data
    """
    generator = MovieDataGenerator()
    return generator.generate_movies(count, categories)


def generate_genres_data(count: int = 20) -> DataGenerationResponse:
    """
    Convenience function to generate genres data

    Args:
        count: Number of genres to generate

    Returns:
        DataGenerationResponse with generated data
    """
    generator = MovieDataGenerator()
    return generator.generate_genres(count)
