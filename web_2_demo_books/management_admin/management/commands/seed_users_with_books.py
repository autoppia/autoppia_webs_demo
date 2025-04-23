import concurrent.futures
import os
import random
import time
import traceback
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from typing import List, Dict, Any

from django.conf import settings as django_settings
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction, connection
from django.utils import timezone

from booksapp.models import Book, Genre, UserProfile, Comment
from ..books_data import BOOKS_DATA, GENRE_NAMES, SAMPLE_COMMENTS

# --- [Ensure BOOKS_DATA has at least 256 entries] ---
if len(BOOKS_DATA) < 256:
    raise ValueError("BOOKS_DATA must contain at least 256 book entries for 1:1 assignment.")


class Command(BaseCommand):
    help = "Seed users with specific books based on ID (User N gets Book N) using BOOKS_DATA"

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
        parser.add_argument("--start", type=int, default=1, help="Starting user number (determines ID range)")
        parser.add_argument("--end", type=int, default=256, help="Ending user number (determines ID range)")
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

    def handle(self, *args, **options):
        start_time = time.time()

        # --- [Argument Validation for 1:1 Mapping] ---
        if options["start"] != 1 or options["end"] != 256:
            self.stdout.write(self.style.WARNING("Warning: For strict User N -> Book N mapping, ensure --start=1 and --end=256."))
        if options["end"] > len(BOOKS_DATA):
            self.stderr.write(self.style.ERROR(f"Error: Cannot assign books 1-to-1. Need {options['end']} book entries in BOOKS_DATA, but found only {len(BOOKS_DATA)}."))
            return  # Exit if not enough book data
        # ---

        # 1. Reset database
        self._reset_database()

        # 2. Ensure genres exist
        genre_map = self._ensure_genres_exist()

        # 3. Create users with their specific books
        all_image_tasks = self._create_users_with_books(options, genre_map)

        # 4. Process images
        self._process_images(all_image_tasks)

        # 5. Add comments
        self._add_comments()

        # 6. Set Increment To 257
        self._set_increment_to_257()

        duration = time.time() - start_time
        self.stdout.write(self.style.SUCCESS(f"Database reset and seeding complete in {duration:.2f}s"))

    def _reset_database(self):
        """Reset relevant database tables efficiently."""
        self.stdout.write("Resetting relevant database tables...")
        start_reset = time.time()

        # Define models to reset (ensure correct order)
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
            db_vendor = connection.vendor
            # Disable FK constraints
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
                    table_name = model._meta.db_table
                    if db_vendor == "postgresql":
                        sequence_name = f"{table_name}_id_seq"
                        # Check if sequence exists before altering
                        cursor.execute(f"SELECT 1 FROM pg_sequences WHERE sequencename = '{sequence_name}'")
                        if cursor.fetchone():
                            cursor.execute(f"ALTER SEQUENCE {sequence_name} RESTART WITH 1;")
                        else:
                            self.stdout.write(self.style.WARNING(f"Sequence {sequence_name} not found for {model.__name__}."))
                    elif db_vendor == "mysql":
                        cursor.execute(f"ALTER TABLE {table_name} AUTO_INCREMENT = 1;")
                    elif db_vendor == "sqlite":
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
        genres_to_create = [Genre(name=name) for name in GENRE_NAMES if name not in existing_genres]

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

        total_to_create = end_num - start_num + 1
        self.stdout.write(f"\nSeeding {total_to_create} users, each assigned their specific book (User N -> Book N) using {max_workers} workers...")

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
                    BOOKS_DATA,
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
                        aggregated[key] += res.get(key, 0)
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
        books_data: List[Dict[str, Any]],
    ) -> tuple[Dict[str, int], List[tuple]]:
        """
        Process a batch of users, profiles, and their assigned books.
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
        # Will hold final (book_object_with_pk, path, filename) tuples
        final_image_tasks = []
        users_to_create: List[User] = []
        user_meta: Dict[str, Dict[str, Any]] = {}  # username -> {intended_id, fav_genre_ids}

        # Prepare User objects
        usernames = [f"{prefix}{i}" for i in range(start_idx, end_idx + 1)]
        try:
            existing_users = set(User.objects.filter(username__in=usernames).values_list("username", flat=True))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"DB Error checking users in batch {start_idx}-{end_idx}: {e}"))
            result["errors"] = len(usernames)
            return result, []

        for i in range(start_idx, end_idx + 1):
            username = f"{prefix}{i}"
            if username in existing_users:
                result["skipped"] += 1
                continue

            book_data_index = i - 1
            if 0 <= book_data_index < len(books_data):
                intended_user_id = books_data[book_data_index].get("id")
                if intended_user_id is not None:
                    users_to_create.append(
                        User(
                            id=intended_user_id,  # Set User ID from books_data
                            username=username,
                            email=f"{username}@example.com",
                            password=prehashed_password,
                            first_name=f"Test{i}",
                            last_name=f"User{i}",
                        )
                    )
                    fav_genre_ids = random.sample(all_genre_ids, k=random.randint(2, min(len(all_genre_ids), 3))) if all_genre_ids else []
                    user_meta[username] = {"intended_id": i, "fav_genre_ids": fav_genre_ids}
                else:
                    self.stderr.write(self.style.WARNING(f"Book data at index {book_data_index} has no 'id'. Skipping user {username}."))
                    result["skipped"] += 1
            else:
                self.stderr.write(self.style.WARNING(f"No book data for index {book_data_index}. Skipping user {username}."))
                result["skipped"] += 1

        if not users_to_create:
            return result, []

        # --- Start Transaction for this Batch ---
        try:
            with transaction.atomic():
                # 1. Bulk Create Users (using IDs from books_data)
                User.objects.bulk_create(users_to_create, ignore_conflicts=True, batch_size=100)
                result["created"] = len(users_to_create)  # Update created count based on actual created

                # 2. Create Profiles
                profiles_to_create: List[UserProfile] = []
                profile_fav_genres_relations = []
                UserProfileFavoriteGenres = UserProfile.favorite_genres.through
                created_user_pks = {user.pk: user for user in User.objects.filter(username__in=[u.username for u in users_to_create])}

                for user_to_create in users_to_create:
                    if user_to_create.pk in created_user_pks:
                        user = created_user_pks[user_to_create.pk]
                        meta = user_meta[user.username]
                        fav_names = [name for name, gid in genre_map.items() if gid in meta["fav_genre_ids"]]
                        profiles_to_create.append(
                            UserProfile(
                                user_id=user.pk,
                                bio=self._generate_bio_optimized(fav_names),
                                location=random.choice(self.LOCATIONS),
                                website=self._generate_website(meta["intended_id"]),
                                profile_pic=profile_pic_path,
                            )
                        )

                # Bulk create profiles
                created_profiles = UserProfile.objects.bulk_create(profiles_to_create, batch_size=100)
                result["profiles_created"] = len(created_profiles)
                # Map user_id to profile_id for M2M
                user_profile_id_map = {profile.user_id: profile.pk for profile in created_profiles}

                for user_to_create in users_to_create:
                    if user_to_create.pk in created_user_pks:
                        user = created_user_pks[user_to_create.pk]
                        user_pk = user.pk
                        if user_pk in user_profile_id_map:
                            profile_id = user_profile_id_map[user_pk]
                            meta = user_meta[user.username]
                            for genre_id in meta["fav_genre_ids"]:
                                profile_fav_genres_relations.append(
                                    UserProfileFavoriteGenres(
                                        userprofile_id=profile_id,
                                        genre_id=genre_id,
                                    )
                                )

                # Bulk create profile M2M relations
                if profile_fav_genres_relations:
                    UserProfileFavoriteGenres.objects.bulk_create(
                        profile_fav_genres_relations,
                        ignore_conflicts=True,
                        batch_size=500,
                    )
                    result["profile_genres"] = len(profile_fav_genres_relations)

                # 3. Prepare and Bulk Create Specific Books + M2M
                books_to_create: List[Book] = []
                book_genre_relations = []  # Prepare M2M relations directly
                BookGenres = Book.genres.through

                created_user_ids = {
                    user.pk
                    for user in User.objects.filter(
                        username__in=[u.username for u in users_to_create]
                    )
                }

                for book_data in books_data:
                    book_id = book_data.get("id")
                    user_id = book_id  # Assuming book ID should match user ID

                    if book_id in created_user_ids:
                        book = Book(
                            id=book_id,
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

                        for genre_name in book_data.get("genres", []):
                            if genre_name in genre_map:
                                book_genre_relations.append(BookGenres(book_id=book_id, genre_id=genre_map[genre_name]))

                        file_name = book_data["img_file"]
                        local_path = os.path.join(django_settings.MEDIA_ROOT, "gallery", file_name)
                        final_image_tasks.append((book, local_path, file_name))

                # Bulk create books - using the IDs from book_data
                if books_to_create:
                    Book.objects.bulk_create(books_to_create, ignore_conflicts=True, batch_size=100)
                    result["books_created"] = len(books_to_create)

                # Bulk create book M2M relations
                if book_genre_relations:
                    BookGenres.objects.bulk_create(book_genre_relations, ignore_conflicts=True, batch_size=500)
                    result["book_genres"] = len(book_genre_relations)

        except Exception as e:
            tb_str = traceback.format_exc()
            self.stderr.write(
                self.style.ERROR(
                    f"Transaction failed for batch {start_idx}-{end_idx}: {e}\n{tb_str}"
                )
            )

            failed_count = end_idx - start_idx + 1 - result["skipped"]
            result["errors"] = failed_count
            result = {k: 0 for k in result}  # Reset counts on failure
            final_image_tasks = []

        return result, final_image_tasks

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
        processed_count = 0
        error_count = 0

        def process_task(task):
            book, local_path, file_name = task
            # Ensure book has a PK before attempting to save image
            if not book.pk:
                self.stderr.write(self.style.ERROR(f"Book object for image '{file_name}' has no PK. Skipping image save."))
                return False, True  # Indicate failure, but count as error

            try:
                if os.path.exists(local_path):
                    with open(local_path, "rb") as f:
                        django_file = File(f, name=file_name)
                        book.img.save(file_name, django_file, save=True)
                    return True, False
                else:
                    # self.stderr.write(self.style.WARNING(f"Image file not found: {local_path} for book {book.pk}. Skipping."))
                    return False, False
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error processing image for book {book.pk} ({file_name}): {e}"))
                return False, True

        with ThreadPoolExecutor(max_workers=4) as executor:  # Limit workers for I/O bound tasks
            results = list(executor.map(process_task, image_tasks))
            processed_count = sum(1 for success, _ in results if success)
            error_count = sum(1 for _, is_error in results if is_error)

        duration_images = time.time() - start_images
        style = self.style.SUCCESS if error_count == 0 else self.style.WARNING
        self.stdout.write(style(f"Processed {processed_count}/{len(image_tasks)} book images in {duration_images:.2f}s. ({error_count} errors)"))

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

    def _set_increment_to_257(self):
        if connection.vendor == "postgresql":
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT setval('auth_user_id_seq', 257, false);"
                )  # Set next val to 257
        elif connection.vendor == "mysql":
            with connection.cursor() as cursor:
                cursor.execute("ALTER TABLE auth_user AUTO_INCREMENT = 257;")
