from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from movieapp.models import UserProfile, Genre
from django.core.files.base import ContentFile
import os
import random


class Command(BaseCommand):
    help = 'Create multiple test users with profiles (from user1 to user255)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--start',
            type=int,
            default=1,
            help='Starting user number (default: 1)'
        )
        parser.add_argument(
            '--end',
            type=int,
            default=255,
            help='Ending user number (default: 255)'
        )
        parser.add_argument(
            '--prefix',
            type=str,
            default='user',
            help='Username prefix (default: "user")'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='password123',
            help='Password for all users (default: "password123")'
        )

    def handle(self, *args, **options):
        start_num = options['start']
        end_num = options['end']
        username_prefix = options['prefix']
        default_password = options['password']

        # Bio options for variety
        bio_templates = [
            "I'm a passionate movie enthusiast who loves all genres, especially {genre1} and {genre2}. Always looking for new films to discover and discuss!",
            "Film buff with a special interest in {genre1}. I also enjoy {genre2} when I'm in the mood for something different.",
            "When I'm not watching {genre1} movies, you can find me exploring {genre2} classics. Been a cinephile since childhood.",
            "I review {genre1} and {genre2} films on my blog. Open to recommendations and discussions about cinema!"
        ]

        # Location options
        locations = [
            "New York, USA", "Los Angeles, USA", "London, UK", "Tokyo, Japan", 
            "Paris, France", "Berlin, Germany", "Sydney, Australia", "Toronto, Canada",
            "Mumbai, India", "Seoul, South Korea", "Mexico City, Mexico", "Rome, Italy"
        ]

        # Website templates
        website_templates = [
            "https://movieblog{num}.example.com",
            "https://filmreviews{num}.example.org",
            "https://cinema{num}.example.net",
            "https://movies{num}.example.io"
        ]

        # Get all available genres for random assignment
        all_genres = list(Genre.objects.all())
        if not all_genres:
            self.stdout.write(self.style.WARNING("No genres found in database. Users will be created without favorite genres."))

        # Get available profile pictures
        profile_pic_dir = os.path.join('media', 'gallery', 'people')
        profile_pics = []
        if os.path.exists(profile_pic_dir):
            profile_pics = [f for f in os.listdir(profile_pic_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]

        # Create users from start_num to end_num
        created_count = 0
        skipped_count = 0
        error_count = 0

        for i in range(start_num, end_num + 1):
            username = f"{username_prefix}{i}"
            email = f"{username}@example.com"

            # Check if user already exists
            if User.objects.filter(username=username).exists():
                self.stdout.write(self.style.WARNING(f"User '{username}' already exists, skipping."))
                skipped_count += 1
                continue

            try:
                # Create user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=f"{default_password}{i}",
                    first_name=f"Test{i}",
                    last_name=f"User{i}"
                )

                # Create or get UserProfile
                profile, created = UserProfile.objects.get_or_create(user=user)

                # Randomly select genres if available
                user_genres = []
                if all_genres:
                    # Select 2-4 random genres
                    num_genres = random.randint(2, min(4, len(all_genres)))
                    user_genres = random.sample(all_genres, num_genres)

                # Set random bio with genre placeholders
                genre1 = user_genres[0].name if user_genres else "Action"
                genre2 = user_genres[1].name if len(user_genres) > 1 else "Drama"
                bio_template = random.choice(bio_templates)
                profile.bio = bio_template.format(genre1=genre1, genre2=genre2)

                # Set random location
                profile.location = random.choice(locations)

                # Set website with user number
                website_template = random.choice(website_templates)
                profile.website = website_template.format(num=i)

                # Set random profile picture if available
                if profile_pics:
                    profile_pic_name = random.choice(profile_pics)
                    profile_pic_path = os.path.join(profile_pic_dir, profile_pic_name)

                    try:
                        with open(profile_pic_path, 'rb') as f:
                            profile.profile_pic.save(f'profile_{i}.jpg', ContentFile(f.read()), save=False)
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f"Error setting profile picture for {username}: {e}"))

                # Add favorite genres
                if user_genres:
                    for genre in user_genres:
                        profile.favorite_genres.add(genre)

                # Save profile
                profile.save()
                created_count += 1

                # Progress indicator (every 10 users or at the end)
                if i % 10 == 0 or i == end_num:
                    self.stdout.write(f"Progress: Created {created_count} users so far...")

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating user {username}: {e}"))
                error_count += 1

        # Final summary
        self.stdout.write(self.style.SUCCESS(f"Completed: Created {created_count} users"))
        if skipped_count > 0:
            self.stdout.write(self.style.WARNING(f"Skipped {skipped_count} existing users"))
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f"Encountered {error_count} errors"))

        self.stdout.write(f"Users created with username format: {username_prefix}[1-{end_num}]")
        self.stdout.write(f"Email format: {username_prefix}[1-{end_num}]@example.com")
        self.stdout.write(f"Password for all users: {default_password}")
