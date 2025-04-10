import os
import subprocess
import sys

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Reset the database and seed it with initial data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Force reset without confirmation",
        )

    def handle(self, *args, **options):
        if not options["force"]:
            self.stdout.write(self.style.WARNING("⚠️ WARNING: This will delete ALL data in the database!"))
            self.stdout.write(self.style.SUCCESS("Proceeding with database reset..."))

        self.stdout.write(self.style.NOTICE("🔄 Resetting database..."))

        # 1. Reset the database
        try:
            # For SQLite
            if "sqlite" in settings.DATABASES["default"]["ENGINE"]:
                db_path = settings.DATABASES["default"]["NAME"]
                if os.path.exists(db_path) and db_path != ":memory:":
                    self.stdout.write(f"Removing SQLite database at {db_path}")
                    os.remove(db_path)
                # Run migrations to recreate the database
                self.run_command("migrate")
            # For PostgreSQL, MySQL, etc.
            else:
                # Flush the database
                self.run_command("flush", "--no-input")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error resetting database: {e}"))
            return

        # 2. Seed the database with movies
        self.stdout.write(self.style.NOTICE("🎬 Seeding movies..."))
        try:
            self.run_command("seed_movies")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error seeding movies: {e}"))
            return

        # 3. Create test users
        self.stdout.write(self.style.NOTICE("👤 Creating test users..."))
        try:
            self.run_command("seed_users")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error creating test users: {e}"))
            return

        self.stdout.write(self.style.SUCCESS("✅ Database reset and seeded successfully!"))

    def run_command(self, *args):
        """Run a Django management command and wait for it to complete"""
        cmd = [sys.executable, "manage.py"] + list(args)
        self.stdout.write(f"Running: {' '.join(cmd)}")

        # Use subprocess.run with appropriate parameters to ensure waiting
        # This is a blocking call - it will not return until the process completes
        self.stdout.write("Waiting for command to complete...")

        process = subprocess.run(
            cmd,
            check=True,  # Raise exception if command fails
            stdout=subprocess.PIPE,  # Capture stdout
            stderr=subprocess.PIPE,  # Capture stderr
            text=True,  # Return strings rather than bytes
            encoding="utf-8",  # Specify encoding
        )

        self.stdout.write(f"Command completed with return code: {process.returncode}")

        # Log command output if desired
        if process.stdout:
            self.stdout.write(process.stdout)

        # Return the completed process object in case it's needed
        return process
