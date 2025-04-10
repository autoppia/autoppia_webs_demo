#!/bin/bash
# 1. Execute migrations in SQLite
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# 2. Seed users (with optional parameters if needed)
python manage.py seed_users --start=1 --end=255 --prefix="user" --password="PASSWORD"

# 3. Seed movies
python manage.py seed_books

# 4. Start Gunicorn on port 8000 (note this was incorrectly commented as 8003)
exec gunicorn --bind 0.0.0.0:8000 booksproject.wsgi:application
