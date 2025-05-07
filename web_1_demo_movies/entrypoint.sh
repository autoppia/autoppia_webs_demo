#!/bin/bash

set -e
set -o pipefail

# Step 1
python manage.py reset_db --force --skip-migrate --skip-seed

# Step 2
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Step 3
python manage.py seed_users

# Step 4
python manage.py seed_movies

# Step 5
exec gunicorn --bind 0.0.0.0:8000 movieproject.wsgi:application
