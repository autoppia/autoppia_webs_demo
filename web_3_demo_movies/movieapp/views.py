from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q
from django.contrib import messages
from django.utils import timezone
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.urls import reverse

from .forms import (
    MovieForm, CommentForm, CustomLoginForm, SignUpForm, 
    UserProfileForm, UserForm,ContactForm
)
from .models import Movie, Genre, Comment, UserProfile, ContactMessage
from events.models import Event

# Create your views here.
def index(request):
    # Obtener todos los géneros para el dropdown de filtro
    all_genres = Genre.objects.all().order_by('name')
    
    # Obtener parámetros de búsqueda
    search_query = request.GET.get('search', '')
    genre_filter = request.GET.get('genre', '')
    
    # Comenzar con todas las películas
    movies = Movie.objects.all()
    
    # Aplicar filtro de búsqueda si se proporciona
    if search_query:
        movies = movies.filter(
            Q(name__icontains=search_query) |
            Q(desc__icontains=search_query) |
            Q(director__icontains=search_query) |
            Q(cast__icontains=search_query)
        ).distinct()
    
    # Aplicar filtro de género si se proporciona
    if genre_filter:
        try:
            genre_id = int(genre_filter)
            genre = Genre.objects.get(id=genre_id)
            movies = movies.filter(genres=genre)
        except (ValueError, Genre.DoesNotExist):
            # ID de género inválido, ignorar filtro
            pass
    
    context = {
        'movie_list': movies,
        'search_query': search_query,
        'genres': all_genres,
        'selected_genre': genre_filter
    }
    return render(request, 'index.html', context)

def about(request):
    return render(request, 'about.html')
def detail(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)
    
    # Obtener películas relacionadas por género
    related_movies = []
    if movie.genres.exists():
        # Obtener películas que comparten al menos un género con la película actual,
        # excluyendo la película actual
        related_movies = Movie.objects.filter(
            genres__in=movie.genres.all()
        ).exclude(id=movie.id).distinct()[:4]
    
    # Si no tenemos suficientes películas relacionadas por género, completar con películas del mismo año
    if len(related_movies) < 4:
        more_movies = Movie.objects.filter(
            year=movie.year
        ).exclude(
            id__in=[m.id for m in list(related_movies) + [movie]]
        )[:4-len(related_movies)]
        
        related_movies = list(related_movies) + list(more_movies)
        
    # Si aún no tenemos 4 películas, agregar algunas aleatorias
    if len(related_movies) < 4:
        random_movies = Movie.objects.exclude(
            id__in=[m.id for m in list(related_movies) + [movie]]
        ).order_by('?')[:4-len(related_movies)]
        
        related_movies = list(related_movies) + list(random_movies)
    
    # Obtener comentarios
    comments = movie.comments.all()
    
    context = {
        'movie': movie,
        'related_movies': related_movies,
        'comments': comments
    }
    return render(request, "details.html", context)

def add_comment(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)
    
    if request.method == 'POST':
        name = request.POST.get('name', '')
        if request.user.is_authenticated:
            name = request.user.username
            
        content = request.POST.get('content', '')
        
        if name and content:
            comment = Comment.objects.create(
                movie=movie,
                name=name,
                content=content
            )
            
            # Para solicitudes AJAX para actualizar la sección de comentarios sin recargar la página
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
                        'avatar': comment.avatar.url if comment.avatar else None
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
    return render(request, 'genre_detail.html', context)
# Vista de contacto simplificada - Solo guarda en la base de datos
def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            subject = form.cleaned_data['subject']
            message = form.cleaned_data['message']
            
            # Guardar el mensaje en la base de datos
            contact_message = ContactMessage.objects.create(
                name=name,
                email=email,
                subject=subject,
                message=message
            )
            
            # Mostrar mensaje de éxito
            messages.success(request, 'Your message has been received successfully. We will review it soon!')
            
            # Redireccionar para evitar reenvíos del formulario
            return redirect('movieapp:contact')
    else:
        form = ContactForm()  # Formulario vacío para solicitudes GET
    
    return render(request, 'contact.html', {'form': form})
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q
from django.contrib import messages
from django.utils import timezone
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.contrib.auth.models import User

