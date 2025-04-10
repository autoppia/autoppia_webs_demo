import random
import time
import concurrent.futures

from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.db import transaction
from movieapp.models import UserProfile, Genre


class Command(BaseCommand):
    help = "Seed many test users quickly using bulk_create, with optional parallelization."

    def add_arguments(self, parser):
        parser.add_argument("--start", type=int, default=1, help="Starting user number (default: 1)")
        parser.add_argument("--end", type=int, default=255, help="Ending user number (default: 255)")
        parser.add_argument(
            "--prefix",
            type=str,
            default="user",
            help='Username prefix (default: "user")',
        )
        parser.add_argument(
            "--password",
            type=str,
            default="password123",
            help='Plain-text password for all users (default: "password123")',
        )
        parser.add_argument(
            "--profile-pic",
            type=str,
            default="/media/gallery/people/default_profile.jpg",
            help='Path/URL of profile pic for all users (default: "/media/gallery/people/default_profile.jpg")',
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=500,
            help="Number of users per batch (default: 500)",
        )
        parser.add_argument(
            "--workers",
            type=int,
            default=4,
            help="Number of parallel workers for seeding (default: 4)",
        )

    def handle(self, *args, **options):
        start_num = options["start"]
        end_num = options["end"]
        prefix = options["prefix"]
        plain_password = options["password"]
        profile_pic_url = options["profile_pic"]
        batch_size = options["batch_size"]
        max_workers = options["workers"]

        total_to_create = end_num - start_num + 1
        self.stdout.write(f"\nSeeding {total_to_create} users in batches of {batch_size}...")

        # Pre-hash the password once (dummy hashed password for all users)
        # This drastically reduces CPU overhead from repeated password hashing.
        prehashed_password = make_password(plain_password)

        # Gather all genres for random assignment (optional).
        all_genres = list(Genre.objects.all())

        # Build batch ranges
        batches = []
        for bstart in range(start_num, end_num + 1, batch_size):
            bend = min(bstart + batch_size - 1, end_num)
            batches.append((bstart, bend))

        # Start timer
        start_time = time.time()

        # We'll collect aggregated results here
        aggregated = {"created": 0, "skipped": 0, "errors": 0}

        self.stdout.write(f"Running with up to {max_workers} parallel workers...\n")

        # Use ThreadPoolExecutor or ProcessPoolExecutor.
        # ThreadPool is often enough, but if you suspect CPU-bound tasks, you may try ProcessPool.
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_batch = {}
            for bstart, bend in batches:
                future = executor.submit(
                    self.process_batch,
                    bstart,
                    bend,
                    prefix,
                    prehashed_password,
                    profile_pic_url,
                    all_genres,
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
                except Exception as e:
                    self.stderr.write(f"ERROR in batch {bstart}-{bend}: {repr(e)}")
                    # If there's an unhandled exception, assume the entire batch is an error
                    aggregated["errors"] += bend - bstart + 1

                completed += 1
                self.stdout.write(f" --> Completed {completed}/{total_batches} batches.")

        duration = time.time() - start_time
        self.stdout.write("\n--- Seeding Summary ---")
        self.stdout.write(f"Total created: {aggregated['created']}")
        self.stdout.write(f"Total skipped: {aggregated['skipped']}")
        self.stdout.write(f"Total errors:  {aggregated['errors']}")
        self.stdout.write(f"Time taken:    {duration:.2f}s\n")

        self.stdout.write(self.style.SUCCESS("Seeding complete."))

    def process_batch(
        self,
        start_idx,
        end_idx,
        prefix,
        prehashed_password,
        profile_pic_url,
        all_genres,
    ):
        """
        Process a single batch of users:
          1) Check which of them already exist (skip those).
          2) Bulk-create the rest in a single transaction.
          3) Bulk-create corresponding UserProfile rows.
          4) Optionally assign random favorite genres.
        Returns dict with {created, skipped, errors}.
        """
        result = {"created": 0, "skipped": 0, "errors": 0}

        # Build the list of prospective usernames
        usernames_in_batch = [f"{prefix}{i}" for i in range(start_idx, end_idx + 1)]

        # Find which of these already exist
        existing_usernames = set(User.objects.filter(username__in=usernames_in_batch).values_list("username", flat=True))

        # Build up the list of user objects that do NOT exist yet
        users_to_create = []
        # We also keep track of (username -> i) index to help with building profile data
        user_index_map = {}

        for i in range(start_idx, end_idx + 1):
            username = f"{prefix}{i}"
            if username in existing_usernames:
                result["skipped"] += 1
                continue
            user_index_map[username] = i
            users_to_create.append(
                User(
                    username=username,
                    email=f"{username}@example.com",
                    password=prehashed_password,
                    first_name=f"Test{i}",
                    last_name=f"User{i}",
                )
            )

        if not users_to_create:
            # Nothing new to create in this batch
            return result

        # We'll pick random data for profiles
        bio_templates = [
            "I'm a passionate movie enthusiast who loves {genre1} and {genre2}.",
            "Cinephile with a taste for {genre1} and {genre2} classics!",
            "When not watching {genre1}, you'll find me exploring {genre2} hits.",
            "Always up for a great {genre1} or {genre2} movie!",
        ]
        locations = [
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
        website_templates = [
            "https://moviefan{num}.example.com",
            "https://cinemalover{num}.example.org",
            "https://filmcritics{num}.example.net",
            "https://movienight{num}.example.io",
        ]

        try:
            with transaction.atomic():
                # 1) Bulk-create the users
                created_users = User.objects.bulk_create(users_to_create, batch_size=len(users_to_create))
                result["created"] = len(created_users)

                # 2) Bulk-create the corresponding profiles
                profiles_to_create = []
                for user in created_users:
                    # Randomly choose 2 "fake" genres, or real ones if they exist
                    if all_genres:
                        selected_genres = random.sample(all_genres, min(len(all_genres), random.randint(2, 4)))
                        g1 = selected_genres[0].name
                        g2 = selected_genres[1].name if len(selected_genres) > 1 else "Drama"
                    else:
                        g1, g2 = "Action", "Drama"

                    bio = random.choice(bio_templates).format(genre1=g1, genre2=g2)
                    loc = random.choice(locations)
                    web = random.choice(website_templates).format(num=user_index_map[user.username])

                    profiles_to_create.append(
                        UserProfile(
                            user=user,
                            bio=bio,
                            location=loc,
                            website=web,
                            profile_pic=profile_pic_url,
                        )
                    )

                UserProfile.objects.bulk_create(profiles_to_create, batch_size=len(profiles_to_create))

                # 3) Optionally assign favorite genres if desired (M2M). This is typically
                #    done with multiple insert statements, but can be done in a second pass:
                # for profile, selected_genres in zip(profiles_to_create, <something>):
                #     profile.favorite_genres.add(*selected_genres)

        except Exception:
            # If the transaction fails, mark them all as errors
            result["errors"] = len(users_to_create)

        return result
