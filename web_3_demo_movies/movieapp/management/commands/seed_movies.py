import os
from django.core.management.base import BaseCommand
from django.core.files.images import ImageFile
from django.core.files.base import ContentFile
from django.utils.text import slugify
import requests
from io import BytesIO
from movieapp.models import Movie, Genre
import random

class Command(BaseCommand):
    help = "Seeds the database with initial movies and genres"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting to seed the database..."))
        
        # Create genres
        genres_to_create = [
            "Action", "Adventure", "Animation", "Comedy", "Crime", 
            "Documentary", "Drama", "Fantasy", "Horror", "Mystery",
            "Romance", "Sci-Fi", "Thriller", "War", "Western"
        ]
        
        genres = {}
        for genre_name in genres_to_create:
            genre, created = Genre.objects.get_or_create(name=genre_name)
            genres[genre_name] = genre
            status = "Created" if created else "Already exists"
            self.stdout.write(f"{status}: Genre '{genre_name}'")
        
        # Sample movie data
        movies_data = [
            {
                "name": "The Shawshank Redemption",
                "desc": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
                "year": 1994,
                "director": "Frank Darabont",
                "cast": "Tim Robbins, Morgan Freeman, Bob Gunton",
                "duration": 142,
                "trailer_url": "https://www.youtube.com/watch?v=6hB3S9bIaco",
                "rating": 4.8,
                "img_url": "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
                "genres": ["Drama"]
            },
            {
                "name": "The Godfather",
                "desc": "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
                "year": 1972,
                "director": "Francis Ford Coppola",
                "cast": "Marlon Brando, Al Pacino, James Caan",
                "duration": 175,
                "trailer_url": "https://www.youtube.com/watch?v=sY1S34973zA",
                "rating": 4.7,
                "img_url": "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
                "genres": ["Crime", "Drama"]
            },
            {
                "name": "The Dark Knight",
                "desc": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                "year": 2008,
                "director": "Christopher Nolan",
                "cast": "Christian Bale, Heath Ledger, Aaron Eckhart",
                "duration": 152,
                "trailer_url": "https://www.youtube.com/watch?v=EXeTwQWrcwY",
                "rating": 4.7,
                "img_url": "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
                "genres": ["Action", "Crime", "Drama", "Thriller"]
            },
            {
                "name": "Pulp Fiction",
                "desc": "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
                "year": 1994,
                "director": "Quentin Tarantino",
                "cast": "John Travolta, Uma Thurman, Samuel L. Jackson",
                "duration": 154,
                "trailer_url": "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
                "rating": 4.6,
                "img_url": "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
                "genres": ["Crime", "Drama"]
            },
            {
                "name": "Inception",
                "desc": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                "year": 2010,
                "director": "Christopher Nolan",
                "cast": "Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page",
                "duration": 148,
                "trailer_url": "https://www.youtube.com/watch?v=YoHD9XEInc0",
                "rating": 4.5,
                "img_url": "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
                "genres": ["Action", "Adventure", "Sci-Fi", "Thriller"]
            },
            {
                "name": "The Lord of the Rings: The Fellowship of the Ring",
                "desc": "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
                "year": 2001,
                "director": "Peter Jackson",
                "cast": "Elijah Wood, Ian McKellen, Orlando Bloom",
                "duration": 178,
                "trailer_url": "https://www.youtube.com/watch?v=V75dMMIW2B4",
                "rating": 4.6,
                "img_url": "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_.jpg",
                "genres": ["Action", "Adventure", "Drama", "Fantasy"]
            },
            {
                "name": "Forrest Gump",
                "desc": "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other historical events unfold through the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.",
                "year": 1994,
                "director": "Robert Zemeckis",
                "cast": "Tom Hanks, Robin Wright, Gary Sinise",
                "duration": 142,
                "trailer_url": "https://www.youtube.com/watch?v=bLvqoHBptjg",
                "rating": 4.6,
                "img_url": "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
                "genres": ["Drama", "Romance"]
            },
            {
                "name": "The Matrix",
                "desc": "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
                "year": 1999,
                "director": "Lana Wachowski, Lilly Wachowski",
                "cast": "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
                "duration": 136,
                "trailer_url": "https://www.youtube.com/watch?v=vKQi3bBA1y8",
                "rating": 4.5,
                "img_url": "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
                "genres": ["Action", "Sci-Fi"]
            },
            {
                "name": "Goodfellas",
                "desc": "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito in the Italian-American crime syndicate.",
                "year": 1990,
                "director": "Martin Scorsese",
                "cast": "Robert De Niro, Ray Liotta, Joe Pesci",
                "duration": 146,
                "trailer_url": "https://www.youtube.com/watch?v=qo5jJpHtI1Y",
                "rating": 4.6,
                "img_url": "https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDgtN2RjYy00YzM1LWI4ZmQtMjIwYjFjNmI3ZGEwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
                "genres": ["Biography", "Crime", "Drama"]
            },
            {
                "name": "Interstellar",
                "desc": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                "year": 2014,
                "director": "Christopher Nolan",
                "cast": "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
                "duration": 169,
                "trailer_url": "https://www.youtube.com/watch?v=zSWdZVtXT7E",
                "rating": 4.5,
                "img_url": "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
                "genres": ["Adventure", "Drama", "Sci-Fi"]
            }
        ]
        
        # First check if movies already exist
        if Movie.objects.count() > 0:
            self.stdout.write(self.style.WARNING("Movies already exist in the database. Do you want to delete all existing movies? (yes/no)"))
            confirm = input()
            if confirm.lower() != 'yes':
                self.stdout.write(self.style.SUCCESS("Seeding cancelled."))
                return
            else:
                Movie.objects.all().delete()
                self.stdout.write(self.style.SUCCESS("All existing movies deleted."))
        
        # Create movies
        for movie_data in movies_data:
            try:
                # Download image
                response = requests.get(movie_data['img_url'])
                response.raise_for_status()  # Ensure we got a successful response
                
                # Create file name
                file_name = f"{slugify(movie_data['name'])}.jpg"
                
                # Create movie instance
                movie = Movie(
                    name=movie_data['name'],
                    desc=movie_data['desc'],
                    year=movie_data['year'],
                    director=movie_data['director'],
                    cast=movie_data['cast'],
                    duration=movie_data['duration'],
                    trailer_url=movie_data['trailer_url'],
                    rating=movie_data['rating']
                )
                
                # Save image to model
                movie.img.save(file_name, ContentFile(response.content), save=True)
                
                # Add genres
                for genre_name in movie_data['genres']:
                    if genre_name in genres:
                        movie.genres.add(genres[genre_name])
                
                self.stdout.write(self.style.SUCCESS(f"Created: Movie '{movie_data['name']}'"))
                
            except requests.RequestException as e:
                self.stdout.write(self.style.ERROR(f"Error downloading image for {movie_data['name']}: {e}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating movie {movie_data['name']}: {e}"))
        
        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))