from .models import Movie, Genre, Comment, UserProfile

# Authentication Views
def login_view(request):
    if request.user.is_authenticated:
        return redirect('movieapp:index')
    
    # Si el usuario ya está autenticado, redirigir a la página principal
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            
            # Registrar evento de login usando el X-WebAgent-Id del header
            web_agent_id = request.headers.get("X-WebAgent-Id", 0)
            login_event = Event.create_login_event(user, web_agent_id)
            login_event.save()
            
            next_url = request.GET.get('next', reverse('movieapp:index'))
            messages.success(request, f'Welcome back, {username}!')
            return redirect(next_url)
        else:
            messages.error(request, 'Invalid username or password.')
    
    return render(request, 'login.html')

def logout_view(request):
    web_agent_id = request.headers.get("X-WebAgent-Id", 0)
    register_event = Event.create_logout_event(request.user, web_agent_id)
    logout(request)
    register_event.save()    
    messages.success(request, 'You have been logged out successfully.')
    return redirect('movieapp:index')

def register_view(request):
    if request.user.is_authenticated:
        return redirect('movieapp:index')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        
        # Validación básica
        error = False
        
        if not username or not email or not password1 or not password2:
            messages.error(request, 'All fields are required.')
            error = True
        
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists.')
            error = True
            
        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already in use.')
            error = True
            
        if password1 != password2:
            messages.error(request, 'Passwords do not match.')
            error = True
            
        if len(password1) < 8:
            messages.error(request, 'Password must be at least 8 characters long.')
            error = True
            
        if not error:
            # Crear el usuario
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password1
            )
                 
            # Registrar evento de login usando el X-WebAgent-Id del header
            web_agent_id = request.headers.get("X-WebAgent-Id", 0)
            register_event = Event.create_registration_event(user, web_agent_id)
            register_event.save()
            login(request, user)
            login_event = Event.create_login_event(user, web_agent_id)
            login_event.save()
            
            messages.success(request, f'Account created successfully. Welcome, {username}!')
            return redirect('movieapp:index')
    
    return render(request, 'register.html')

@login_required
def profile_view(request):
    user = request.user
    
    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        # Si el perfil no existe, créalo
        profile = UserProfile.objects.create(user=user)
    
    if request.method == 'POST':
        # Actualizar información del usuario
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        email = request.POST.get('email', '')
        bio = request.POST.get('bio', '')
        location = request.POST.get('location', '')
        website = request.POST.get('website', '')
        
        # Actualizar usuario
        user.first_name = first_name
        user.last_name = last_name
        
        # Verificar si el email ya existe
        if email != user.email and User.objects.filter(email=email).exists():
            messages.error(request, 'Email already in use by another account.')
        else:
            user.email = email
            user.save()
        
        # Actualizar perfil
        profile.bio = bio
        profile.location = location
        profile.website = website
        
        # Manejar la imagen de perfil
        if 'profile_pic' in request.FILES:
            profile.profile_pic = request.FILES['profile_pic']
        
        # Manejar géneros favoritos
        if 'favorite_genres' in request.POST:
            profile.favorite_genres.clear()
            genre_ids = request.POST.getlist('favorite_genres')
            for genre_id in genre_ids:
                try:
                    genre = Genre.objects.get(id=int(genre_id))
                    profile.favorite_genres.add(genre)
                except (ValueError, Genre.DoesNotExist):
                    pass
        
        profile.save()
        messages.success(request, 'Your profile has been updated successfully!')
        return redirect('movieapp:profile')
    
    # Obtener todos los géneros para el formulario
    all_genres = Genre.objects.all().order_by('name')
    
    context = {
        'profile': profile,
        'genres': all_genres,
        'selected_genres': [g.id for g in profile.favorite_genres.all()]
    }
    
    return render(request, 'profile.html', context)