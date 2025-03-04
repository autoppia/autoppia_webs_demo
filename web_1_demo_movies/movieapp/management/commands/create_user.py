from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from movieapp.models import UserProfile, Genre
from django.core.files.base import ContentFile
import os

class Command(BaseCommand):
    help = 'Create a test user with profile'

    def handle(self, *args, **options):
        username = 'test1234'
        email = 'test1234@gmail.com'
        password = 'test1234'

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f"User '{username}' already exists."))
            return

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name='Test',
            last_name='User'
        )

        # Create or get UserProfile
        profile, created = UserProfile.objects.get_or_create(user=user)

        # Set profile details
        profile.bio = "I'm a passionate movie enthusiast who loves all genres, especially sci-fi and drama. Always looking for new films to discover and discuss!"
        profile.location = "New York, USA"
        profile.website = "https://movieblog.example.com"

        # Set profile picture (if file exists)
        try:
            profile_pic_path = os.path.join('media', 'gallery', 'people', 'person3.jpg')
            if os.path.exists(profile_pic_path):
                with open(profile_pic_path, 'rb') as f:
                    profile.profile_pic.save('profile.jpg', ContentFile(f.read()), save=False)
            else:
                self.stdout.write(self.style.WARNING(f"Profile picture file not found at {profile_pic_path}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error setting profile picture: {e}"))

        # Add favorite genres
        try:
            favorite_genre_names = ['Drama', 'Sci-Fi', 'Thriller', 'Action']
            for genre_name in favorite_genre_names:
                genre = Genre.objects.get(name=genre_name)
                profile.favorite_genres.add(genre)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error adding favorite genres: {e}"))

        # Save profile
        profile.save()

        self.stdout.write(self.style.SUCCESS(f"Created user: {username}"))
        self.stdout.write(f"Email: {email}")
        self.stdout.write(f"Password: {password}")