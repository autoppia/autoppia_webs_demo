import logging

from django.contrib import messages
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.conf import settings

from events.models import Event
from .forms import MovieForm, ContactForm
from .utils import stable_shuffle, redirect_with_seed, normalize_v2_seed
from .models import Movie, Genre, Comment, UserProfile, ContactMessage
from movieapp.context import dynamic_context
from movieapp.services.v2_dataset_loader import ensure_movies_for_seed
from .seeded_loader import is_db_load_mode_enabled, load_movies_from_api
from .seeded_selector import seeded_distribution, seeded_select

logger = logging.getLogger(__name__)


class ImgProxy:
    """Proxy for img field to support .url attribute."""
    def __init__(self, img_path):
        self.path = img_path or ""
    
    @property
    def url(self):
        return self.path
    
    def __str__(self):
        return self.path
    
    def __bool__(self):
        return bool(self.path)


class MovieProxy:
    """Proxy object to make API movie dictionaries work like Movie model instances."""
    def __init__(self, data: dict):
        self._data = data
        # Map common fields - web_1 uses 'title' instead of 'name'
        self.id = data.get("id", data.get("movie_id", 0))
        self.name = data.get("title", data.get("name", ""))
        self.desc = data.get("description", data.get("desc", ""))
        self.year = data.get("year", 0)
        
        # Wrap img in ImgProxy to support .url attribute
        img_path = data.get("image_path", data.get("img", ""))
        self.img = ImgProxy(img_path)
        
        self.director = data.get("director", "")
        self.cast = ", ".join(data.get("cast", [])) if isinstance(data.get("cast"), list) else data.get("cast", "")
        self.duration = data.get("duration", 0)
        self.trailer_url = data.get("trailer_url", "")
        self.rating = data.get("rating", 0.0)
        self.genres = GenreProxyList(data.get("genres", []))
        self.created_at = data.get("created_at", None)
        self.updated_at = data.get("updated_at", None)
    
    def get_genre_list(self):
        return ", ".join(self.genres.names)
    
    def __getattr__(self, name):
        # Fallback to data dict
        return self._data.get(name, None)


class GenreProxyList:
    """Proxy for genres list from API."""
    def __init__(self, genres_data):
        if isinstance(genres_data, list):
            if not genres_data:
                self.names = []
            elif isinstance(genres_data[0], str):
                self.names = genres_data
            else:
                self.names = [g.get("name", "") if isinstance(g, dict) else str(g) for g in genres_data]
        else:
            self.names = []
    
    def all(self):
        return [GenreProxy(name) for name in self.names]
    
    def __iter__(self):
        """Make it iterable for template loops."""
        return iter(self.all())
    
    def __len__(self):
        """Support len() calls."""
        return len(self.names)


class GenreProxy:
    """Proxy for individual genre."""
    def __init__(self, name):
        self.name = name
        self.id = hash(name) % 1000  # Simple hash-based ID


