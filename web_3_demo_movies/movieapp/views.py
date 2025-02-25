from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q
from django.contrib import messages
from django.utils import timezone
from django.views.decorators.http import require_POST

from .forms import MovieForm, CommentForm
from .models import Movie, Genre, Comment

# Create your views here.
def index(request):
    # Process search if exists
    search_query = request.GET.get('search', '')
    
    if search_query:
        # Search in multiple fields
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
    
    # Get related movies by genre
    related_movies = []
    if movie.genres.exists():
        # Get movies that share at least one genre with the current movie,
        # excluding the current movie itself
        related_movies = Movie.objects.filter(
            genres__in=movie.genres.all()
        ).exclude(id=movie.id).distinct()[:4]
    
    # If we don't have enough related movies by genre, fill with movies from the same year
    if len(related_movies) < 4:
        more_movies = Movie.objects.filter(
            year=movie.year
        ).exclude(
            id__in=[m.id for m in list(related_movies) + [movie]]
        )[:4-len(related_movies)]
        
        related_movies = list(related_movies) + list(more_movies)
        
    # If we still don't have 4 movies, add some random ones
    if len(related_movies) < 4:
        random_movies = Movie.objects.exclude(
            id__in=[m.id for m in list(related_movies) + [movie]]
        ).order_by('?')[:4-len(related_movies)]
        
        related_movies = list(related_movies) + list(random_movies)
    
    # Get comments and prepare the comment form
    comments = movie.comments.all()
    comment_form = CommentForm()
    
    context = {
        'movie': movie,
        'related_movies': related_movies,
        'comments': comments,
        'comment_form': comment_form
    }
    return render(request, "details.html", context)

@require_POST
def add_comment(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)
    
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.movie = movie
            comment.created_at = timezone.now()
            
            # If avatar is not provided, use default or random avatar logic could be added here
            # comment.avatar = ...
            
            comment.save()
            
            # For AJAX requests to update the comments section without page reload
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'success',
                    'comment': {
                        'name': comment.name,
                        'content': comment.content,
                        'created_at': comment.created_at.strftime('%b %d, %Y, %I:%M %p'),
                        'time_ago': f"{(timezone.now() - comment.created_at).days} days ago" 
                                  if (timezone.now() - comment.created_at).days > 0 
                                  else "Today",
                        'avatar': comment.avatar.url if comment.avatar else '/media/gallery/people/default-avatar.jpg'
                    }
                })
            
            messages.success(request, 'Your comment has been added successfully!')
            return redirect('movieapp:detail', movie_id=movie.id)
    
    messages.error(request, 'There was a problem with your comment.')
    return redirect('movieapp:detail', movie_id=movie.id)

def add_movie(request):
    if request.method == "POST":
        form = MovieForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, 'Movie added successfully.')
            return redirect('movieapp:index')
        else:
            messages.error(request, 'Please correct the errors in the form.')
    else:
        form = MovieForm()  # Empty form for GET request
    
    return render(request, 'add.html', {'form': form})

def update(request, id):
    movie = get_object_or_404(Movie, id=id)
    
    if request.method == "POST":
        form = MovieForm(request.POST, request.FILES, instance=movie)
        if form.is_valid():
            form.save()
            messages.success(request, 'Movie updated successfully.')
            return redirect('movieapp:detail', movie_id=id)
        else:
            messages.error(request, 'Please correct the errors in the form.')
    else:
        form = MovieForm(instance=movie)
    
    return render(request, 'edit.html', {'form': form, 'movie': movie})

def delete(request, id):
    movie = get_object_or_404(Movie, id=id)
    
    if request.method == 'POST':
        movie.delete()
        messages.success(request, 'Movie deleted successfully.')
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