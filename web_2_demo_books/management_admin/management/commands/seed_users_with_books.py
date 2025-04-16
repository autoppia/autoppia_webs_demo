import concurrent.futures
import os
import random
import time
from datetime import timedelta

from django.apps import apps
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from booksapp.models import Book, Genre, UserProfile, Comment
from ..books_data import BOOKS_DATA, GENRE_NAMES, SAMPLE_COMMENTS


class Command(BaseCommand):
    help = "Seed users with their own books using actual BOOKS_DATA"

    # Constants for profile generation
    LOCATIONS = [
        "New York, USA",
        "Los Angeles, USA",
        "London, UK",
        "Tokyo, Japan",
        "Paris, France",
        "Berlin, Germany",
        "Sydney, Australia",
        "Toronto, Canada",
        "Mumbai, India",
        "Seoul, South Korea",
        "Mexico City, Mexico",
        "Rome, Italy",
    ]

    BIO_TEMPLATES = [
        "I'm a passionate book enthusiast who loves {genre1} and {genre2}.",
        "Cinephile with a taste for {genre1} and {genre2} classics!",
        "When not watching {genre1}, you'll find me exploring {genre2} hits.",
        "Always up for a great {genre1} or {genre2} book!",
    ]

    WEBSITE_TEMPLATES = [
        "https://moviefan{num}.example.com",
        "https://cinemalover{num}.example.org",
        "https://filmcritics{num}.example.net",
        "https://movienight{num}.example.io",
    ]

    def add_arguments(self, parser):
        # User creation arguments
        parser.add_argument("--start", type=int, default=1, help="Starting user number")
        parser.add_argument("--end", type=int, default=255, help="Ending user number")
        parser.add_argument("--prefix", type=str, default="user", help="Username prefix")
        parser.add_argument("--password", type=str, default="password123", help="User password")
        parser.add_argument("--profile-pic", type=str, default="/media/gallery/people/default_profile.jpg", help="Default profile picture path")
        parser.add_argument("--batch-size", type=int, default=50, help="Users per batch")
        parser.add_argument("--workers", type=int, default=4, help="Parallel workers")

        # Book creation arguments
        parser.add_argument("--books-per-user", type=int, default=1, help="Books per user")

    def handle(self, *args, **options):
        start_time = time.time()

        # 1. First reset the database
        self._reset_database()

        # 2. Create genres from BOOKS_DATA
        self._ensure_genres_exist()
        all_genres = list(Genre.objects.all())

        # 3. Create users with their books
        self._create_users_with_books(options, all_genres)

        # 4. Add comments in bulk
        self._add_comments()

        duration = time.time() - start_time
        self.stdout.write(self.style.SUCCESS(f"Database reset and seeding complete in {duration:.2f}s"))

    def _reset_database(self):
        """Completely reset all database tables"""
        self.stdout.write("Resetting database...")

        # Get all models in dependency order (child models first)
        models = apps.get_models()
        ordered_models = sorted(models, key=lambda m: len(m._meta.get_fields()), reverse=True)

        # Delete in serial since we're using ThreadPool
        for model in ordered_models:
            deleted = model.objects.all().delete()
            self.stdout.write(f"Deleted {deleted[0]} records from {model.__name__}")

        self.stdout.write(self.style.SUCCESS("Database reset complete."))

    def _ensure_genres_exist(self):
        """Create genres from BOOKS_DATA if they don't exist"""
        self.stdout.write("Creating genres...")

        # Create all genres in one bulk operation
        genres_to_create = [Genre(name=name) for name in GENRE_NAMES if not Genre.objects.filter(name=name).exists()]

        if genres_to_create:
            Genre.objects.bulk_create(genres_to_create)
            self.stdout.write(f"Created {len(genres_to_create)} genres")
        else:
            self.stdout.write("All genres already exist")

    def _create_users_with_books(self, options, all_genres):
        """Main method to create users with books"""
        start_num = options["start"]
        end_num = options["end"]
        prefix = options["prefix"]
        plain_password = options["password"]
        profile_pic_url = options["profile_pic"]
        batch_size = options["batch_size"]
        max_workers = options["workers"]
        books_per_user = options["books_per_user"]

        total_to_create = end_num - start_num + 1
        self.stdout.write(f"\nSeeding {total_to_create} users with {books_per_user} books each...")

        # Pre-hash the password once for all users
        prehashed_password = make_password(plain_password)

        # Build batch ranges
        batches = []
        for bstart in range(start_num, end_num + 1, batch_size):
            bend = min(bstart + batch_size - 1, end_num)
            batches.append((bstart, bend))

        # Start timer
        start_time = time.time()

        # Track results
        aggregated = {"created": 0, "skipped": 0, "errors": 0, "books_created": 0}

        self.stdout.write(f"Running with up to {max_workers} parallel workers...\n")

        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_batch = {}
            for bstart, bend in batches:
                future = executor.submit(
                    self._process_user_batch,
                    bstart,
                    bend,
                    prefix,
                    prehashed_password,
                    profile_pic_url,
                    all_genres,
                    books_per_user,
                )
                future_to_batch[future] = (bstart, bend)

            completed = 0
            total_batches = len(batches)
            for future in concurrent.futures.as_completed(future_to_batch):
                (bstart, bend) = future_to_batch[future]
                try:
                    res = future.result()
                    aggregated["created"] += res["created"]
                    aggregated["skipped"] += res["skipped"]
                    aggregated["errors"] += res["errors"]
                    aggregated["books_created"] += res["books_created"]
                except Exception as e:
                    self.stderr.write(f"ERROR in batch {bstart}-{bend}: {repr(e)}")
                    aggregated["errors"] += bend - bstart + 1

                completed += 1
                self.stdout.write(f" --> Completed {completed}/{total_batches} batches")

        duration = time.time() - start_time
        self.stdout.write("\n--- Seeding Summary ---")
        self.stdout.write(f"Total users created: {aggregated['created']}")
        self.stdout.write(f"Total users skipped: {aggregated['skipped']}")
        self.stdout.write(f"Total books created: {aggregated['books_created']}")
        self.stdout.write(f"Total errors:       {aggregated['errors']}")
        self.stdout.write(f"Time taken:         {duration:.2f}s\n")

    def _process_user_batch(
        self,
        start_idx,
        end_idx,
        prefix,
        prehashed_password,
        profile_pic_url,
        all_genres,
        books_per_user,
    ):
        """
        Process a batch of users with their books in a single transaction
        Returns dict with created, skipped, errors, and books_created counts
        """
        result = {"created": 0, "skipped": 0, "errors": 0, "books_created": 0}

        # Build usernames and check existing ones
        usernames = [f"{prefix}{i}" for i in range(start_idx, end_idx + 1)]
        existing_users = set(User.objects.filter(username__in=usernames).values_list("username", flat=True))

        # Prepare users to create
        users_to_create = []
        user_meta = {}  # Stores additional user info needed for profiles

        for i in range(start_idx, end_idx + 1):
            username = f"{prefix}{i}"
            if username in existing_users:
                result["skipped"] += 1
                continue

            user = User(
                username=username,
                email=f"{username}@example.com",
                password=prehashed_password,
                first_name=f"Test{i}",
                last_name=f"User{i}",
            )
            users_to_create.append(user)
            user_meta[username] = {"num": i, "genres": random.sample(all_genres, min(len(all_genres), random.randint(2, 3))) if all_genres else []}

        if not users_to_create:
            return result

        try:
            with transaction.atomic():
                # 1. Bulk create users
                created_users = User.objects.bulk_create(users_to_create)
                result["created"] = len(created_users)

                # 2. Create profiles with favorite genres
                profiles = []
                for user in created_users:
                    meta = user_meta[user.username]
                    genres = meta["genres"]

                    profile = UserProfile(
                        user=user,
                        bio=self._generate_bio(genres),
                        location=random.choice(self.LOCATIONS),
                        website=self._generate_website(meta["num"]),
                        profile_pic=profile_pic_url,
                    )
                    profiles.append(profile)

                UserProfile.objects.bulk_create(profiles)

                # Add favorite genres after profiles exist
                for profile, user in zip(profiles, created_users):
                    if user_meta[user.username]["genres"]:
                        profile.favorite_genres.add(*user_meta[user.username]["genres"])

                # 3. Create books for users
                books_created = self._create_user_books(created_users, books_per_user, all_genres)
                result["books_created"] = books_created

        except Exception as e:
            self.stderr.write(f"Transaction failed: {str(e)}")
            result["errors"] = len(users_to_create)
            result["created"] = 0
            result["books_created"] = 0

        return result

    def _create_user_books(self, users, books_per_user, all_genres):
        """Create books for a batch of users ensuring:
        1. All books are properly assigned to users
        2. No null userId violations
        3. Unique book assignments per user
        """
        # Create all needed books in one pass
        books_to_create = []
        book_genres = []
        books_created = 0

        # Create a shuffled copy of BOOKS_DATA for assignment
        shuffled_books = random.sample(BOOKS_DATA, len(BOOKS_DATA))
        book_index = 0

        with transaction.atomic():
            for user in users:
                for _ in range(books_per_user):
                    if book_index >= len(shuffled_books):
                        # If we run out of books, reshuffle
                        shuffled_books = random.sample(BOOKS_DATA, len(BOOKS_DATA))
                        book_index = 0

                    book_data = shuffled_books[book_index]
                    book_index += 1

                    book = Book(
                        userId=user.id,
                        name=book_data["name"],
                        desc=book_data["desc"],
                        year=book_data["year"],
                        director=book_data["director"],
                        duration=book_data["duration"],
                        trailer_url=book_data["trailer_url"],
                        rating=book_data["rating"],
                        price=book_data["price"],
                    )
                    books_to_create.append(book)

                    # Store genre relationships
                    genres = [g for g in all_genres if g.name in book_data["genres"]]
                    book_genres.append((book, genres))
                    books_created += 1

            # Bulk create books
            Book.objects.bulk_create(books_to_create)

            # Assign genres
            for book, genres in book_genres:
                if genres:
                    book.genres.add(*genres)

                # Handle image upload
                book_data = next(b for b in BOOKS_DATA if b["name"] == book.name)
                file_name = book_data["img_file"]
                local_path = os.path.join(settings.MEDIA_ROOT, "gallery", file_name)
                if os.path.exists(local_path):
                    with open(local_path, "rb") as f:
                        book.img.save(file_name, File(f))
                        book.save()

        return books_created

    def _generate_bio(self, genres):
        """Generate a bio based on favorite genres"""
        if not genres:
            return "Book and movie enthusiast."

        genre1 = genres[0].name
        genre2 = genres[1].name if len(genres) > 1 else "Drama"
        return random.choice(self.BIO_TEMPLATES).format(genre1=genre1, genre2=genre2)

    def _generate_website(self, user_num):
        """Generate a website URL for the user"""
        return random.choice(self.WEBSITE_TEMPLATES).format(num=user_num)

    def _add_comments(self):
        """Bulk create comments with optimized operations"""
        existing_books = [book for book in Book.objects.all()]

        # Prepare all comment objects in memory
        comment_objects = []
        now = timezone.now()

        for book in existing_books:
            num_comments = random.randint(3, 8)

            # Determine sentiment distribution
            if book.rating >= 4.5:
                weights = [0.8, 0.15, 0.05]  # positive, mixed, critical
            elif book.rating >= 4.0:
                weights = [0.6, 0.3, 0.1]
            else:
                weights = [0.4, 0.4, 0.2]

            for _ in range(num_comments):
                sentiment = random.choices(["positive", "mixed", "critical"], weights=weights, k=1)[0]

                if sentiment == "positive":
                    text = random.choice(SAMPLE_COMMENTS["positive_comments"])
                elif sentiment == "mixed":
                    text = random.choice(SAMPLE_COMMENTS["mixed_comments"])
                else:
                    text = random.choice(SAMPLE_COMMENTS["critical_comments"])

                days_ago = random.randint(1, 60)
                comment_date = now - timedelta(days=days_ago)

                use_male = random.choice([True, False])
                name = random.choice(SAMPLE_COMMENTS["male_names"] if use_male else SAMPLE_COMMENTS["female_names"])

                comment_objects.append(Comment(movie=book, name=name, content=text, created_at=comment_date))

        # Bulk create all comments at once
        Comment.objects.bulk_create(comment_objects)
        self.stdout.write(f"Added {len(comment_objects)} comments in bulk.")