def get_movies_queryset_for_request(request, dynamic_ctx):
    """
    Get movies for the request. Can load from API, from DB master pool, or from DB depending on configuration.
    Returns: (movies_list, v2_seed_used, is_from_api)
    """
    v2_enabled = bool(dynamic_ctx.get("ENABLE_DYNAMIC_V2_DB_MODE"))
    v2_seed = dynamic_ctx.get("V2_SEED")
    
    if v2_enabled and v2_seed:
        # NEW APPROACH: Load from master pool in DB and filter deterministically
        master_movies = Movie.objects.filter(v2_master=True)
        master_count = master_movies.count()
        
        if master_count > 0:
            # Ensure we have enough movies in pool (minimum 256 for proper distribution)
            if master_count < 256:
                logger.warning(
                    f"Master pool has only {master_count} movies (minimum 256 recommended). "
                    f"Some seeds may have limited variety."
                )
            
            # Convert QuerySet to list for seeded selection
            master_list = list(master_movies)
            
            # Use seeded_distribution to select deterministically (same as webs_server)
            # Select up to 50 movies, but ensure we don't exceed pool size
            select_count = min(50, master_count)
            selected_movies = seeded_distribution(
                data_pool=master_list,
                seed=v2_seed,
                category_key='genres',  # Distribute by genres
                total_count=select_count
            )
            
            return selected_movies, v2_seed, False  # False = from DB, not API
        
        # Fallback: Try API if no master pool exists
        try:
            if is_db_load_mode_enabled():
                api_movies_data = load_movies_from_api(seed_value=v2_seed, limit=200)
                if api_movies_data:
                    # Convert to MovieProxy objects
                    movies_list = [MovieProxy(movie_data) for movie_data in api_movies_data]
                    return movies_list, v2_seed, True
        except Exception as exc:
            logger.warning("Could not load from API (seed=%s): %s. Trying DB fallback.", v2_seed, exc)
        
        # Fallback to old DB approach
        try:
            ensure_movies_for_seed(v2_seed)
            return Movie.objects.filter(v2_seed=v2_seed), v2_seed, False
        except Exception as exc:
            logger.error("Failed to load v2 dataset (seed=%s): %s", v2_seed, exc)
            messages.error(request, "Unable to load dynamic dataset. Showing the default catalog instead.")
    
    return Movie.objects.filter(v2_seed__isnull=True, v2_master=False), None, False


