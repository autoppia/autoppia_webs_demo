#!/bin/bash

# Enhanced Django Project Setup Script
# Fixes environment configuration issues and adds better error handling

set -eo pipefail
trap 'echo "Error on line $LINENO. Exit code: $?" >&2' ERR

# --------------------------
# Configuration
# --------------------------
DEFAULT_DB_NAME="presentation_db"
DEFAULT_DB_USER="postgres"
DEFAULT_DB_PASSWORD="postgres"
DEFAULT_DB_HOST="localhost"
DEFAULT_DB_PORT="5432"
ENV_FILE=".env"

# --------------------------
# Setup Functions
# --------------------------
create_virtualenv() {
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        echo "✓ Virtual environment created"
    fi
    source venv/bin/activate
    echo "✓ Virtual environment activated"
}

setup_env_file() {
    local env_example="env.example"

    if [ ! -f "$ENV_FILE" ]; then
        if [ -f "$env_example" ]; then
            cp "$env_example" "$ENV_FILE"
            echo "✓ Created .env from example"
        else
            echo "⚠ Creating default .env"
            cat > "$ENV_FILE" <<EOL
# Django Settings
DEBUG=true
SECRET_KEY=$(openssl rand -hex 32)
USE_DOCKER=no

# Database Configuration
DB_USER=$DEFAULT_DB_USER
DB_PASSWORD=$DEFAULT_DB_PASSWORD
DB_HOST=$DEFAULT_DB_HOST
DB_PORT=$DEFAULT_DB_PORT
DATABASE_URL=postgres://\${DB_USER}:\${DB_PASSWORD}@\${DB_HOST}:\${DB_PORT}/\${DB_NAME}
EOL
            echo "✓ Created default .env"
        fi
    fi

    # Ensure the file exists before sourcing
    if [ ! -f "$ENV_FILE" ]; then
        echo "❌ Error: Failed to create .env file"
        exit 1
    fi

    set -a
    source "$ENV_FILE"
    set +a
}

verify_postgres_connection() {
    local max_attempts=3
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt: Testing PostgreSQL connection..."

        if PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1" >/dev/null 2>&1; then
            echo "✓ PostgreSQL connection successful"
            return 0
        fi

        echo "⚠ Connection failed"

        if [ $attempt -lt $max_attempts ]; then
            read -p "Enter PostgreSQL username [$DB_USER]: " input_user
            DB_USER=${input_user:-$DB_USER}
            read -s -p "Enter PostgreSQL password for $DB_USER: " DB_PASSWORD
            echo
        fi

        ((attempt++))
    done

    echo "❌ Failed to connect to PostgreSQL after $max_attempts attempts"
    echo "Please verify:"
    echo "1. PostgreSQL is running: sudo service postgresql status"
    echo "2. User '$DB_USER' exists and password is correct"
    echo "3. Check authentication method in pg_hba.conf:"
    echo "   sudo grep -A 5 -B 5 'host.*all.*all' /etc/postgresql/*/main/pg_hba.conf"
    echo "4. If needed, set password with: sudo -u postgres psql -c \"ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';\""
    exit 1
}

get_db_credentials() {
    read -p "Enter database name [$DEFAULT_DB_NAME]: " DATABASE_NAME
    DATABASE_NAME=${DATABASE_NAME:-$DEFAULT_DB_NAME}

    if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
        echo "⚠ Database credentials needed"
        read -p "Enter PostgreSQL username [$DEFAULT_DB_USER]: " DB_USER
        DB_USER=${DB_USER:-$DEFAULT_DB_USER}
        read -s -p "Enter PostgreSQL password for $DB_USER: " DB_PASSWORD
        echo
        DB_PASSWORD=${DB_PASSWORD:-$DEFAULT_DB_PASSWORD}
    fi

    # Create temp file for safer editing
    temp_file=$(mktemp)

    # Remove existing settings if they exist
    grep -vE "^(DB_NAME=|DB_USER=|DB_PASSWORD=|DATABASE_URL=)" "$ENV_FILE" > "$temp_file"
    {
        echo "DB_NAME=$DATABASE_NAME"
        echo "DB_USER=$DB_USER"
        echo "DB_PASSWORD=$DB_PASSWORD"
        echo "DATABASE_URL=postgres://$DB_USER:$DB_PASSWORD@${DB_HOST:-$DEFAULT_DB_HOST}:${DB_PORT:-$DEFAULT_DB_PORT}/$DATABASE_NAME"
    } >> "$temp_file"
    mv "$temp_file" "$ENV_FILE"

    # Verify connection
    verify_postgres_connection
}

setup_database() {
    export PGUSER=$DB_USER PGPASSWORD=$DB_PASSWORD
    export PGHOST=${DB_HOST:-$DEFAULT_DB_HOST}
    export PGPORT=${DB_PORT:-$DEFAULT_DB_PORT}
    export PGDATABASE=$DATABASE_NAME

    # Database operations
    if PGPASSWORD=$DB_PASSWORD psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -lqt | cut -d \| -f 1 | grep -qw "$PGDATABASE"; then
        echo "⚠ Dropping existing database..."
        PGPASSWORD=$DB_PASSWORD dropdb -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE"
    fi

    echo "✓ Creating database..."
    PGPASSWORD=$DB_PASSWORD createdb -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE"
}

install_dependencies() {
    echo "✓ Installing dependencies..."
    pip install --upgrade pip --quiet
    pip install -r requirements/local.txt --quiet
}

run_django_commands() {
    echo "✓ Running migrations..."
    python manage.py makemigrations
    python manage.py migrate

    echo "✓ Collecting static files..."
    python manage.py collectstatic --noinput --verbosity 0
}

# --------------------------
# Main Execution
# --------------------------
echo "🚀 Starting project setup..."

create_virtualenv
setup_env_file
get_db_credentials
setup_database
install_dependencies
run_django_commands

echo "✓ Starting development server on port 3000..."
python manage.py runserver 3000
