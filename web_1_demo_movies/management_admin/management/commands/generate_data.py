"""
Management command to generate data using OpenAI pipeline
"""

import os
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from movieapp.data_generator import generate_movies_data, generate_genres_data
from movieapp.models import Movie, Genre, Comment
from django.core.files.base import ContentFile
from django.utils import timezone
from datetime import timedelta
import random

from loguru import logger


class Command(BaseCommand):
    help = "Generate movies and genres data using OpenAI pipeline"

    def add_arguments(self, parser):
        parser.add_argument(
            '--movies-count',
            type=int,
            default=10,
            help='Number of movies to generate (default: 10)'
        )
        parser.add_argument(
            '--genres-count', 
            type=int,
            default=10,
            help='Number of genres to generate (default: 10)'
        )
        parser.add_argument(
            '--clear-existing',
            action='store_true',
            help='Clear existing movies and genres before generating new ones'
        )
        parser.add_argument(
            '--add-comments',
            action='store_true',
            help='Add sample comments to generated movies'
        )
        parser.add_argument(
            '--categories',
            type=str,
            help='Comma-separated list of movie categories to focus on'
        )

    def handle(self, *args, **options):
        # Check if data generation is enabled
        if not os.environ.get("ENABLE_DATA_GENERATION", "").lower() in ("true", "1", "yes", "on"):
            self.stdout.write(
                self.style.WARNING(
                    "Data generation is not enabled. Set ENABLE_DATA_GENERATION=true to enable."
                )
            )
            return

        movies_count = options['movies_count']
        genres_count = options['genres_count']
        clear_existing = options['clear_existing']
        add_comments = options['add_comments']
        categories = options['categories']

        # Parse categories if provided
        categories_list = None
        if categories:
            categories_list = [cat.strip() for cat in categories.split(',')]

        self.stdout.write(
            self.style.SUCCESS(f"Starting data generation...")
        )
        logger.info("management_admin.generate_data started: movies=%s genres=%s", movies_count, genres_count)
        self.stdout.write(f"Movies to generate: {movies_count}")
        self.stdout.write(f"Genres to generate: {genres_count}")
        if categories_list:
            self.stdout.write(f"Categories focus: {', '.join(categories_list)}")

        # Clear existing data if requested
        if clear_existing:
            self.stdout.write(self.style.WARNING("Clearing existing data..."))
            Comment.objects.all().delete()
            Movie.objects.all().delete()
            Genre.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("Existing data cleared."))

        # Generate genres first
        self.stdout.write("Generating genres...")
        genres_result = generate_genres_data(genres_count)
        
        if not genres_result.success:
            logger.error("management_admin: generate_genres_data failed: %s", genres_result.error)
            raise CommandError(f"Failed to generate genres: {genres_result.error}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f"Generated and saved {genres_result.count} genres in {genres_result.generation_time:.2f}s"
            )
        )
        logger.info("management_admin: generated %s genres", genres_result.count)

        # Generate movies
        self.stdout.write("Generating movies...")
        movies_result = generate_movies_data(movies_count, categories_list)
        
        if not movies_result.success:
            logger.error("management_admin: generate_movies_data failed: %s", movies_result.error)
            raise CommandError(f"Failed to generate movies: {movies_result.error}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f"Generated and saved {movies_result.count} movies in {movies_result.generation_time:.2f}s"
            )
        )
        logger.info("management_admin: generated %s movies", movies_result.count)

        # Get the created movies for adding comments
        created_movies = Movie.objects.all().order_by('-id')[:movies_result.count]

        # Add comments if requested
        if add_comments and created_movies:
            self.stdout.write("Adding sample comments...")
            self._add_sample_comments(created_movies)

        self.stdout.write(
            self.style.SUCCESS(
                f"Data generation completed successfully! "
                f"Created {movies_result.count} movies and {genres_result.count} genres."
            )
        )
        logger.info("management_admin.generate_data completed: created %s movies and %s genres", movies_result.count, genres_result.count)

    def _add_sample_comments(self, movies):
        """Add sample comments to movies"""
        sample_comments = {
            "male_names": [
                "James", "Michael", "William", "Daniel", "David", "Robert", "John", "Thomas",
                "Matthew", "Christopher", "Joseph", "Andrew", "Edward", "Mark", "Brian"
            ],
            "female_names": [
                "Emma", "Sophia", "Olivia", "Ava", "Isabella", "Mia", "Charlotte", "Amelia",
                "Harper", "Evelyn", "Abigail", "Emily", "Elizabeth", "Sofia", "Madison"
            ],
            "positive_comments": [
                "Absolutely loved this movie! A masterpiece that stands the test of time.",
                "One of the best films I've ever seen. The acting was phenomenal.",
                "Incredible storytelling and direction. This movie deserves all the praise!",
                "The cinematography was breathtaking. Every frame looked like a painting.",
                "A perfect blend of emotion and technical brilliance.",
                "This film had me on the edge of my seat the entire time!",
                "I've watched this multiple times and it gets better with each viewing.",
                "The score perfectly complements the storytelling. A true classic!",
                "Masterful performances by the entire cast. Truly unforgettable.",
                "This movie changed my perspective on cinema. Absolutely brilliant."
            ],
            "mixed_comments": [
                "Good film overall, though some scenes dragged on a bit too long.",
                "Solid performances, but the plot had a few holes I couldn't ignore.",
                "Visually stunning, but the character development felt a bit weak.",
                "Enjoyed it, but I think it's slightly overrated in some aspects.",
                "A good movie that could have been great with some tighter editing.",
                "Interesting concept but the execution was somewhat inconsistent.",
                "Worth watching, though I expected a bit more given all the hype.",
                "Some brilliant moments mixed with a few that didn't quite land."
            ],
            "critical_comments": [
                "Not my cup of tea. I found the pacing to be too slow.",
                "The plot was confusing and hard to follow at times.",
                "I expected more given the high ratings. A bit disappointing.",
                "The characters weren't believable enough for me to get invested.",
                "Technically well-made but emotionally distant."
            ]
        }

        now = timezone.now()
        
        for movie in movies:
            # Determine number of comments for this movie (3-8)
            num_comments = random.randint(3, 8)

            # Generate comments with different sentiment distributions based on rating
            if movie.rating >= 4.5:
                # 80% positive, 15% mixed, 5% critical
                sentiment_weights = [0.8, 0.15, 0.05]
            elif movie.rating >= 4.0:
                # 60% positive, 30% mixed, 10% critical
                sentiment_weights = [0.6, 0.3, 0.1]
            else:
                # 40% positive, 40% mixed, 20% critical
                sentiment_weights = [0.4, 0.4, 0.2]

            for _ in range(num_comments):
                sentiment = random.choices(
                    ["positive", "mixed", "critical"], 
                    weights=sentiment_weights, 
                    k=1
                )[0]

                if sentiment == "positive":
                    comment_text = random.choice(sample_comments["positive_comments"])
                elif sentiment == "mixed":
                    comment_text = random.choice(sample_comments["mixed_comments"])
                else:
                    comment_text = random.choice(sample_comments["critical_comments"])

                # Create a random date in the past 60 days
                days_ago = random.randint(1, 60)
                comment_date = now - timedelta(days=days_ago)

                # Randomly select gender and name
                use_male = random.choice([True, False])
                if use_male:
                    commenter_name = random.choice(sample_comments["male_names"])
                else:
                    commenter_name = random.choice(sample_comments["female_names"])

                Comment.objects.create(
                    movie=movie, 
                    name=commenter_name, 
                    content=comment_text, 
                    created_at=comment_date
                )

            self.stdout.write(f"Added {num_comments} comments to '{movie.name}'")
