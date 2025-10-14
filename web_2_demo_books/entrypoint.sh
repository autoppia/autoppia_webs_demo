#!/bin/bash
# 1. Execute migrations
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# 2. Seed users with books
python manage.py seed_users_with_books --start=1 --end=256 --prefix="user" --password="PASSWORD"

# 3. Start Gunicorn on port 8001
exec gunicorn --bind 0.0.0.0:8001 booksproject.wsgi:application