def index(request, variant=None):
    """
    Vista principal que muestra la lista de películas con opciones de búsqueda y filtrado.
    """
    dynamic_ctx = dynamic_context(request)
    seed = dynamic_ctx.get("INITIAL_SEED", 1)
    variant_val = dynamic_ctx.get("LAYOUT_VARIANT", 1)

    movies_source, active_v2_seed, is_from_api = get_movies_queryset_for_request(request, dynamic_ctx)
    
    # Check if movies_source is a list (from API or DB master pool)
    if isinstance(movies_source, list):
        # Movies from API (MovieProxy) or DB master pool (Movie instances)
        movies_list = movies_source
        
        # Get genres - handle both MovieProxy and Movie instances
        all_genres_set = set()
        for movie in movies_list:
            if hasattr(movie, 'genres'):
                if hasattr(movie.genres, 'names'):  # MovieProxy
                    all_genres_set.update(movie.genres.names)
                elif hasattr(movie.genres, 'all'):  # Movie instance with ManyToMany
                    for genre in movie.genres.all():
                        all_genres_set.add(genre.name)
        
        all_genres = [GenreProxy(name) for name in sorted(all_genres_set)]
        
        # Get available years
        available_years = sorted(set(movie.year for movie in movies_list if movie.year), reverse=True)
        
        # Apply filters
        search_query = request.GET.get("search", "")
        genre_filter = request.GET.get("genre", "")
        year_filter = request.GET.get("year", "")
        
        # Filter movies
        filtered_movies = movies_list
        if search_query:
            search_lower = search_query.lower()
            filtered_movies = [
                m for m in filtered_movies
                if search_lower in m.name.lower() or search_lower in m.desc.lower() or search_lower in m.director.lower()
            ]
        
        if genre_filter:
            try:
                genre_id = int(genre_filter)
                selected_genre = next((g for g in all_genres if g.id == genre_id), None)
                if selected_genre:
                    # Handle both MovieProxy and Movie instances
                    filtered_movies = [
                        m for m in filtered_movies
                        if (hasattr(m.genres, 'names') and selected_genre.name in m.genres.names) or
                           (hasattr(m.genres, 'all') and any(g.name == selected_genre.name for g in m.genres.all()))
                    ]
            except ValueError:
                pass
        
        if year_filter:
            try:
                year_value = int(year_filter)
                filtered_movies = [m for m in filtered_movies if m.year == year_value]
            except ValueError:
                pass
        
        # Apply seed-based shuffle (v1 seed for layout)
        movie_list = stable_shuffle(filtered_movies, seed, salt="movies")
        genre_list = stable_shuffle(all_genres, seed, salt="genres")
        
        context = {
            "movie_list": movie_list,
            "search_query": search_query,
            "genres": genre_list,
            "available_years": available_years,
            "selected_genre": genre_filter,
            "selected_year": year_filter,
        }
        return render(request, "index.html", context)
    
    # Movies from DB (original behavior)
    base_movies_qs = movies_source
    available_years = base_movies_qs.values_list("year", flat=True).distinct().order_by("-year")
    movies = base_movies_qs.prefetch_related("genres")

    if active_v2_seed:
        all_genres = Genre.objects.filter(movies__v2_seed=active_v2_seed).distinct().order_by("name")
    else:
        all_genres = Genre.objects.all().order_by("name")

    search_query = request.GET.get("search", "")
    genre_filter = request.GET.get("genre", "")
    year_filter = request.GET.get("year", "")

    # Aplicar filtro de búsqueda si se proporciona
    if search_query:
        movies = movies.filter(Q(name__icontains=search_query) | Q(desc__icontains=search_query) | Q(director__icontains=search_query) | Q(cast__icontains=search_query)).distinct()

        from events.models import Event

        search_event = Event.create_search_film_event(
            user=request.user if request.user.is_authenticated else None,
            web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
            validator_id=request.headers.get("X-Validator-Id", "0"),
            query=search_query,
        )
        search_event.save()

    # Verificar si se aplicó algún filtro (género o año)
    filter_applied = False
    genre_obj = None
    year_value = None

    # Aplicar filtro de género si se proporciona
    if genre_filter:
        filter_applied = True
        try:
            genre_id = int(genre_filter)
            genre_obj = Genre.objects.get(id=genre_id)
            movies = movies.filter(genres=genre_obj)
        except (ValueError, Genre.DoesNotExist):
            # ID de género inválido, ignorar filtro
            pass

    # Aplicar filtro de año si se proporciona
    if year_filter:
        filter_applied = True
        try:
            year_value = int(year_filter)
            movies = movies.filter(year=year_value)
        except ValueError:
            # Valor de año inválido, ignorar filtro
            pass

    # Crear evento de filtro si se aplicó algún filtro
    if filter_applied:
        from events.models import Event

        filter_event = Event.create_filter_film_event(
            user=request.user if request.user.is_authenticated else None,
            web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
            validator_id=request.headers.get("X-Validator-Id", "0"),
            genre=genre_obj,
            year=year_value,
        )
        filter_event.save()

    # Server-side dynamic order and variant based on seed / explicit variant
    movie_list = stable_shuffle(movies, seed, salt="movies")
    genre_list = stable_shuffle(all_genres, seed, salt="genres")
    years_list = stable_shuffle(available_years, seed, salt="years")

    context = {
        "movie_list": movie_list,
        "search_query": search_query,
        "genres": genre_list,
        "available_years": years_list,
        "selected_genre": genre_filter,
        "selected_year": year_filter,
        "LAYOUT_VARIANT": variant_val,
        "INITIAL_SEED": seed,
    }
    return render(request, "index.html", context)


def about(request):
    """Vista de la página "Acerca de"."""
    return render(request, "about.html")


# =============================================================================
#                            VISTAS DE PELÍCULAS
# =============================================================================


