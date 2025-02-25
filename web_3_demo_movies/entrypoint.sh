#!/bin/bash

# 1. Ejecutar migraciones en SQLite
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# 2. Crear usuario de prueba
python manage.py create_user

# 3. Seedear la base de datos
python manage.py seed_movies

# 4. Arrancar Gunicorn en el puerto 8003
exec gunicorn --bind 0.0.0.0:8003 movieproject.wsgi:application