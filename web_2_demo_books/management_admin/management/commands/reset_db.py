import sys
import time
import traceback
from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import connections, DEFAULT_DB_ALIAS, connection
from django.db.utils import OperationalError
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = f"Completely drops all data from the '{DEFAULT_DB_ALIAS}' database configured in settings, \
or performs a filtered deletion of Event records."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Force reset without confirmation",
        )
        parser.add_argument(
            "--database",
            default=DEFAULT_DB_ALIAS,
            help="Specifies the database to reset.",
        )
        parser.add_argument(
            "--parallel",
            type=int,
            default=4,
            help="Number of parallel workers for seeding",
        )
        # new optional filters
        parser.add_argument(
            "--web-agent-id",
            dest="web_agent_id",
            help="If provided with --validator-id, only delete events matching this web_agent_id",
            type=str,
            default=None,
        )
        parser.add_argument(
            "--validator-id",
            dest="validator_id",
            help="If provided with --web-agent-id, only delete events matching this validator_id",
            type=str,
            default=None,
        )

    # ───────────────────────────────────────────────
    # MAIN ENTRY
    # ───────────────────────────────────────────────

    def handle(self, *args, **options):
        start_time = time.monotonic()
        db_alias = options["database"]
        web_agent_id = options.get("web_agent_id")
        validator_id = options.get("validator_id")

        is_filtered_delete = bool(web_agent_id and validator_id)

        logger.debug("reset_db (web2) called with options: %s", options)

        try:
            db_config = settings.DATABASES[db_alias]
        except KeyError:
            raise ValueError(f"Database configuration not found for alias '{db_alias}'")

        db_name = db_config.get("NAME", "unknown")

        # Confirm destructive operation
        if not options["force"]:
            if is_filtered_delete:
                confirm = input(f"⚠️ Delete Event records matching web_agent_id='{web_agent_id}' and validator_id='{validator_id}'? [y/N] ")
            else:
                confirm = input(f"⚠️ DESTROY ALL DATA in database '{db_name}' (alias: '{db_alias}')? [y/N] ")

            if confirm.strip().lower() != "y":
                self.stdout.write(self.style.WARNING("Operation cancelled"))
                return

        try:
            # ─── Filtered deletion path ─────────────────────
            if is_filtered_delete:
                deleted_count = self.delete_events_filtered(web_agent_id, validator_id)
                elapsed = time.monotonic() - start_time
                if deleted_count:
                    self.stdout.write(self.style.SUCCESS(f"✅ Deleted {deleted_count} Event records matching web_agent_id='{web_agent_id}', validator_id='{validator_id}' in {elapsed:.2f}s."))
                else:
                    self.stdout.write(self.style.NOTICE(f"No Event records matched the provided filters (web_agent_id='{web_agent_id}', validator_id='{validator_id}')."))
                return

            # ─── Full destructive reset path ─────────────────
            self.drop_database_data(db_alias, db_config)
            self.apply_migrations(db_alias)
            self.seed_database()

            elapsed = time.monotonic() - start_time
            self.stdout.write(self.style.SUCCESS(f"Database '{db_name}' (alias: '{db_alias}') reset successfully in {elapsed:.2f} seconds."))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"An error occurred during reset: {e}"))
            self.stderr.write(traceback.format_exc())
            sys.exit(1)

    # ───────────────────────────────────────────────
    # FILTERED DELETION
    # ───────────────────────────────────────────────

    def delete_events_filtered(self, web_agent_id: str, validator_id: str) -> int:
        """Deletes Event records that match both filters. Returns count."""
        try:
            from events.models import Event

            def _table_exists(model):
                try:
                    table = model._meta.db_table
                    return table in connection.introspection.table_names()
                except Exception:
                    return False

            if not _table_exists(Event):
                self.stdout.write(self.style.NOTICE("Events table does not exist yet; skipping filtered deletion."))
                return 0

            filters = {"web_agent_id": web_agent_id, "validator_id": validator_id}
            pre_count = Event.objects.filter(**filters).count()
            if pre_count:
                Event.objects.filter(**filters).delete()
                logger.info("Deleted %s Event records with web_agent_id=%s, validator_id=%s", pre_count, web_agent_id, validator_id)
            else:
                logger.info("No Event records matched filters: web_agent_id=%s, validator_id=%s", web_agent_id, validator_id)

            # Optional: show counters if Event defines deletion tracking
            # try:
            #     counters = getattr(Event, "_deletion_counters", None)
            #     if counters:
            #         self.stdout.write(self.style.NOTICE("Event deletion counters summary:"))
            #         for crit, total in counters.items():
            #             self.stdout.write(self.style.NOTICE(f"  - {crit}: {total}"))
            # except Exception:
            #     pass

            return pre_count

        except Exception as e:
            logger.exception("Filtered Event deletion failed: %s", e)
            self.stdout.write(self.style.ERROR(f"Filtered Event deletion failed: {e}"))
            return 0

    # ───────────────────────────────────────────────
    # DATABASE RESET (UNCHANGED CORE LOGIC)
    # ───────────────────────────────────────────────

    def drop_database_data(self, db_alias, db_config):
        """Database-engine specific data destruction."""
        db_engine = db_config["ENGINE"]
        db_name = db_config.get("NAME", "unknown")
        self.stdout.write(f"\n🔴 Destroying data in {db_engine} database: {db_name} (alias: {db_alias})")

        # Ensure the connection is closed before potentially destructive operations
        # (especially important if we were dropping/creating the DB itself)
        connections[db_alias].close()

        if "sqlite" in db_engine:
            self.drop_sqlite(db_config)
        elif "postgresql" in db_engine:
            self.drop_postgresql(db_alias, db_config)
        elif "mysql" in db_engine:
            self.drop_mysql(db_alias, db_config)
        else:
            self.stdout.write(self.style.WARNING(f"Unsupported database engine '{db_engine}' - falling back to 'flush' on the '{db_alias}' database"))
            try:
                # Flush often requires the connection to be open
                # call_command handles connections internally, but ensure it's logical
                # Re-establish connection if needed, or let call_command handle it.
                # For flush, it usually expects an open connection.
                connections.ensure_connection(db_alias)
                call_command("flush", "--no-input", database=db_alias, interactive=False)
                self.stdout.write(self.style.SUCCESS(f"'flush' executed successfully for '{db_name}'"))
            except Exception as e:
                raise ValueError(f"Error running flush command: {e}")

    def drop_sqlite(self, db_config):
        """Delete SQLite file."""
        db_path_str = db_config.get("NAME")
        if not db_path_str:
            raise ValueError("SQLite database 'NAME' not configured in settings.")
        db_path = Path(db_path_str)
        if db_path.exists():
            try:
                db_path.unlink()
                self.stdout.write(self.style.SUCCESS(f"Deleted SQLite file at {db_path}"))
            except OSError as e:
                raise ValueError(f"Couldn't delete SQLite file '{db_path}': {e}")
        else:
            self.stdout.write(self.style.WARNING(f"SQLite file not found at {db_path} (might be in-memory or already deleted)"))

    def drop_postgresql(self, db_alias, db_config):
        """PostgreSQL-specific data destruction."""
        db_name = db_config.get("NAME", "unknown")
        try:
            with connections[db_alias].cursor() as cursor:
                # Drop schema 'public' is often faster and cleaner if permissions allow
                # and if 'public' is indeed the schema you want to wipe.
                # Check if this is suitable for your use case.
                # Alternative 1: Drop Schema
                # self.stdout.write(self.style.WARNING("Attempting to drop and recreate 'public' schema..."))
                # cursor.execute("DROP SCHEMA public CASCADE;")
                # cursor.execute("CREATE SCHEMA public;")
                # # Potentially restore default permissions
                # cursor.execute("GRANT ALL ON SCHEMA public TO postgres;") # Adjust role if needed
                # cursor.execute("GRANT ALL ON SCHEMA public TO public;")
                # self.stdout.write(self.style.SUCCESS(f"Schema 'public' dropped and recreated in database '{db_name}'"))

                # Alternative 2: Stick to dropping objects (original method, more compatible)
                self.stdout.write(self.style.WARNING("Dropping individual objects in 'public' schema..."))
                cursor.execute(
                    """
                    DO $$ DECLARE
                        r RECORD;
                    BEGIN
                        -- Drop all tables
                        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema())
                        LOOP
                            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                        END LOOP;

                        -- Drop all sequences
                        FOR r IN (SELECT sequence_name FROM information_schema.sequences
                                 WHERE sequence_schema = current_schema())
                        LOOP
                            EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
                        END LOOP;

                        -- Drop all views
                        FOR r IN (SELECT table_name FROM information_schema.views
                                 WHERE table_schema = current_schema())
                        LOOP
                            EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.table_name) || ' CASCADE';
                        END LOOP;
                    END $$;
                    """
                )
                self.stdout.write(self.style.SUCCESS(f"PostgreSQL objects destroyed in database '{db_name}'"))

        except OperationalError as e:
            raise OperationalError(f"Database connection error for '{db_alias}' while dropping PostgreSQL data: {e}")
        except Exception as e:
            raise ValueError(f"Error dropping PostgreSQL data in '{db_name}': {e}")

    def drop_mysql(self, db_alias, db_config):
        """MySQL-specific data destruction"""
        db_name = db_config.get("NAME")
        if not db_name:
            raise ValueError("MySQL database 'NAME' not configured in settings.")

        try:
            with connections[db_alias].cursor() as cursor:
                cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
                # Fetch tables
                cursor.execute(
                    """
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = %s AND table_type = 'BASE TABLE'
                    """,
                    [db_name],
                )
                tables = [row[0] for row in cursor.fetchall()]
                if tables:
                    self.stdout.write(f"Dropping {len(tables)} tables...")
                    for table in tables:
                        # self.stdout.write(f"Dropping table: {table}")
                        cursor.execute(f"DROP TABLE IF EXISTS `{table}`;")
                else:
                    self.stdout.write(self.style.WARNING("No tables found to drop."))

                cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
                self.stdout.write(self.style.SUCCESS(f"MySQL tables dropped in database '{db_name}'"))

        except OperationalError as e:
            raise OperationalError(f"Database connection error for '{db_alias}' while dropping MySQL data: {e}")
        except Exception as e:
            raise ValueError(f"Error dropping MySQL data in '{db_name}': {e}")

    def apply_migrations(self, db_alias):
        """Applies all migrations."""
        self.stdout.write("\n🛠️ Applying migrations...")
        try:
            call_command("makemigrations", interactive=False, verbosity=1)
            call_command("migrate", database=db_alias, interactive=False, verbosity=1)
            self.stdout.write(self.style.SUCCESS("Migrations applied successfully."))
        except Exception as e:
            raise ValueError(f"Error applying migrations: {e}")

    def seed_database(self):
        """Seeds the database with initial data."""
        self.stdout.write("\n🌱 Seeding the database...")
        try:
            call_command("seed_users_with_books", "--start=1", "--end=256", "--prefix=user", "--password=PASSWORD")
            self.stdout.write(self.style.SUCCESS("Database seeded successfully."))
        except Exception as e:
            raise ValueError(f"Error seeding the database: {e}")