def detail(request, movie_id, variant=None):
    """
    Vista de detalle de película: muestra información, películas relacionadas y comentarios.
    Además, registra el evento de visualización de detalle.
    """
    dynamic_ctx = dynamic_context(request)
    seed = dynamic_ctx.get("INITIAL_SEED", 1)
    variant_val = dynamic_ctx.get("LAYOUT_VARIANT", 1)

    base_movies_qs, _ = get_movies_queryset_for_request(request, dynamic_ctx)
    movie_queryset = base_movies_qs.prefetch_related("genres")
    movie = get_object_or_404(movie_queryset, id=movie_id)
    web_agent_id = request.headers.get("X-WebAgent-Id", "0")
    validator_id = request.headers.get("X-Validator-Id", "0")

    # Registrar evento de detalle de película
    detail_event = Event.create_film_detail_event(
        request.user if request.user.is_authenticated else None,
        web_agent_id,
        movie,
        validator_id=validator_id,
    )
    detail_event.save()

    related_movies = []
    if movie.genres.exists():
        related_movies = (
            base_movies_qs.filter(genres__in=movie.genres.all())
            .exclude(id=movie.id)
            .distinct()
            .prefetch_related("genres")[:4]
        )

    if len(related_movies) < 4:
        more_movies = (
            base_movies_qs.filter(year=movie.year)
            .exclude(id__in=[m.id for m in list(related_movies) + [movie]])
            .prefetch_related("genres")[: 4 - len(related_movies)]
        )
        related_movies = list(related_movies) + list(more_movies)

    if len(related_movies) < 4:
        remaining_needed = 4 - len(related_movies)
        excluded_ids = [m.id for m in list(related_movies) + [movie]]
        candidate_ids = list(
            base_movies_qs.exclude(id__in=excluded_ids).order_by("id").values_list("id", flat=True)[:100]
        )
        shuffled_ids = stable_shuffle(candidate_ids, seed, salt="related-fallback")
        extra_ids = shuffled_ids[:remaining_needed]
        extra_movies_qs = base_movies_qs.filter(id__in=extra_ids).prefetch_related("genres")
        id_to_movie = {m.id: m for m in extra_movies_qs}
        related_movies = list(related_movies) + [id_to_movie[i] for i in extra_ids if i in id_to_movie]

    # Server-side shuffle related movies by seed for deterministic order
    related_movies = stable_shuffle(related_movies, seed, salt="related")

    comments = movie.comments.all()

    context = {
        "movie": movie,
        "related_movies": related_movies,
        "comments": comments,
        "LAYOUT_VARIANT": variant_val,
        "INITIAL_SEED": seed,
    }
    return render(request, "details.html", context)


def add_movie(request, variant=None):
    """
    Vista para registrar un evento de ADD_FILM sin guardar la película.
    """
    if request.method == "POST":
        form = MovieForm(request.POST, request.FILES)
        if form.is_valid():
            # Preparar los valores a añadir
            new_values = {
                "name": form.cleaned_data.get("name"),
                "desc": form.cleaned_data.get("desc"),
                "year": form.cleaned_data.get("year"),
                "director": form.cleaned_data.get("director"),
                "cast": form.cleaned_data.get("cast"),
                "duration": form.cleaned_data.get("duration"),
                "trailer_url": form.cleaned_data.get("trailer_url"),
                "rating": (float(form.cleaned_data.get("rating")) if form.cleaned_data.get("rating") else 0),
                "genres": ([form.cleaned_data.get("genres")] if isinstance(form.cleaned_data.get("genres"), Genre) else [genre for genre in form.cleaned_data.get("genres", [])]),
            }

            # Crear el evento de añadir película
            add_film_event = Event.create_add_film_event(
                user=request.user if request.user.is_authenticated else None,
                web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
                validator_id=request.headers.get("X-Validator-Id", "0"),
                movie_data=new_values,
            )
            add_film_event.save()

            messages.success(request, "Evento de añadir película registrado exitosamente.")
            return redirect_with_seed(request, "movieapp:index")
        else:
            messages.error(request, "Por favor, corrige los errores en el formulario.")
    else:
        form = MovieForm()

    dynamic_ctx = dynamic_context(request)
    seed = dynamic_ctx.get("INITIAL_SEED", 1)
    variant_val = dynamic_ctx.get("LAYOUT_VARIANT", 1)
    return render(
        request,
        "add.html",
        {"form": form, "LAYOUT_VARIANT": variant_val, "INITIAL_SEED": seed},
    )


