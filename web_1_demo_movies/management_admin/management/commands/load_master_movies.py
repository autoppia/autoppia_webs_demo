"""
Management command to load all movies from movies_1.json into the database.
All movies are stored with v2_master=True (or a special marker) so they can be
filtered deterministically by seed later.
"""
import json
import os
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from movieapp.models import Movie, Genre


class Command(BaseCommand):
    help = "Load all movies from movies_1.json into database as master pool"

    def add_arguments(self, parser):
        parser.add_argument(
            '--json-path',
            type=str,
            help='Path to movies_1.json file (default: auto-detect)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing master movies before loading',
        )

    def handle(self, *args, **options):
        # Determine JSON path
        json_path = options.get('json_path')
        if not json_path:
            # Try to find movies_1.json in common locations
            possible_paths = [
                '/app/data/web_1_demo_movies/data/movies_1.json',  # In container
                os.path.join(settings.BASE_DIR, '..', '..', 'webs_server', 'initial_data', 'web_1_demo_movies', 'data', 'movies_1.json'),
                os.path.join(settings.BASE_DIR, 'webs_server', 'initial_data', 'web_1_demo_movies', 'data', 'movies_1.json'),
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    json_path = path
                    break
            
            if not json_path:
                self.stdout.write(self.style.ERROR("Could not find movies_1.json. Please specify --json-path"))
                return
        
        if not os.path.exists(json_path):
            self.stdout.write(self.style.ERROR(f"File not found: {json_path}"))
            return
        
        self.stdout.write(f"Loading movies from: {json_path}")
        
        # Clear existing master movies if requested
        if options.get('clear'):
            deleted = Movie.objects.filter(v2_master=True).delete()
            self.stdout.write(self.style.SUCCESS(f"Cleared {deleted[0]} existing master movies"))
        
        # Load JSON
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                movies_data = json.load(f)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error reading JSON: {e}"))
            return
        
        if not isinstance(movies_data, list):
            self.stdout.write(self.style.ERROR("JSON file must contain a list of movies"))
            return
        
        movie_count = len(movies_data)
        self.stdout.write(f"Found {movie_count} movies in JSON")
        
        # Warn if less than 256 (recommended minimum for proper seed distribution)
        if movie_count < 256:
            self.stdout.write(
                self.style.WARNING(
                    f"⚠️  Warning: Only {movie_count} movies found. "
                    f"Minimum 256 recommended for proper seed distribution across 1-300 seeds."
                )
            )
        else:
            self.stdout.write(self.style.SUCCESS(f"✅ Pool size ({movie_count}) is sufficient for seed distribution"))
        
        # Create or get genres
        genres_map = {}
        all_genre_names = set()
        for movie_data in movies_data:
            genres = movie_data.get('genres', [])
            if isinstance(genres, list):
                for genre_name in genres:
                    if isinstance(genre_name, str):
                        all_genre_names.add(genre_name)
                    elif isinstance(genre_name, dict):
                        all_genre_names.add(genre_name.get('name', ''))
        
        for genre_name in all_genre_names:
            if genre_name:
                genre, created = Genre.objects.get_or_create(name=genre_name)
                genres_map[genre_name] = genre
                if created:
                    self.stdout.write(f"Created genre: {genre_name}")
        
        # Load movies
        created_count = 0
        updated_count = 0
        skipped_count = 0
        
        for idx, movie_data in enumerate(movies_data, 1):
            try:
                # Extract fields
                movie_id = movie_data.get('id') or movie_data.get('movie_id', f'master_{idx}')
                title = movie_data.get('title') or movie_data.get('name', 'Untitled')
                description = movie_data.get('description') or movie_data.get('desc', '')
                year = movie_data.get('year', 2020)
                image_path = movie_data.get('image_path') or movie_data.get('img', '')
                director = movie_data.get('director', '')
                cast = movie_data.get('cast', [])
                if isinstance(cast, list):
                    cast = ', '.join(cast)
                duration = movie_data.get('duration', 105)
                trailer_url = movie_data.get('trailer_url', '')
                rating = movie_data.get('rating', 0.0)
                genres = movie_data.get('genres', [])
                
                # Create or update movie
                movie, created = Movie.objects.update_or_create(
                    v2_dataset_id=f'master_{movie_id}',
                    v2_seed=None,  # Master movies have no seed
                    defaults={
                        'name': title,
                        'desc': description,
                        'year': year,
                        'img': image_path if image_path else None,
                        'director': director,
                        'cast': cast,
                        'duration': duration,
                        'trailer_url': trailer_url,
                        'rating': rating,
                        'v2_master': True,  # Mark as master pool movie
                    }
                )
                
                # Set genres
                movie.genres.clear()
                for genre_item in genres:
                    if isinstance(genre_item, str):
                        genre_name = genre_item
                    elif isinstance(genre_item, dict):
                        genre_name = genre_item.get('name', '')
                    else:
                        continue
                    
                    if genre_name and genre_name in genres_map:
                        movie.genres.add(genres_map[genre_name])
                
                if created:
                    created_count += 1
                else:
                    updated_count += 1
                
                if idx % 50 == 0:
                    self.stdout.write(f"Processed {idx}/{len(movies_data)} movies...")
                    
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Error processing movie {idx}: {e}"))
                skipped_count += 1
                continue
        
        self.stdout.write(self.style.SUCCESS(
            f"\n✅ Load complete:\n"
            f"   Created: {created_count}\n"
            f"   Updated: {updated_count}\n"
            f"   Skipped: {skipped_count}\n"
            f"   Total master movies in DB: {Movie.objects.filter(v2_master=True).count()}"
        ))

