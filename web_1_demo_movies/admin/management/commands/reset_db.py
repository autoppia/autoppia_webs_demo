from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings
import subprocess
import os
import sys


class Command(BaseCommand):
    help = 'Reset the database and seed it with initial data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force reset without confirmation',
        )

    def handle(self, *args, **options):
        if not options['force']:
            self.stdout.write(self.style.WARNING("⚠️ WARNING: This will delete ALL data in the database!"))
            confirm = input("Are you sure you want to continue? [y/N]: ")
            if confirm.lower() != 'y':
                self.stdout.write(self.style.SUCCESS("Reset cancelled."))
                return

        self.stdout.write(self.style.NOTICE("🔄 Resetting database..."))

        # Get the current Django project module
        django_project = os.path.basename(settings.BASE_DIR)

        # 1. Reset the database
        try:
            # For SQLite
            if 'sqlite' in settings.DATABASES['default']['ENGINE']:
                db_path = settings.DATABASES['default']['NAME']
                if os.path.exists(db_path) and db_path != ':memory:':
                    self.stdout.write(f"Removing SQLite database at {db_path}")
                    os.remove(db_path)
                # Run migrations to recreate the database
                self.run_command('migrate')
            # For PostgreSQL, MySQL, etc.
            else:
                # Flush the database
                self.run_command('flush', '--no-input')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error resetting database: {e}"))
            return

        # 2. Seed the database with movies
        self.stdout.write(self.style.NOTICE("🎬 Seeding movies..."))
        try:
            self.run_command('seed_movies')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error seeding movies: {e}"))
            return

        # 3. Create test users
        self.stdout.write(self.style.NOTICE("👤 Creating test users..."))
        try:
            self.run_command('create_user')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error creating test users: {e}"))
            return

        self.stdout.write(self.style.SUCCESS("✅ Database reset and seeded successfully!"))

    def run_command(self, *args):
        """Run a Django management command"""
        cmd = [sys.executable, 'manage.py'] + list(args)
        self.stdout.write(f"Running: {' '.join(cmd)}")
        subprocess.run(cmd, check=True)