def update_movie(request, id, variant=None):
    """
    Vista para actualizar una película existente.
    Registra el evento de EDIT_FILM si se detectan cambios, pero NO guarda los cambios en la BD.
    """
    movie = get_object_or_404(Movie, id=id)
    if movie.v2_seed is not None:
        messages.error(request, "Editing V2 generated movies is not supported.")
        return redirect_with_seed(request, "movieapp:detail", movie_id=id)
    original_values = {
        "name": movie.name,
        "desc": movie.desc,
        "year": movie.year,
        "director": movie.director,
        "cast": movie.cast,
        "duration": movie.duration,
        "trailer_url": movie.trailer_url,
        "rating": float(movie.rating) if movie.rating else None,
        "genres": [genre.name for genre in movie.genres.all()],
    }

    if request.method == "POST":
        form = MovieForm(request.POST, request.FILES, instance=movie)
        if form.is_valid():
            # Obtiene el objeto actualizado SIN guardar en la base de datos
            updated_movie = form.save(commit=False)

            new_values = {}
            changed_fields = []

            if form.cleaned_data.get("name") != original_values["name"]:
                changed_fields.append("name")
                new_values["name"] = form.cleaned_data.get("name")
            if form.cleaned_data.get("desc") != original_values["desc"]:
                changed_fields.append("desc")
                new_values["desc"] = form.cleaned_data.get("desc")
            if form.cleaned_data.get("year") != original_values["year"]:
                changed_fields.append("year")
                new_values["year"] = form.cleaned_data.get("year")
            if form.cleaned_data.get("director") != original_values["director"]:
                changed_fields.append("director")
                new_values["director"] = form.cleaned_data.get("director")
            if form.cleaned_data.get("cast") != original_values["cast"]:
                changed_fields.append("cast")
                new_values["cast"] = form.cleaned_data.get("cast")
            if form.cleaned_data.get("duration") != original_values["duration"]:
                changed_fields.append("duration")
                new_values["duration"] = form.cleaned_data.get("duration")
            if form.cleaned_data.get("trailer_url") != original_values["trailer_url"]:
                changed_fields.append("trailer_url")
                new_values["trailer_url"] = form.cleaned_data.get("trailer_url")

            current_rating = float(form.cleaned_data.get("rating")) if form.cleaned_data.get("rating") else None
            if current_rating != original_values["rating"]:
                changed_fields.append("rating")
                new_values["rating"] = current_rating

            # Procesar los géneros: se asume que el formulario devuelve una lista de objetos género
            selected_genre = form.cleaned_data.get("genres")
            updated_genres = [selected_genre.name] if selected_genre else []

            if updated_genres != original_values["genres"]:
                changed_fields.append("genres")
                new_values["genres"] = updated_genres

            if changed_fields:
                event = Event.create_edit_film_event(
                    user=request.user if request.user.is_authenticated else None,
                    web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
                    validator_id=request.headers.get("X-Validator-Id", "0"),
                    movie=movie,
                    previous_values=original_values,
                    changed_fields=changed_fields,
                    new_values=new_values,
                )
                event.save()
                updated_movie.save()
                # form.save_m2m()

            messages.success(
                request,
                "Event added successfully ",
            )
            return redirect_with_seed(request, "movieapp:detail", movie_id=id)
        else:
            messages.error(request, "Please, fix your bugs in the form")
    else:
        form = MovieForm(instance=movie)

    dynamic_ctx = dynamic_context(request)
    seed = dynamic_ctx.get("INITIAL_SEED", 1)
    variant_val = dynamic_ctx.get("LAYOUT_VARIANT", 1)
    return render(
        request,
        "edit.html",
        {
            "form": form,
            "movie": movie,
            "LAYOUT_VARIANT": variant_val,
            "INITIAL_SEED": seed,
        },
    )


