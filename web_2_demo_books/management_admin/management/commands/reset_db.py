import sys
import time
import traceback
from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import connections, DEFAULT_DB_ALIAS
from django.db.utils import OperationalError


class Command(BaseCommand):
    help = f"Completely drops all data from the '{DEFAULT_DB_ALIAS}' database configured in settings."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Force reset without confirmation",
        )
        parser.add_argument(
            "--no-migrate",
            action="store_true",
            help="Skip running migrations after reset",
        )
        parser.add_argument(
            "--database",
            default=DEFAULT_DB_ALIAS,
            help="Specifies the database to reset.",
        )

    def handle(self, *args, **options):
        start_time = time.monotonic()
        db_alias = DEFAULT_DB_ALIAS
        try:
            db_config = settings.DATABASES[db_alias]
        except KeyError:
            raise ValueError(f"Database configuration not found for alias '{db_alias}'")

        db_name = db_config.get("NAME", "unknown")

        if not options["force"]:
            confirm = input(f"⚠️ DESTROY ALL DATA in database '{db_name}' (alias: '{db_alias}')? [y/N] ")
            if confirm.lower() != "y":
                self.stdout.write(self.style.WARNING("Operation cancelled"))
                return

        try:
            self.drop_database_data(db_alias, db_config)

            if not options["no_migrate"]:
                self.recreate_schema(db_alias)

            end_time = time.monotonic()
            total_time = end_time - start_time
            self.stdout.write(self.style.SUCCESS(
                f"Database '{db_name}' (alias: '{db_alias}') reset successfully in {total_time:.2f} seconds"))

        except (ValueError, OperationalError, Exception) as e:
            self.stderr.write(self.style.ERROR(f"An error occurred during reset: {e}"))
            self.stderr.write(traceback.format_exc())
            sys.exit(1)

    def drop_database_data(self, db_alias, db_config):
        """Database-engine specific data destruction"""
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
            self.stdout.write(self.style.WARNING(
                f"Unsupported database engine '{db_engine}' - falling back to 'flush' on the '{db_alias}' database"))
            try:
                # Flush often requires the connection to be open
                # call_command handles connections internally, but ensure it's logical
                # Re-establish connection if needed, or let call_command handle it.
                # For flush, it usually expects an open connection.
                connections.ensure_connection(db_alias)
                call_command("flush", "--no-input", database=db_alias, interactive=False)
                self.stdout.write(self.style.SUCCESS(f"'flush' command executed successfully for database '{db_name}'"))
            except Exception as e:
                raise ValueError(f"Error running flush command: {e}")

    def drop_sqlite(self, db_config):
        """Nuclear option for SQLite - delete the file"""
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
            self.stdout.write(
                self.style.WARNING(f"SQLite file not found at {db_path} (might be in-memory or already deleted)"))

    def drop_postgresql(self, db_alias, db_config):
        """PostgreSQL-specific data destruction"""
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

    def recreate_schema(self, db_alias):
        """Rebuild database schema using Django's migrate command."""
        self.stdout.write(f"\n🔵 Recreating database schema for the '{db_alias}' database...")
        try:
            call_command(
                "migrate",
                # --run-syncdb might not be needed unless you have legacy apps without migrations
                # It's generally recommended to rely solely on migrations if possible.
                # Remove it if you don't specifically need its behavior.
                # "--run-syncdb",
                database=db_alias,
                interactive=False,
                verbosity=1,  # Adjust verbosity as needed (0=minimal, 1=normal, 2=verbose, 3=debug)
            )
            self.stdout.write(
                self.style.SUCCESS(f"Schema rebuilt successfully for the '{db_alias}' database via migrate"))
        except Exception as e:
            # Catch specific exceptions if needed, e.g., CommandError
            raise ValueError(f"Schema recreate failed for the '{db_alias}' database: {e}")
