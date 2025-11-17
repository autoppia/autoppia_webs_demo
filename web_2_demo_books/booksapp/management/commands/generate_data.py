from django.core.management.base import BaseCommand, CommandError
import os
import sys

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from data_generator import populate_database_with_generated_books, is_data_generation_enabled


class Command(BaseCommand):
    help = "Generate book data using AI"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=10, help="Number of books to generate (default: 10)")
        parser.add_argument("--categories", nargs="+", default=["Fiction", "Non-Fiction", "Mystery", "Romance", "Sci-Fi", "Biography"], help="Categories to focus on")
        parser.add_argument("--user-id", type=int, default=1, help="User ID to associate books with (default: 1)")
        parser.add_argument("--force", action="store_true", help="Force generation even if data generation is disabled")

    def handle(self, *args, **options):
        count = options["count"]
        categories = options["categories"]
        user_id = options["user_id"]
        force = options["force"]

        if not is_data_generation_enabled() and not force:
            self.stdout.write(self.style.WARNING("Data generation is disabled. Set ENABLE_DYNAMIC_V2_AI_GENERATE=true or use --force"))
            return

        if not force and not is_data_generation_enabled():
            self.stdout.write(self.style.ERROR("Data generation is not enabled. Set ENABLE_DYNAMIC_V2_AI_GENERATE=true"))
            return

        self.stdout.write(f"Generating {count} books with categories: {', '.join(categories)}")

        try:
            created_books = populate_database_with_generated_books(count, categories, user_id)

            if created_books:
                self.stdout.write(self.style.SUCCESS(f"Successfully created {len(created_books)} books"))

                # Display some statistics
                from booksapp.models import Book, Genre

                total_books = Book.objects.count()
                total_genres = Genre.objects.count()

                self.stdout.write(f"Total books in database: {total_books}")
                self.stdout.write(f"Total genres in database: {total_genres}")
            else:
                self.stdout.write(self.style.WARNING("No books were created"))

        except Exception as e:
            raise CommandError(f"Failed to generate books: {e}")