def delete_movie(request, id, variant=None):
    """
    Vista para eliminar una película y registrar el evento de DELETE_FILM.
    """
    movie = get_object_or_404(Movie, id=id)
    if movie.v2_seed is not None:
        messages.error(request, "Deleting V2 generated movies is not supported.")
        return redirect_with_seed(request, "movieapp:detail", movie_id=id)

    if request.method == "POST":
        delete_film_event = Event.create_delete_film_event(
            user=request.user if request.user.is_authenticated else None,
            web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
            validator_id=request.headers.get("X-Validator-Id", "0"),
            movie=movie,
        )
        delete_film_event.save()
        # movie.delete()
        messages.success(request, "Movie deleted successfully.")
        return redirect_with_seed(request, "movieapp:index")
    dynamic_ctx = dynamic_context(request)
    seed = dynamic_ctx.get("INITIAL_SEED", 1)
    variant_val = dynamic_ctx.get("LAYOUT_VARIANT", 1)
    return render(
        request,
        "delete.html",
        {"movie": movie, "LAYOUT_VARIANT": variant_val, "INITIAL_SEED": seed},
    )


def add_comment(request, movie_id):
    """
    Vista para agregar un comentario a una película.
    Registra el evento de añadir comentario y, si la solicitud es AJAX, devuelve una respuesta JSON.
    """
    dynamic_ctx = dynamic_context(request)
    base_movies_qs, _ = get_movies_queryset_for_request(request, dynamic_ctx)
    movie = get_object_or_404(base_movies_qs, id=movie_id)

    if request.method == "POST":
        name = request.POST.get("name", "")
        if request.user.is_authenticated:
            name = request.user.username

        content = request.POST.get("content", "")

        if name and content:
            comment = Comment.objects.create(movie=movie, name=name, content=content)
            # Registrar evento de ADD_COMMENT
            add_comment_event = Event.create_add_comment_event(
                user=request.user if request.user.is_authenticated else None,
                web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
                validator_id=request.headers.get("X-Validator-Id", "0"),
                comment=comment,
                movie=movie,
            )
            add_comment_event.save()

            if request.headers.get("x-requested-with") == "XMLHttpRequest":
                return JsonResponse(
                    {
                        "status": "success",
                        "comment": {
                            "name": comment.name,
                            "content": comment.content,
                            "created_at": comment.created_at.strftime("%b %d, %Y, %I:%M %p"),
                            "time_ago": (f"{(timezone.now() - comment.created_at).days} days ago" if (timezone.now() - comment.created_at).days > 0 else "Today"),
                            "avatar": comment.avatar.url if comment.avatar else None,
                        },
                    }
                )

            messages.success(request, "Your comment has been added successfully!")
            return redirect_with_seed(request, "movieapp:detail", movie_id=movie.id)

    messages.error(request, "There was a problem with your comment.")
    return redirect_with_seed(request, "movieapp:detail", movie_id=movie.id)


def genre_list(request, variant=None):
    """
    Vista que muestra la lista de géneros.
    """
    dynamic_ctx = dynamic_context(request)
    seed = dynamic_ctx.get("INITIAL_SEED", 1)
    variant_val = dynamic_ctx.get("LAYOUT_VARIANT", 1)

    _, active_v2_seed = get_movies_queryset_for_request(request, dynamic_ctx)
    if active_v2_seed:
        genres = Genre.objects.filter(movies__v2_seed=active_v2_seed).distinct()
    else:
        genres = Genre.objects.filter(movies__v2_seed__isnull=True).distinct()
        if not genres.exists():
            genres = Genre.objects.all()

    genres_list = stable_shuffle(genres, seed, salt="genres-page")
    return render(
        request,
        "genres.html",
        {"genres": genres_list, "LAYOUT_VARIANT": variant_val, "INITIAL_SEED": seed},
    )


def genre_detail(request, genre_id, variant=None):
    """
    Vista que muestra los detalles de un género y las películas asociadas.
    """
    dynamic_ctx = dynamic_context(request)
    seed = dynamic_ctx.get("INITIAL_SEED", 1)
    variant_val = dynamic_ctx.get("LAYOUT_VARIANT", 1)
    base_movies_qs, _ = get_movies_queryset_for_request(request, dynamic_ctx)
    genre = get_object_or_404(Genre, id=genre_id)
    movies = base_movies_qs.filter(genres=genre).prefetch_related("genres")
    movies_list = stable_shuffle(movies, seed, salt="genre-detail")
    context = {
        "genre": genre,
        "movies": movies_list,
        "LAYOUT_VARIANT": variant_val,
        "INITIAL_SEED": seed,
    }
    return render(request, "genres_detail.html", context)


