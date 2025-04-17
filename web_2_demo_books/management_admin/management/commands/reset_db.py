import subprocess
import sys
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connections


class Command(BaseCommand):
    help = "Completely drops all data from the 'default' database configured in settings"

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

    def handle(self, *args, **options):
        db_config = settings.DATABASES["default"]
        db_name = db_config.get("NAME", "unknown")

        if not options["force"]:
            confirm = input(f"⚠️ DESTROY ALL DATA in database '{db_name}'? [y/N] ")
            if confirm.lower() != "y":
                self.stdout.write(self.style.WARNING("Operation cancelled"))
                return

        self.drop_database_data()

        if not options["no_migrate"]:
            self.recreate_schema()

    def drop_database_data(self):
        """Database-engine specific data destruction for the 'default' database"""
        db_config = settings.DATABASES["default"]
        db_engine = db_config["ENGINE"]
        db_name = db_config.get("NAME", "unknown")
        self.stdout.write(f"\n🔴 Destroying data in {db_engine} database: {db_name} (default)")

        if "sqlite" in db_engine:
            self.drop_sqlite(db_config)
        elif "postgresql" in db_engine:
            self.drop_postgresql(db_config)
        elif "mysql" in db_engine:
            self.drop_mysql(db_config)
        else:
            self.stdout.write(self.style.WARNING(f"Unsupported database engine '{db_engine}' - falling back to flush on the 'default' database"))
            self.run_command("flush", "--no-input", "--database", "default")

    def drop_sqlite(self, db_config):
        """Nuclear option for SQLite - delete the file"""
        db_path = Path(db_config["NAME"])
        if db_path.exists():
            try:
                db_path.unlink()
                self.stdout.write(self.style.SUCCESS(f"Deleted SQLite file at {db_path}"))
            except Exception as e:
                raise ValueError(f"Couldn't delete SQLite file: {e}")
        else:
            self.stdout.write(self.style.WARNING(f"SQLite file not found at {db_path}"))

    def drop_postgresql(self, db_config):
        """PostgreSQL-specific data destruction for the 'default' database"""
        connection_obj = connections["default"]
        with connection_obj.cursor() as cursor:
            try:
                # Drop all tables, sequences, etc. within the current schema of the default database
                cursor.execute(
                    """
                    DO $$ DECLARE
                        r RECORD;
                    BEGIN
                        -- Drop all tables
                        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema())
                        LOOP
                            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                            RAISE NOTICE 'Dropped table: %', r.tablename;
                        END LOOP;

                        -- Drop all sequences
                        FOR r IN (SELECT sequence_name FROM information_schema.sequences
                                 WHERE sequence_schema = current_schema())
                        LOOP
                            EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
                            RAISE NOTICE 'Dropped sequence: %', r.sequence_name;
                        END LOOP;

                        -- Drop all views
                        FOR r IN (SELECT table_name FROM information_schema.views
                                 WHERE table_schema = current_schema())
                        LOOP
                            EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.table_name) || ' CASCADE';
                            RAISE NOTICE 'Dropped view: %', r.table_name;
                        END LOOP;
                    END $$;
                    """
                )
                self.stdout.write(self.style.SUCCESS(f"PostgreSQL data destroyed for database '{db_config.get('NAME', 'unknown')}'"))
            except Exception as e:
                raise ValueError(f"Error dropping PostgreSQL data: {e}")

    def drop_mysql(self, db_config):
        """MySQL-specific data destruction for the 'default' database"""
        connection_obj = connections["default"]
        with connection_obj.cursor() as cursor:
            try:
                cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
                cursor.execute(
                    """
                    SELECT CONCAT('DROP TABLE IF EXISTS `', table_name, '`;')
                    FROM information_schema.tables
                    WHERE table_schema = %s
                    """,
                    [db_config.get("NAME")],
                )
                drop_commands = [row[0] for row in cursor.fetchall()]

                for cmd in drop_commands:
                    cursor.execute(cmd)

                cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
                self.stdout.write(self.style.SUCCESS(f"Dropped {len(drop_commands)} MySQL tables in database '{db_config.get('NAME', 'unknown')}'"))
            except Exception as e:
                raise ValueError(f"Error dropping MySQL data: {e}")

    def recreate_schema(self):
        """Rebuild database schema after destruction for the 'default' database"""
        self.stdout.write("\n🔵 Recreating database schema for the 'default' database...")
        try:
            self.run_command("migrate", "--run-syncdb", "--database", "default")
            self.stdout.write(self.style.SUCCESS("Schema rebuilt successfully for the 'default' database"))
        except Exception as e:
            raise ValueError(f"Schema recreation failed for the 'default' database: {e}")

    def run_command(self, *args):
        """Execute management commands with proper output"""
        cmd = [sys.executable, "manage.py"] + list(args)
        self.stdout.write(f"Running: {' '.join(cmd)}")

        try:
            result = subprocess.run(
                cmd,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
            )

            if result.stdout:
                self.stdout.write(result.stdout)
            if result.stderr:
                self.stdout.write(self.style.WARNING(result.stderr))

            return result
        except subprocess.CalledProcessError as e:
            self.stdout.write(self.style.ERROR(f"Command failed with code {e.returncode}"))
            self.stdout.write(self.style.ERROR(e.stderr))
            raise
