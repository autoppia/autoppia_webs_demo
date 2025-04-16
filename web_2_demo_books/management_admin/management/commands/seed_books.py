import os
import random
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.files import File

from booksapp.models import Book, Genre, Comment
from django.apps import apps


class Command(BaseCommand):
    help = "Resets and seeds the database with books, genres, and comments (optimized version)"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting optimized database seeding..."))

        # Step 1: Reset database (fastest method)
        self._reset_database()

        # Step 2: Create genres in bulk
        genres = self._create_genres()

        # Step 3: Create books in parallel with bulk operations
        books = self._create_books(genres)

        # Step 4: Add comments in bulk
        self._add_comments(books)

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))

    def _reset_database(self):
        """Fastest way to reset all data"""
        self.stdout.write("Resetting database...")
        with ThreadPoolExecutor() as executor:
            for model in apps.get_models():
                executor.submit(model.objects.all().delete)
        self.stdout.write(self.style.SUCCESS("All tables reset."))

    def _create_genres(self):
        """Bulk create genres with conflict handling"""
        from ..books_data import GENRE_NAMES as genre_names

        # Bulk create ignoring conflicts
        Genre.objects.bulk_create([Genre(name=name) for name in genre_names], ignore_conflicts=True)

        # Return dict of name:genre for quick lookup
        return {g.name: g for g in Genre.objects.all()}

    def _create_books(self, genres):
        """Create books with optimized bulk operations"""
        from ..books_data import BOOKS_DATA as books_data

        # Prepare all book objects in memory first
        book_objects = []
        image_tasks = []

        for index in range(1, 256):
            book_data = books_data[index % 10]
            book = Book(
                userId=index,
                name=book_data["name"],
                desc=book_data["desc"],
                year=book_data["year"],
                director=book_data["director"],
                duration=book_data["duration"],
                trailer_url=book_data["trailer_url"],
                rating=book_data["rating"],
                price=book_data["price"],
            )
            book_objects.append(book)

            # Prepare image path for later processing
            file_name = book_data["img_file"]
            local_path = os.path.join(settings.MEDIA_ROOT, "gallery", file_name)
            image_tasks.append((book, local_path, file_name))

        # Bulk create all books at once
        Book.objects.bulk_create(book_objects)

        # Process images in parallel
        self._process_images(image_tasks)

        # Add genres through M2M (optimized)
        all_books = Book.objects.all()
        with ThreadPoolExecutor() as executor:
            for book in all_books:
                book_data = books_data[book.userId % 10]
                executor.submit(book.genres.add, *[genres[name] for name in book_data["genres"]])

        return list(all_books)

    def _process_images(self, image_tasks):
        """Process book images in parallel"""

        def process_task(task):
            book, local_path, file_name = task
            if os.path.exists(local_path):
                with open(local_path, "rb") as f:
                    book.img.save(file_name, File(f))
                    book.save()

        with ThreadPoolExecutor() as executor:
            executor.map(process_task, image_tasks)

    def _add_comments(self, books):
        """Bulk create comments with optimized operations"""
        from ..books_data import SAMPLE_COMMENTS as sample_comments

        # Prepare all comment objects in memory
        comment_objects = []
        now = timezone.now()

        for book in books:
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
                    text = random.choice(sample_comments["positive_comments"])
                elif sentiment == "mixed":
                    text = random.choice(sample_comments["mixed_comments"])
                else:
                    text = random.choice(sample_comments["critical_comments"])

                days_ago = random.randint(1, 60)
                comment_date = now - timedelta(days=days_ago)

                use_male = random.choice([True, False])
                name = random.choice(sample_comments["male_names"] if use_male else sample_comments["female_names"])

                comment_objects.append(Comment(movie=book, name=name, content=text, created_at=comment_date))

        # Bulk create all comments at once
        Comment.objects.bulk_create(comment_objects)
        self.stdout.write(f"Added {len(comment_objects)} comments in bulk.")