# =============================================================================
#                        CONTACT
# =============================================================================
def contact(request, variant=None):
    """
    Vista de contacto: guarda el mensaje en la base de datos y crea un evento.
    """
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data["name"]
            email = form.cleaned_data["email"]
            subject = form.cleaned_data["subject"]
            message = form.cleaned_data["message"]

            # Crear el mensaje de contacto
            contact_message = ContactMessage.objects.create(name=name, email=email, subject=subject, message=message)

            # Crear evento de CONTACT
            contact_event = Event.create_contact_event(
                user=request.user if request.user.is_authenticated else None,
                web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
                validator_id=request.headers.get("X-Validator-Id", "0"),
                contact=contact_message,
            )
            contact_event.save()

            messages.success(
                request,
                "Your message has been received successfully. We will review it soon!",
            )
            return redirect_with_seed(request, "movieapp:contact")
    else:
        form = ContactForm()
    dynamic_ctx = dynamic_context(request)
    seed = dynamic_ctx.get("INITIAL_SEED", 1)
    variant_val = dynamic_ctx.get("LAYOUT_VARIANT", 1)
    return render(
        request,
        "contact.html",
        {"form": form, "LAYOUT_VARIANT": variant_val, "INITIAL_SEED": seed},
    )


# =============================================================================
#                         VISTAS DE AUTENTICACIÓN
# =============================================================================


def login_view(request, variant=None):
    """
    Vista para iniciar sesión.
    Si el usuario ya está autenticado, redirige a la página principal.
    """
    if request.user.is_authenticated:
        return redirect_with_seed(request, "movieapp:index")

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            web_agent_id = request.headers.get("X-WebAgent-Id", "0")
            # login_event = Event.create_login_event(user, web_agent_id)
            # login_event.save()
            # add validation id to login event
            # (login_event already created above; create a new one with validator_id for backward compatibility)
            login_event = Event.create_login_event(
                user,
                web_agent_id,
                validator_id=request.headers.get("X-Validator-Id", "0"),
            )
            login_event.save()
            # Get seed from form or request
            seed = request.POST.get("seed") or request.GET.get("seed")

            # Handle next URL (where to redirect after login)
            next_url = request.GET.get("next") or request.POST.get("next")

            messages.success(request, f"Welcome back, {username}!")

            # Use redirect_with_seed to preserve seed across redirect
            if next_url:
                # If there's a specific next URL, redirect there with seed
                return redirect_with_seed(request, next_url, seed=seed)
            else:
                # Otherwise go to index with seed
                return redirect_with_seed(request, "movieapp:index", seed=seed)
        else:
            messages.error(request, "Invalid username or password.")
    dynamic_ctx = dynamic_context(request)
    seed = dynamic_ctx.get("INITIAL_SEED", 1)
    variant_val = dynamic_ctx.get("LAYOUT_VARIANT", 1)
    return render(request, "login.html", {"LAYOUT_VARIANT": variant_val, "INITIAL_SEED": seed})


def logout_view(request, variant=None):
    """
    Vista para cerrar sesión.
    Registra el evento de cierre de sesión antes de finalizar la sesión.
    """
    web_agent_id = request.headers.get("X-WebAgent-Id", "0")
    validator_id = request.headers.get("X-Validator-Id", "0")
    logout_event = Event.create_logout_event(request.user, web_agent_id, validator_id=validator_id)
    logout(request)
    logout_event.save()
    messages.success(request, "You have been logged out successfully.")
    return redirect_with_seed(request, "movieapp:index")


