#!/bin/bash
# 1. Execute migrations
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# 2. Seed users
python manage.py seed_users --start=1 --end=256 --prefix="user" --password="PASSWORD"

# 3. Seed movies
python manage.py seed_movies

# 4. Start Gunicorn on port 8000
exec gunicorn --bind 0.0.0.0:8000 movieproject.wsgi:application
