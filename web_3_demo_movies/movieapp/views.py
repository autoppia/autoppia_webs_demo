from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q
from django.contrib import messages

from .forms import MovieForm
from .models import Movie, Genre

# Create your views here.
def index(request):
    # Procesar búsqueda si existe
    search_query = request.GET.get('search', '')
    
    if search_query:
        # Búsqueda en múltiples campos
        movies = Movie.objects.filter(
            Q(name__icontains=search_query) |
            Q(desc__icontains=search_query) |
            Q(director__icontains=search_query) |
            Q(cast__icontains=search_query)
        ).distinct()
    else:
        movies = Movie.objects.all()
    
    context = {
        'movie_list': movies,
        'search_query': search_query
    }
    return render(request, 'index.html', context)

def detail(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)
    
    # Obtener películas relacionadas (del mismo género o año)
    related_movies = Movie.objects.filter(
        Q(genres__in=movie.genres.all()) | Q(year=movie.year)
    ).exclude(id=movie.id).distinct()[:4]  # Limitar a 4 películas
    
    context = {
        'movie': movie,
        'related_movies': related_movies
    }
    return render(request, "details.html", context)

def add_movie(request):
    if request.method == "POST":
        form = MovieForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, 'Película añadida correctamente.')
            return redirect('movieapp:index')
        else:
            messages.error(request, 'Por favor, corrige los errores en el formulario.')
    else:
        form = MovieForm()  # Formulario vacío para GET request
    
    return render(request, 'add.html', {'form': form})

def update(request, id):
    movie = get_object_or_404(Movie, id=id)
    
    if request.method == "POST":
        form = MovieForm(request.POST, request.FILES, instance=movie)
        if form.is_valid():
            form.save()
            messages.success(request, 'Película actualizada correctamente.')
            return redirect('movieapp:detail', movie_id=id)
        else:
            messages.error(request, 'Por favor, corrige los errores en el formulario.')
    else:
        form = MovieForm(instance=movie)
    
    return render(request, 'edit.html', {'form': form, 'movie': movie})

def delete(request, id):
    movie = get_object_or_404(Movie, id=id)
    
    if request.method == 'POST':
        movie.delete()
        messages.success(request, 'Película eliminada correctamente.')
        return redirect('/')
    
    return render(request, 'delete.html', {'movie': movie})

def genre_list(request):
    genres = Genre.objects.all()
    return render(request, 'genres.html', {'genres': genres})

def genre_detail(request, genre_id):
    genre = get_object_or_404(Genre, id=genre_id)
    movies = Movie.objects.filter(genres=genre)
    
    context = {
        'genre': genre,
        'movies': movies
    }
    return render(request, 'genre_detail.html', {'genre': genre, 'movies': movies})