def register_view(request, variant=None):
    """
    Vista para registrar un nuevo usuario.
    Valida la información, crea el usuario, registra los eventos de registro e inicio de sesión y redirige a la página principal.
    """
    if request.user.is_authenticated:
        return redirect_with_seed(request, "movieapp:index")

    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password1 = request.POST.get("password1")
        password2 = request.POST.get("password2")

        error = False
        if not username or not email or not password1 or not password2:
            messages.error(request, "All fields are required.")
            error = True
        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists.")
            error = True
        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already in use.")
            error = True
        if password1 != password2:
            messages.error(request, "Passwords do not match.")
            error = True
        if len(password1) < 8:
            messages.error(request, "Password must be at least 8 characters long.")
            error = True

        if not error:
            user = User.objects.create_user(username=username, email=email, password=password1)
            web_agent_id = request.headers.get("X-WebAgent-Id", "0")
            register_event = Event.create_registration_event(
                user,
                web_agent_id,
                validator_id=request.headers.get("X-Validator-Id", "0"),
            )
            register_event.save()
            # login(request, user)
            # login_event = Event.create_login_event(user, web_agent_id)
            # login_event.save()
            messages.success(request, f"Account created successfully. Welcome, {username}!")
            return redirect_with_seed(request, "movieapp:index")

    dynamic_ctx = dynamic_context(request)
    seed = dynamic_ctx.get("INITIAL_SEED", 1)
    variant_val = dynamic_ctx.get("LAYOUT_VARIANT", 1)
    return render(request, "register.html", {"LAYOUT_VARIANT": variant_val, "INITIAL_SEED": seed})


@login_required
def profile_view(request, variant=None):
    """
    Vista para mostrar y actualizar el perfil del usuario.
    Permite actualizar datos personales, email, imagen y géneros favoritos.
    """
    user = request.user
    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=user)

    if request.method == "POST":
        # Save original values for change tracking
        previous_values = {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "bio": profile.bio,
            "location": profile.location,
            "website": profile.website,
            "has_profile_pic": bool(profile.profile_pic),
            "favorite_genres": [genre.name for genre in profile.favorite_genres.all()],
        }

        # Get form data
        first_name = request.POST.get("first_name", "")
        last_name = request.POST.get("last_name", "")
        email = request.POST.get("email", "")
        bio = request.POST.get("bio", "")
        location = request.POST.get("location", "")
        website = request.POST.get("website", "")

        # Update user model fields
        user.first_name = first_name
        user.last_name = last_name
        if email != user.email and User.objects.filter(email=email).exists():
            messages.error(request, "Email already in use by another account.")
        else:
            user.email = email
            user.save()

        # Update profile fields
        profile.bio = bio
        profile.location = location
        profile.website = website

        # Process profile picture if provided
        if "profile_pic" in request.FILES:
            profile.profile_pic = request.FILES["profile_pic"]

        # Process favorite genres
        if "favorite_genres" in request.POST:
            profile.favorite_genres.clear()
            genre_ids = request.POST.getlist("favorite_genres")
            for genre_id in genre_ids:
                try:
                    genre = Genre.objects.get(id=int(genre_id))
                    profile.favorite_genres.add(genre)
                except (ValueError, Genre.DoesNotExist):
                    pass

        # Save profile changes
        profile.save()

        # Create EDIT_USER event
        from events.models import Event

        edit_user_event = Event.create_edit_user_event(
            user=user,
            web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
            profile=profile,
            previous_values=previous_values,
            validator_id=request.headers.get("X-Validator-Id", "0"),
        )
        edit_user_event.save()

        messages.success(request, "Your profile has been updated successfully!")
        return redirect_with_seed(request, "movieapp:profile")

    # For GET requests, display the form
    all_genres = Genre.objects.all().order_by("name")
    context = {
        "profile": profile,
        "genres": all_genres,
        "selected_genres": [g.id for g in profile.favorite_genres.all()],
    }
    dynamic_ctx = dynamic_context(request)
    seed = dynamic_ctx.get("INITIAL_SEED", 1)
    variant_val = dynamic_ctx.get("LAYOUT_VARIANT", 1)
    context.update({"LAYOUT_VARIANT": variant_val, "INITIAL_SEED": seed})
    return render(request, "profile.html", context)
