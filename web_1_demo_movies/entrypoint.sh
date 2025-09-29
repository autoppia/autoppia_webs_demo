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

# Step 5 - Data Generation (if enabled)
if [ "$DATA_GENERATION" = "true" ]; then
    echo "Data generation is enabled. Waiting for API server..."
    
    # Wait for API server to be ready
    max_attempts=30
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://app:8080/health" > /dev/null 2>&1; then
            echo "API server is ready. Generating additional movies..."
            python manage.py generate_data --count 20 --categories Action Drama Comedy Thriller Sci-Fi
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

# Step 6
exec gunicorn --bind 0.0.0.0:8000 movieproject.wsgi:application
