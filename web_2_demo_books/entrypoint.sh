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

# 3. Data Generation (if enabled)
if [ "$DATA_GENERATION" = "true" ]; then
    echo "Data generation is enabled. Waiting for API server..."
    
    # Wait for API server to be ready
    max_attempts=30
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://app:8080/health" > /dev/null 2>&1; then
            echo "API server is ready. Generating additional books..."
            python manage.py generate_data --count 20 --categories Fiction Non-Fiction Mystery Romance Sci-Fi --user-id 1
            break
        else
            echo "Attempt $attempt/$max_attempts - API server not ready, waiting 2 seconds..."
            sleep 2
            attempt=$((attempt + 1))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo "Warning: API server did not become ready. Using original seed data."
    fi
else
    echo "Data generation is disabled. Using original seed data."
fi

# 4. Start Gunicorn on port 8001 (matches docker-compose.yml port mapping)
exec gunicorn --bind 0.0.0.0:8001 booksproject.wsgi:application
