#!/bin/bash

set -e
set -o pipefail

# Function to wait for database
wait_for_db() {
    echo "🔄 Waiting for database to be ready..."
    while ! python manage.py check --database default 2>/dev/null; do
        echo "⏳ Database not ready yet, waiting 2 seconds..."
        sleep 2
    done
    echo "✅ Database is ready!"
}

# Wait for database to be ready
wait_for_db

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
