import concurrent.futures
import os
import random
import time
from datetime import timedelta
from typing import List, Dict, Any

from django.conf import settings as django_settings
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction, connection
from django.utils import timezone
from django.core.files import File
from concurrent.futures import ThreadPoolExecutor

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
        parser.add_argument("--end", type=int, default=256, help="Ending user number")
        parser.add_argument("--prefix", type=str, default="user", help="Username prefix")
        parser.add_argument("--password", type=str, default="password123", help="User password")
        parser.add_argument(
            "--profile-pic",
            type=str,
            default="gallery/people/default_profile.jpg",
            help="Default profile picture path relative to MEDIA_ROOT (e.g., 'gallery/people/default.jpg')",
        )
        parser.add_argument("--batch-size", type=int, default=50, help="Users per batch")
        parser.add_argument("--workers", type=int, default=4, help="Parallel workers")

        # Book creation arguments
        parser.add_argument("--books-per-user", type=int, default=1, help="Books per user")

    def handle(self, *args, **options):
        start_time = time.time()

        # 1. First reset the database
        self._reset_database()

        # 2. Ensure genres exist (optimized) and get a mapping
        genre_map = self._ensure_genres_exist()

        # 3. Create users with their books (optimized M2M and image handling)
        all_image_tasks = self._create_users_with_books(options, genre_map)

        # 4. Process images in bulk after user and book creation
        self._process_images(all_image_tasks)

        # 5. Add comments in bulk
        self._add_comments()

        duration = time.time() - start_time
        self.stdout.write(self.style.SUCCESS(f"Database reset and seeding complete in {duration:.2f}s"))

    def _reset_database(self):
        """Reset relevant database tables efficiently."""
        self.stdout.write("Resetting relevant database tables...")
        start_reset = time.time()

        # Explicitly list models to reset in reverse dependency order (roughly)
        # ManyToMany through models are implicitly handled if defined by Django
        models_to_reset = [
            Comment,
            Book.genres.through,
            UserProfile.favorite_genres.through,
            Book,
            UserProfile,
            Genre,
            User,
        ]

        with connection.cursor() as cursor:
            # Disable foreign key checks (specific to DB backend, example for PostgreSQL/MySQL)
            # Adapt if using a different backend like SQLite
            db_vendor = connection.vendor
            if db_vendor == "postgresql":
                cursor.execute("SET session_replication_role = 'replica';")
            elif db_vendor == "mysql":
                cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")

            deleted_counts = {}
            for model in models_to_reset:
                if not model._meta.managed:  # Skip unmanaged models
                    continue
                try:
                    num_deleted, _ = model.objects.all().delete()
                    deleted_counts[model.__name__] = num_deleted
                    self.stdout.write(f"Deleted {num_deleted} records from {model.__name__}")

                    # Reset sequence/auto-increment counter
                    if db_vendor == "postgresql":
                        table_name = model._meta.db_table
                        sequence_name = f"{table_name}_id_seq"
                        cursor.execute(f"ALTER SEQUENCE {sequence_name} RESTART WITH 1;")
                    elif db_vendor == "mysql":
                        table_name = model._meta.db_table
                        cursor.execute(f"ALTER TABLE {table_name} AUTO_INCREMENT = 1;")
                    elif db_vendor == "sqlite":
                        table_name = model._meta.db_table
                        cursor.execute(f"DELETE FROM sqlite_sequence WHERE name = '{table_name}';")

                except Exception as e:
                    self.stderr.write(self.style.WARNING(f"Could not delete from {model.__name__}: {e} (perhaps table doesn't exist yet?)"))

            # Re-enable foreign key checks
            if db_vendor == "postgresql":
                cursor.execute("SET session_replication_role = 'origin';")
            elif db_vendor == "mysql":
                cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

        duration_reset = time.time() - start_reset
        self.stdout.write(self.style.SUCCESS(f"Database reset complete in {duration_reset:.2f}s."))

    def _ensure_genres_exist(self) -> Dict[str, int]:
        """Ensure genres exist and return a name -> id map."""
        self.stdout.write("Ensuring genres exist...")
        start_genres = time.time()

        existing_genres = {name: pk for name, pk in Genre.objects.values_list("name", "pk")}
        genres_to_create = []
        for name in GENRE_NAMES:
            if name not in existing_genres:
                genres_to_create.append(Genre(name=name))

        if genres_to_create:
            created_genres = Genre.objects.bulk_create(genres_to_create)
            self.stdout.write(f"Created {len(created_genres)} genres")
            # Update the map with newly created genres
            for genre in created_genres:
                existing_genres[genre.name] = genre.pk
        else:
            self.stdout.write("All required genres already exist.")

        duration_genres = time.time() - start_genres
        self.stdout.write(f"Genre setup complete in {duration_genres:.2f}s.")
        return existing_genres  # Return map of name -> id

    def _create_users_with_books(self, options: Dict[str, Any], genre_map: Dict[str, int]) -> List[tuple]:
        """Main method to create users with books (optimized). Returns a list of image tasks."""
        start_num = options["start"]
        end_num = options["end"]
        prefix = options["prefix"]
        plain_password = options["password"]
        profile_pic_path = options["profile_pic"]
        batch_size = options["batch_size"]
        max_workers = options["workers"]
        books_per_user = options["books_per_user"]

        total_to_create = end_num - start_num + 1
        self.stdout.write(f"\nSeeding {total_to_create} users with {books_per_user} books each using {max_workers} workers...")

        prehashed_password = make_password(plain_password)

        batches = [(bstart, min(bstart + batch_size - 1, end_num)) for bstart in range(start_num, end_num + 1, batch_size)]

        start_seeding = time.time()
        aggregated = {
            "created": 0,
            "skipped": 0,
            "errors": 0,
            "books_created": 0,
            "profiles_created": 0,
            "profile_genres": 0,
            "book_genres": 0,
        }
        all_image_tasks = []

        # Prepare shared data
        shuffled_books_data = random.sample(BOOKS_DATA, len(BOOKS_DATA))
        all_genre_ids = list(genre_map.values())

        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_batch = {
                executor.submit(
                    self._process_user_batch,
                    bstart,
                    bend,
                    prefix,
                    prehashed_password,
                    profile_pic_path,
                    genre_map,
                    all_genre_ids,
                    books_per_user,
                    shuffled_books_data,
                ): (bstart, bend)
                for bstart, bend in batches
            }

            completed = 0
            total_batches = len(batches)
            for future in concurrent.futures.as_completed(future_to_batch):
                bstart, bend = future_to_batch[future]
                try:
                    res, image_tasks = future.result()
                    # Aggregate results from the batch processing function
                    for key in aggregated:
                        aggregated[key] += res.get(key, 0)  # Safely get count
                    all_image_tasks.extend(image_tasks)
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"FATAL ERROR in batch {bstart}-{bend}: {repr(e)}"))
                    # Assuming all users in the batch failed if the thread crashed
                    aggregated["errors"] += bend - bstart + 1

                completed += 1
                # Simple progress indicator
                progress = (completed / total_batches) * 100
                print(
                    f"\r --> Progress: {completed}/{total_batches} batches ({progress:.1f}%) - Users: {aggregated['created']}, Books: {aggregated['books_created']}",
                    end="",
                )

        duration_seeding = time.time() - start_seeding
        self.stdout.write("\n\n--- Seeding Summary ---")
        self.stdout.write(f"Total users created:     {aggregated['created']}")
        self.stdout.write(f"Total users skipped:     {aggregated['skipped']}")
        self.stdout.write(f"Total profiles created:  {aggregated['profiles_created']}")
        self.stdout.write(f"Total profile M2M genres:{aggregated['profile_genres']}")
        self.stdout.write(f"Total books created:     {aggregated['books_created']}")
        self.stdout.write(f"Total book M2M genres:   {aggregated['book_genres']}")
        self.stdout.write(f"Total errors:            {aggregated['errors']}")
        self.stdout.write(f"Time taken for seeding:  {duration_seeding:.2f}s\n")

        return all_image_tasks

    def _process_user_batch(
        self,
        start_idx: int,
        end_idx: int,
        prefix: str,
        prehashed_password: str,
        profile_pic_path: str,
        genre_map: Dict[str, int],
        all_genre_ids: List[int],
        books_per_user: int,
        available_books_data: List[Dict[str, Any]],
    ) -> tuple[Dict[str, int], List[tuple]]:
        """
        Process a batch of users, profiles, books, and their M2M relations.
        Returns counts of created items.
        """
        result = {
            "created": 0,
            "skipped": 0,
            "errors": 0,
            "books_created": 0,
            "profiles_created": 0,
            "profile_genres": 0,
            "book_genres": 0,
        }
        image_tasks = []

        usernames = [f"{prefix}{i}" for i in range(start_idx, end_idx + 1)]
        try:
            existing_users = set(User.objects.filter(username__in=usernames).values_list("username", flat=True))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"DB Error checking users in batch {start_idx}-{end_idx}: {e}"))
            result["errors"] = len(usernames)
            return result, image_tasks

        users_to_create: List[User] = []
        user_meta: Dict[str, Dict[str, Any]] = {}

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
            # Select favorite genre IDs for the profile
            num_fav_genres = random.randint(2, min(len(all_genre_ids), 3))
            fav_genre_ids = random.sample(all_genre_ids, num_fav_genres) if all_genre_ids else []
            user_meta[username] = {"num": i, "fav_genre_ids": fav_genre_ids}

        if not users_to_create:
            return result, image_tasks  # Nothing to do in this batch

        # --- Start Transaction for this Batch ---
        try:
            with transaction.atomic():
                # 1. Bulk Create Users
                created_users = User.objects.bulk_create(users_to_create, batch_size=100)
                result["created"] = len(created_users)
                user_id_map = {user.username: user.pk for user in created_users}

                # 2. Prepare and Bulk Create Profiles
                profiles_to_create: List[UserProfile] = []
                profile_fav_genres_relations = []
                UserProfileFavoriteGenres = UserProfile.favorite_genres.through

                for user in created_users:
                    meta = user_meta[user.username]
                    # Generate bio using genre names (need to map back from ID if using templates)
                    fav_genre_names = [name for name, gid in genre_map.items() if gid in meta["fav_genre_ids"]]
                    bio = self._generate_bio_optimized(fav_genre_names)

                    profile = UserProfile(
                        user_id=user.pk,
                        bio=bio,
                        location=random.choice(self.LOCATIONS),
                        website=self._generate_website(meta["num"]),
                        profile_pic=profile_pic_path,
                    )
                    profiles_to_create.append(profile)

                # Bulk create profiles
                created_profiles = UserProfile.objects.bulk_create(profiles_to_create, batch_size=100)
                result["profiles_created"] = len(created_profiles)
                # Map user_id to profile_id for M2M
                user_profile_id_map = {profile.user_id: profile.pk for profile in created_profiles}

                # Prepare M2M for Profile Favorite Genres
                for user in created_users:
                    user_id = user.pk
                    if user_id in user_profile_id_map:  # Check if profile was created successfully
                        profile_id = user_profile_id_map[user_id]
                        meta = user_meta[user.username]
                        for genre_id in meta["fav_genre_ids"]:
                            profile_fav_genres_relations.append(UserProfileFavoriteGenres(userprofile_id=profile_id, genre_id=genre_id))

                # Bulk create profile M2M relations
                if profile_fav_genres_relations:
                    UserProfileFavoriteGenres.objects.bulk_create(
                        profile_fav_genres_relations,
                        ignore_conflicts=True,
                        batch_size=500,
                    )
                    result["profile_genres"] = len(profile_fav_genres_relations)

                # 3. Prepare and Bulk Create Books + M2M
                books_to_create: List[Book] = []
                book_genre_relations = []  # To store M2M relations
                BookGenres = Book.genres.through  # Get the M2M model

                local_books_data = list(available_books_data)
                random.shuffle(local_books_data)
                num_available_books = len(local_books_data)

                for user in created_users:
                    user_id = user_id_map[user.username]
                    assigned_book_indices = set()
                    for _ in range(books_per_user):
                        if len(assigned_book_indices) >= num_available_books:
                            self.stdout.write(self.style.WARNING(f"Not enough unique books in BOOKS_DATA for user {user.username} to get {books_per_user} books."))
                            break

                        while True:
                            book_data_index = random.randint(0, num_available_books - 1)
                            if book_data_index not in assigned_book_indices:
                                assigned_book_indices.add(book_data_index)
                                break

                        book_data = local_books_data[book_data_index]

                        book = Book(
                            userId=user_id,
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

                        # Prepare image path for later processing
                        file_name = book_data["img_file"]
                        local_path = os.path.join(django_settings.MEDIA_ROOT, "gallery", file_name)
                        image_tasks.append((book, local_path, file_name))

                        # Store genre names associated with this book for M2M later
                        user_meta[user.username].setdefault("book_genres", []).append(
                            (
                                book,
                                book_data.get("genres", []),
                            )
                        )

                # Bulk create books
                created_books = Book.objects.bulk_create(books_to_create, batch_size=100)
                result["books_created"] = len(created_books)

                # We need book IDs for M2M. Fetch the necessary fields efficiently.
                # Re-fetch based on user_ids in this batch using values().
                # Ensure your Book model has a field named 'userId' referencing User.
                # Use 'userId_id' to get the raw foreign key value directly.
                created_books_data = Book.objects.filter(userId__in=user_id_map.values()).values(
                    "pk",  # The Book's primary key
                    "userId",  # The User's primary key (FK value)
                    "name",  # The Book's name
                )
                book_id_map = {}  # Build a map: (user_id, book_name) -> book_id
                for b_data in created_books_data:
                    # Use the values directly from the dictionary returned by values()
                    book_id_map[(b_data["userId"], b_data["name"])] = b_data["pk"]

                # Prepare M2M for Book Genres using the fetched IDs
                for user in created_users:
                    user_id = user.pk
                    # Iterate through the book data we stored earlier for this user
                    for temp_book_obj, genre_names in user_meta[user.username].get("book_genres", []):
                        # Find the actual ID of the created book
                        book_key = (user_id, temp_book_obj.name)
                        if book_key in book_id_map:
                            book_id = book_id_map[book_key]
                            for genre_name in genre_names:
                                if genre_name in genre_map:
                                    genre_id = genre_map[genre_name]
                                    book_genre_relations.append(BookGenres(book_id=book_id, genre_id=genre_id))

                # Bulk create book M2M relations
                if book_genre_relations:
                    BookGenres.objects.bulk_create(book_genre_relations, ignore_conflicts=True, batch_size=500)
                    result["book_genres"] = len(book_genre_relations)

        # --- End Transaction ---
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Transaction failed for batch {start_idx}-{end_idx}: {e}"))
            # If transaction fails, none of the counts should be positive
            failed_count = end_idx - start_idx + 1 - result["skipped"]
            result["errors"] = failed_count
            result["created"] = 0
            result["profiles_created"] = 0
            result["profile_genres"] = 0
            result["books_created"] = 0
            result["book_genres"] = 0

        return result, image_tasks

    def _generate_bio_optimized(self, genre_names: List[str]) -> str:
        """Generate a bio based on favorite genre names."""
        if not genre_names:
            return "Book and movie enthusiast."
        # Ensure we have at least two genres for the templates, fallback if needed
        g1 = genre_names[0]
        g2 = genre_names[1] if len(genre_names) > 1 else "Classics"  # Fallback genre
        return random.choice(self.BIO_TEMPLATES).format(genre1=g1, genre2=g2)

    def _generate_website(self, user_num: int) -> str:
        """Generate a website URL for the user."""
        return random.choice(self.WEBSITE_TEMPLATES).format(num=user_num)

    def _process_images(self, image_tasks):
        """Process book images in parallel"""
        self.stdout.write("\nProcessing book images...")
        start_images = time.time()

        def process_task(task):
            book, local_path, file_name = task
            try:
                if os.path.exists(local_path):
                    with open(local_path, "rb") as f:
                        book.img.save(file_name, File(f))
                        book.save()
                        return True
                else:
                    return False
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error processing image for book {book.pk} ({file_name}): {e}"))
                return False

        with ThreadPoolExecutor() as executor:
            results = list(executor.map(process_task, image_tasks))
            processed_count = sum(results)

        duration_images = time.time() - start_images
        self.stdout.write(self.style.SUCCESS(f"Processed {processed_count} book images in {duration_images:.2f}s."))

    def _add_comments(self):
        """Bulk create comments (mostly unchanged, was already good)."""
        start_comments = time.time()

        # Fetch necessary book data efficiently
        books_data = list(Book.objects.values("pk", "rating"))
        if not books_data:
            self.stdout.write(self.style.WARNING("No books found to add comments to."))
            return

        comment_objects = []
        now = timezone.now()
        male_names = SAMPLE_COMMENTS["male_names"]
        female_names = SAMPLE_COMMENTS["female_names"]
        positive_comments = SAMPLE_COMMENTS["positive_comments"]
        mixed_comments = SAMPLE_COMMENTS["mixed_comments"]
        critical_comments = SAMPLE_COMMENTS["critical_comments"]

        for book_info in books_data:
            book_id = book_info["pk"]
            rating = book_info["rating"]
            num_comments = random.randint(3, 8)

            # Determine sentiment weights based on rating
            if rating >= 4.5:
                weights = [0.8, 0.15, 0.05]
            elif rating >= 4.0:
                weights = [0.6, 0.3, 0.1]
            else:
                weights = [0.4, 0.4, 0.2]

            sentiments = random.choices(["positive", "mixed", "critical"], weights=weights, k=num_comments)

            for sentiment in sentiments:
                if sentiment == "positive":
                    text = random.choice(positive_comments)
                elif sentiment == "mixed":
                    text = random.choice(mixed_comments)
                else:
                    text = random.choice(critical_comments)

                days_ago = random.randint(1, 60)
                comment_date = now - timedelta(days=days_ago)

                use_male = random.choice([True, False])
                name = random.choice(male_names if use_male else female_names)

                comment_objects.append(
                    Comment(
                        movie_id=book_id,
                        name=name,
                        content=text,
                        created_at=comment_date,
                    )
                )

        # Bulk create all comments at once
        if comment_objects:
            Comment.objects.bulk_create(comment_objects, batch_size=500)
            duration_comments = time.time() - start_comments
            self.stdout.write(self.style.SUCCESS(f"Added {len(comment_objects)} comments in {duration_comments:.2f}s."))
        else:
            self.stdout.write(self.style.WARNING("No comments generated."))
