import os
import time
import logging

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import connection

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Reset the database and optionally seed it with initial data or delete filtered Event records."

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_time = 0
        self.force = False
        self._filtered_delete_performed = False

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
        parser.add_argument(
            "--web-agent-id",
            dest="web_agent_id",
            help="If provided with --validator-id, delete only matching Event records",
            type=str,
            default=None,
        )
        parser.add_argument(
            "--validator-id",
            dest="validator_id",
            help="If provided with --web-agent-id, delete only matching Event records",
            type=str,
            default=None,
        )

    def handle(self, *args, **options):
        self.force = options["force"]
        self.start_time = time.time()

        web_agent_id = options.get("web_agent_id")
        validator_id = options.get("validator_id")
        self._is_filtered = bool(web_agent_id and validator_id)

        logger.debug("reset_db called with options: %s", options)

        if not self.confirm_reset(self._is_filtered, web_agent_id, validator_id):
            return

        try:
            if self._is_filtered:
                # ORM-only deletion of filtered events
                deleted = self.delete_events_filtered(web_agent_id, validator_id)
                if deleted:
                    self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} Event records matching filters."))
                else:
                    self.stdout.write(self.style.NOTICE("No Event records matched the provided filters."))
                logger.info(
                    "Filtered deletion complete: web_agent_id=%s, validator_id=%s, deleted=%s",
                    web_agent_id, validator_id, deleted,
                )
                self._filtered_delete_performed = True
                return

            # Full reset path
            self.perform_reset(options)

            if not options["skip_seed"]:
                self.seed_data()

            self.print_success()
        except Exception as e:
            self.print_error(str(e))
            raise

    # ───────────────────────────────────────────────
    # CORE LOGIC
    # ───────────────────────────────────────────────

    def delete_events_filtered(self, web_agent_id: str, validator_id: str) -> int:
        """
        Deletes Event records that match both web_agent_id and validator_id.
        Returns number of records deleted (0 if none).
        """
        try:
            from events.models import Event

            # Defensive: ensure table exists
            table = Event._meta.db_table
            if table not in connection.introspection.table_names():
                self.stdout.write(self.style.NOTICE("Event table does not exist; skipping filtered deletion."))
                return 0

            pre_count = Event.objects.filter(web_agent_id=web_agent_id, validator_id=validator_id).count()
            if pre_count:
                Event.objects.filter(web_agent_id=web_agent_id, validator_id=validator_id).delete()
            return pre_count

        except Exception as e:
            logger.exception("Filtered Event deletion failed: %s", e)
            self.stdout.write(self.style.NOTICE("Could not perform filtered Event deletion (skipping)."))
            return 0

    def confirm_reset(self, is_filtered: bool = False, web_agent_id: str | None = None, validator_id: str | None = None) -> bool:
        """Confirm before performing destructive actions."""
        if self.force:
            return True

        if is_filtered:
            confirm = input(
                f"⚠️ Delete Event records matching web_agent_id='{web_agent_id}' "
                f"and validator_id='{validator_id}'? [y/N]: "
            ).strip().lower()
            return confirm == "y"

        self.stdout.write(self.style.WARNING("\n⚠️ WARNING: This will delete ALL data in the database!"))
        confirm = input("Are you sure you want to continue? [y/N]: ").strip().lower()
        return confirm == "y"

    def perform_reset(self, options: dict):
        """Perform a full database reset and optional migrations."""
        self.stdout.write(self.style.NOTICE("\n🔄 Resetting database..."))

        # ORM cleanup of all Event records before flush
        try:
            from events.models import Event

            table = Event._meta.db_table
            if table not in connection.introspection.table_names():
                self.stdout.write(self.style.NOTICE("Events table does not exist yet; skipping Event deletion."))
            else:
                pre_count = Event.objects.count()
                if pre_count:
                    Event.objects.all().delete()
                    self.stdout.write(self.style.NOTICE(f"Deleted {pre_count} Event records before reset."))
                    logger.info("Deleted %s Event records before reset.", pre_count)
        except Exception as e:
            logger.exception("Pre-reset Event deletion failed: %s", e)
            self.stdout.write(self.style.NOTICE("Could not perform pre-reset Event deletion (skipping)."))

        db_engine = settings.DATABASES["default"]["ENGINE"]

        if "sqlite" in db_engine:
            self.reset_sqlite()
        else:
            call_command("flush", verbosity=1, interactive=False, reset_sequences=True)

        if not options["skip_migrate"]:
            call_command("migrate", verbosity=1, interactive=False)

    def reset_sqlite(self):
        """Handle SQLite database reset by removing the .sqlite file if applicable."""
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
        """Seed the database with initial data via other management commands."""
        seed_commands = [
            ("seed_movies", "🎬 Seeding movies..."),
            ("seed_users", "👤 Creating test users..."),
        ]

        for command, message in seed_commands:
            self.stdout.write(self.style.NOTICE(f"\n{message}"))
            try:
                call_command(command, verbosity=1)
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Skipping seed command '{command}' due to error: {e}"))

    # ───────────────────────────────────────────────
    # UTILITIES
    # ───────────────────────────────────────────────

    def print_success(self):
        """Print success message with timing."""
        elapsed = time.time() - self.start_time
        self.stdout.write(self.style.SUCCESS(f"\n✅ Database reset completed successfully in {elapsed:.2f} seconds!"))

    def print_error(self, message: str):
        """Print error message with timing."""
        elapsed = time.time() - self.start_time
        self.stdout.write(self.style.ERROR(f"\n❌ Operation failed after {elapsed:.2f} seconds: {message}"))
