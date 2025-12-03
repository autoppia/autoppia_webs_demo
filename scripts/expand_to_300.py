#!/usr/bin/env python3
"""
Script para expandir movies_1.json y books_1.json a 300 elementos cada uno.
Duplica y varía los datos existentes para llegar al objetivo.
"""

import json
import sys
import random
from pathlib import Path


def expand_movies():
    """Expandir movies_1.json de 200 a 300."""
    movies_path = Path("webs_server/initial_data/web_1_autocinema/data/movies_1.json")

    with open(movies_path, "r", encoding="utf-8") as f:
        movies = json.load(f)

    current_count = len(movies)
    target = 300
    needed = target - current_count

    if needed <= 0:
        print(f"✅ Movies ya tiene {current_count} elementos (objetivo: {target})")
        return

    print(f"📽️  Expandiendo movies: {current_count} → {target} (necesitamos {needed} más)")

    # Duplicar y variar películas existentes
    random.seed(42)  # Para reproducibilidad
    new_movies = []

    for i in range(needed):
        # Seleccionar una película aleatoria del pool existente
        base_movie = random.choice(movies)

        # Crear variación
        new_movie = base_movie.copy()
        new_movie["id"] = f"movie-exp-{i + 1:03d}"
        new_movie["title"] = f"{base_movie.get('title', 'Movie')} (Variant {i + 1})"

        # Variar año ligeramente
        if "year" in new_movie:
            new_movie["year"] = new_movie["year"] + random.randint(-2, 2)
            new_movie["year"] = max(1900, min(2024, new_movie["year"]))

        # Variar rating ligeramente
        if "rating" in new_movie:
            new_movie["rating"] = round(new_movie["rating"] + random.uniform(-0.3, 0.3), 1)
            new_movie["rating"] = max(0.0, min(5.0, new_movie["rating"]))

        new_movies.append(new_movie)

    # Añadir nuevas películas
    movies.extend(new_movies)

    # Guardar
    with open(movies_path, "w", encoding="utf-8") as f:
        json.dump(movies, f, indent=2, ensure_ascii=False)

    print(f"✅ Movies expandido: {len(movies)} elementos")


def expand_books():
    """Expandir books_1.json de 256 a 300."""
    books_path = Path("webs_server/initial_data/web_2_demo_books/data/books_1.json")

    with open(books_path, "r", encoding="utf-8") as f:
        books = json.load(f)

    current_count = len(books)
    target = 300
    needed = target - current_count

    if needed <= 0:
        print(f"✅ Books ya tiene {current_count} elementos (objetivo: {target})")
        return

    print(f"📚 Expandiendo books: {current_count} → {target} (necesitamos {needed} más)")

    # Duplicar y variar libros existentes
    random.seed(43)  # Para reproducibilidad (diferente seed)
    new_books = []

    for i in range(needed):
        # Seleccionar un libro aleatorio del pool existente
        base_book = random.choice(books)

        # Crear variación
        new_book = base_book.copy()
        new_book["id"] = f"book-exp-{i + 1:03d}"
        new_book["title"] = f"{base_book.get('title', 'Book')} (Edition {i + 1})"

        # Variar año ligeramente
        if "year" in new_book:
            new_book["year"] = new_book["year"] + random.randint(-2, 2)
            new_book["year"] = max(1900, min(2024, new_book["year"]))

        # Variar rating ligeramente
        if "rating" in new_book:
            new_book["rating"] = round(new_book["rating"] + random.uniform(-0.3, 0.3), 1)
            new_book["rating"] = max(0.0, min(5.0, new_book["rating"]))

        new_books.append(new_book)

    # Añadir nuevos libros
    books.extend(new_books)

    # Guardar
    with open(books_path, "w", encoding="utf-8") as f:
        json.dump(books, f, indent=2, ensure_ascii=False)

    print(f"✅ Books expandido: {len(books)} elementos")


if __name__ == "__main__":
    print("🚀 Expandiendo datos a 300 elementos...\n")

    try:
        expand_movies()
        print()
        expand_books()
        print()
        print("✅ ¡Expansión completa!")
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
