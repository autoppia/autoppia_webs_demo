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

# 1. Execute migrations
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# 2. Seed users with books
python manage.py seed_users_with_books --start=1 --end=256 --prefix="user" --password="PASSWORD"

# 3. Start Gunicorn on port 8001
exec gunicorn --bind 0.0.0.0:8001 booksproject.wsgi:application
