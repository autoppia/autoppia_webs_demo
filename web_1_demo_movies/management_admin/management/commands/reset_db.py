import os
import time

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Reset the database and seed it with initial data"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_time = 0
        self.force = False

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            dest="force",
            help="Force reset without confirmation",
        )
        parser.add_argument(
            "--skip-seed",
            action="store_true",
            dest="skip_seed",
            help="Skip seeding data after reset",
        )
        parser.add_argument(
            "--skip-migrate",
            action="store_true",
            dest="skip_migrate",
            help="Skip running migrations after reset",
        )

    def handle(self, *args, **options):
        self.force = options["force"]
        self.start_time = time.time()

        if not self.confirm_reset():
            return

        try:
            self.reset_database(options)

            if not options["skip_seed"]:
                self.seed_data()

            self.print_success()
        except Exception as e:
            self.print_error(str(e))
            raise  # Re-raise to ensure proper error code is returned

    def confirm_reset(self) -> bool:
        """Confirm the user wants to reset the database."""
        if self.force:
            return True

        self.stdout.write(self.style.WARNING("\n⚠️ WARNING: This will delete ALL data in the database!"))
        confirm = input("Are you sure you want to continue? [y/N]: ").strip().lower()
        return confirm == "y"

    def reset_database(self, options: dict):
        """Reset the database based on the engine type."""
        self.stdout.write(self.style.NOTICE("\n🔄 Resetting database..."))

        db_engine = settings.DATABASES["default"]["ENGINE"]

        if "sqlite" in db_engine:
            self.reset_sqlite()
        else:
            call_command("flush", verbosity=1, interactive=False, reset_sequences=True)

        if not options["skip_migrate"]:
            call_command("migrate", verbosity=1, interactive=False)

    def reset_sqlite(self):
        """Handle SQLite database reset."""
        db_path = settings.DATABASES["default"]["NAME"]

        if db_path == ":memory:":
            self.stdout.write(self.style.NOTICE("Using in-memory SQLite database - no file to remove"))
        elif os.path.exists(db_path):
            try:
                os.remove(db_path)
                self.stdout.write(self.style.SUCCESS(f"SQLite database removed: {db_path}"))
            except PermissionError as e:
                raise Exception(f"Permission denied when trying to remove {db_path}: {e}")
        else:
            self.stdout.write(self.style.NOTICE(f"SQLite database not found at {db_path}"))

    def seed_data(self):
        """Seed the database with initial data."""
        seed_commands = [
            ("seed_movies", "🎬 Seeding movies..."),
            ("seed_users", "👤 Creating test users..."),
        ]

        for command, message in seed_commands:
            self.stdout.write(self.style.NOTICE(f"\n{message}"))
            call_command(command, verbosity=1)

    def print_success(self):
        """Print success message with timing."""
        elapsed = time.time() - self.start_time
        self.stdout.write(self.style.SUCCESS(f"\n✅ Database reset completed successfully in {elapsed:.2f} seconds!"))

    def print_error(self, message: str):
        """Print error message with timing."""
        elapsed = time.time() - self.start_time
        self.stdout.write(self.style.ERROR(f"\n❌ Operation failed after {elapsed:.2f} seconds: {message}"))
