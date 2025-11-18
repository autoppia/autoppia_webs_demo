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

# Step 4.5 - Load master movies from JSON (if v2 DB mode is enabled)
if [ "$ENABLE_DYNAMIC_V2_DB_MODE" = "true" ]; then
    echo "V2 DB mode enabled. Loading master movies from JSON..."
    # Try to find movies_1.json in container or copy from host
    JSON_PATH="/app/data/web_1_demo_movies/data/movies_1.json"
    if [ ! -f "$JSON_PATH" ]; then
        # Try alternative path
        JSON_PATH="/app/../webs_server/initial_data/web_1_demo_movies/data/movies_1.json"
    fi
    if [ -f "$JSON_PATH" ]; then
        python manage.py load_master_movies --json-path "$JSON_PATH" --clear
    else
        echo "Warning: movies_1.json not found at $JSON_PATH. Master pool will be empty."
    fi
fi

# Step 5 - Data Generation (if enabled)
if [ "$ENABLE_DYNAMIC_V2_AI_GENERATE" = "true" ]; then
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
