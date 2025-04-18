from django.contrib import messages
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.utils import timezone

from events.models import Event
from .forms import BookForm, ContactForm
from .models import Book, Genre, Comment, UserProfile, ContactMessage, Cart


def index(request):
    """
    Vista principal que muestra la lista de películas con opciones de búsqueda y filtrado.
    """
    # Obtener todos los géneros para el dropdown de filtro
    all_genres = Genre.objects.all().order_by("name")

    # Obtener años disponibles para el filtro
    available_years = Book.objects.values_list("year", flat=True).distinct().order_by("-year")

    # Obtener parámetros de búsqueda y filtro
    search_query = request.GET.get("search", "")
    genre_filter = request.GET.get("genre", "")
    year_filter = request.GET.get("year", "")

    # Comenzar con todas las películas
    movies = Book.objects.all()

    # Aplicar filtro de búsqueda si se proporciona
    if search_query:
        movies = movies.filter(Q(name__icontains=search_query) | Q(desc__icontains=search_query) | Q(director__icontains=search_query)).distinct()

    from events.models import Event

    search_event = Event.create_search_book_event(
        user=request.user if request.user.is_authenticated else None,
        web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
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

        filter_event = Event.create_filter_book_event(
            user=request.user if request.user.is_authenticated else None,
            web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
            genre=genre_obj,
            year=year_value,
        )
        filter_event.save()

    context = {
        "movie_list": movies,
        "search_query": search_query,
        "genres": all_genres,
        "available_years": available_years,
        "selected_genre": genre_filter,
        "selected_year": year_filter,
    }
    return render(request, "index.html", context)


def about(request):
    """Vista de la página "Acerca de"."""
    return render(request, "about.html")


# =============================================================================
#                            VISTAS DE PELÍCULAS
# =============================================================================


def detail(request, movie_id):
    """
    Vista de detalle de película: muestra información, películas relacionadas y comentarios.
    Además, registra el evento de visualización de detalle.
    """
    book = get_object_or_404(Book, id=movie_id)
    web_agent_id = request.headers.get("X-WebAgent-Id", "0")

    # Registrar evento de detalle de película
    detail_event = Event.create_book_detail_event(request.user if request.user.is_authenticated else None, web_agent_id, book)
    detail_event.save()

    # Películas relacionadas
    related_movies = []
    if book.genres.exists():
        related_movies = Book.objects.filter(genres__in=book.genres.all()).exclude(id=book.id).distinct()[:4]

    if len(related_movies) < 4:
        more_movies = Book.objects.filter(year=book.year).exclude(id__in=[m.id for m in list(related_movies) + [book]])[: 4 - len(related_movies)]
        related_movies = list(related_movies) + list(more_movies)

    if len(related_movies) < 4:
        random_movies = Book.objects.exclude(id__in=[m.id for m in list(related_movies) + [book]]).order_by("?")[: 4 - len(related_movies)]
        related_movies = list(related_movies) + list(random_movies)

    comments = Comment.objects.filter(movie=book)

    carts = Cart.objects.filter(userId=request.user.id)

    context = {
        "movie": book,
        "related_movies": related_movies,
        "comments": comments,
        "carts": len(carts),
    }
    return render(request, "details.html", context)


def shoppingcart(request):
    userId = request.user.id
    carts = Cart.objects.filter(userId=userId)
    books = []
    for cart in carts:
        book = Book.objects.filter(id=cart.bookId).first()
        print(book)
        books.append(book)

    return render(request, "shoppingcart.html", {"movies": books, "carts": len(carts)})


def mybook(request):
    """
    Vista principal que muestra la lista de películas con opciones de búsqueda y filtrado.
    """
    # Obtener todos los géneros para el dropdown de filtro
    all_genres = Genre.objects.all().order_by("name")

    # Obtener años disponibles para el filtro
    available_years = Book.objects.values_list("year", flat=True).distinct().order_by("-year")

    # Obtener parámetros de búsqueda y filtro
    search_query = request.GET.get("search", "")
    genre_filter = request.GET.get("genre", "")
    year_filter = request.GET.get("year", "")
    print(request.user.id)
    # Comenzar con todas las películas
    movies = Book.objects.filter(userId=request.user.id)

    # Aplicar filtro de búsqueda si se proporciona
    if search_query:
        movies = movies.filter(Q(name__icontains=search_query) | Q(desc__icontains=search_query) | Q(director__icontains=search_query)).distinct()

    from events.models import Event

    search_event = Event.create_search_book_event(
        user=request.user if request.user.is_authenticated else None,
        web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
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

        filter_event = Event.create_filter_book_event(
            user=request.user if request.user.is_authenticated else None,
            web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
            genre=genre_obj,
            year=year_value,
        )
        filter_event.save()

    context = {
        "movie_list": movies,
        "search_query": search_query,
        "genres": all_genres,
        "available_years": available_years,
        "selected_genre": genre_filter,
        "selected_year": year_filter,
    }
    return render(request, "mybook.html", context)


def payment_success(request):
    return render(request, "payment_success.html")


def carts_count(request):
    userId = request.user.id
    carts = Cart.objects.filter(userId=userId)

    return JsonResponse({"count": len(carts)})


def delete_cart(request, id):
    userId = request.user.id
    cart = Cart.objects.filter(userId=userId, bookId=id)
    cart.delete()

    messages.success(request, "Book has been deleted from Cart.")
    return redirect("booksapp:shoppingcart")


def add_book(request):
    """
    Vista para agregar una nueva película y registrar el evento de ADD_FILM.
    """
    all_genres = Genre.objects.all().order_by("name")
    if request.method == "POST":
        form = BookForm(request.POST, request.FILES)
        if form.is_valid():
            book = form.save()
            add_film_event = Event.create_add_book_event(
                user=request.user if request.user.is_authenticated else None,
                web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
                movie=book,
            )
            add_film_event.save()
            messages.success(request, "Book added successfully.")
            return redirect("booksapp:index")
        else:
            print("Form errors:", form.errors)
            messages.error(request, "Please fix the errors in the form.")
    else:
        form = BookForm()

    return render(request, "add.html", {"form": form, "genres": all_genres})


def update_book(request, id):
    """
    Vista para actualizar una película existente.
    Registra el evento de EDIT_FILM si se detectan cambios.
    """
    book = get_object_or_404(Book, id=id)
    original_values = {
        "name": book.name,
        "userId": book.userId,
        "desc": book.desc,
        "year": book.year,
        "director": book.director,
        "duration": book.duration,
        "trailer_url": book.trailer_url,
        "rating": float(book.rating) if book.rating else None,
        "genres": [genre.name for genre in book.genres.all()],
    }

    if request.method == "POST":
        form = BookForm(request.POST, request.FILES, instance=book)
        if form.is_valid():
            updated_book = form.save()
            changed_fields = []
            if updated_book.name != original_values["name"]:
                changed_fields.append("name")
            if updated_book.desc != original_values["desc"]:
                changed_fields.append("desc")
            if updated_book.year != original_values["year"]:
                changed_fields.append("year")
            if updated_book.director != original_values["director"]:
                changed_fields.append("director")
            if updated_book.duration != original_values["duration"]:
                changed_fields.append("duration")
            if updated_book.trailer_url != original_values["trailer_url"]:
                changed_fields.append("trailer_url")
            current_rating = float(updated_book.rating) if updated_book.rating else None
            if current_rating != original_values["rating"]:
                changed_fields.append("rating")
            updated_genres = [genre.name for genre in updated_book.genres.all()]
            if set(updated_genres) != set(original_values["genres"]):
                changed_fields.append("genres")

            if changed_fields:
                edit_film_event = Event.create_edit_book_event(
                    user=request.user if request.user.is_authenticated else None,
                    web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
                    movie=updated_book,
                    previous_values=original_values,
                    changed_fields=changed_fields,
                )
                edit_film_event.save()
                updated_book.save()
            messages.success(request, "Movie updated successfully.")
            return redirect("booksapp:detail", movie_id=id)
        else:
            messages.error(request, "Please correct the errors in the form.")
    else:
        form = BookForm(instance=book)

    return render(request, "edit.html", {"form": form, "movie": book})


def delete_book(request, id):
    """
    Vista para eliminar una película y registrar el evento de DELETE_FILM.
    """
    book = get_object_or_404(Book, id=id)

    if request.method == "POST":
        delete_film_event = Event.create_delete_book_event(
            user=request.user if request.user.is_authenticated else None,
            web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
            movie=book,
        )
        delete_film_event.save()
        book.delete()
        messages.success(request, "Movie deleted successfully.")
        return redirect("/")
    return render(request, "delete.html", {"movie": book})


def add_to_cart(request, id):
    if request.method == "GET":
        print("Add the book to the shopping cart.")
        userId = request.user.id
        bookId = id

        if Cart.objects.filter(userId=request.user.id, bookId=id).exists():
            messages.warning(request, "This book was already added to shopping cart.")
        else:
            Cart.objects.create(userId=userId, bookId=bookId)

            messages.success(request, "Book added to the shopping cart.")
        return redirect("booksapp:detail", movie_id=id)


def add_comment(request, movie_id):
    """
    Vista para agregar un comentario a una película.
    Registra el evento de añadir comentario y, si la solicitud es AJAX, devuelve una respuesta JSON.
    """
    book = get_object_or_404(Book, id=movie_id)

    if request.method == "POST":
        name = request.POST.get("name", "")
        if request.user.is_authenticated:
            name = request.user.username

        content = request.POST.get("content", "")

        if name and content:
            comment = Comment.objects.create(movie=book, name=name, content=content)
            # Registrar evento de ADD_COMMENT
            add_comment_event = Event.create_add_comment_event(
                user=request.user if request.user.is_authenticated else None,
                web_agent_id=request.headers.get("X-WebAgent-Id", "0"),
                comment=comment,
                movie=book,
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
                            "time_ago": f"{(timezone.now() - comment.created_at).days} days ago" if (timezone.now() - comment.created_at).days > 0 else "Today",
                            "avatar": comment.avatar.url if comment.avatar else None,
                        },
                    }
                )

            messages.success(request, "Your comment has been added successfully!")
            return redirect("booksapp:detail", movie_id=book.id)

    messages.error(request, "There was a problem with your comment.")
    return redirect("booksapp:detail", movie_id=book.id)


def genre_list(request):
    """
    Vista que muestra la lista de géneros.
    """
    genres = Genre.objects.all()
    return render(request, "genres.html", {"genres": genres})


def genre_detail(request, genre_id):
    """
    Vista que muestra los detalles de un género y las películas asociadas.
    """
    genre = get_object_or_404(Genre, id=genre_id)
    movies = Book.objects.filter(genres=genre)
    context = {"genre": genre, "movies": movies}
    return render(request, "genres_detail.html", context)


# =============================================================================
#                        CONTACT
# =============================================================================
def contact(request):
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
                contact=contact_message,
            )
            contact_event.save()

            messages.success(
                request,
                "Your message has been received successfully. We will review it soon!",
            )
            return redirect("booksapp:contact")
    else:
        form = ContactForm()
    return render(request, "contact.html", {"form": form})


# =============================================================================
#                         VISTAS DE AUTENTICACIÓN
# =============================================================================


def login_view(request):
    """
    Vista para iniciar sesión.
    Si el usuario ya está autenticado, redirige a la página principal.
    """
    if request.user.is_authenticated:
        return redirect("booksapp:index")

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            web_agent_id = request.headers.get("X-WebAgent-Id", "0")
            login_event = Event.create_login_event(user, web_agent_id)
            login_event.save()
            next_url = request.GET.get("next", reverse("booksapp:index"))
            messages.success(request, f"Welcome back, {username}!")
            return redirect(next_url)
        else:
            messages.error(request, "Invalid username or password.")
    return render(request, "login.html")


def logout_view(request):
    """
    Vista para cerrar sesión.
    Registra el evento de cierre de sesión antes de finalizar la sesión.
    """
    web_agent_id = request.headers.get("X-WebAgent-Id", "0")
    logout_event = Event.create_logout_event(request.user, web_agent_id)
    logout(request)
    logout_event.save()
    messages.success(request, "You have been logged out successfully.")
    return redirect("booksapp:index")


def register_view(request):
    """
    Vista para registrar un nuevo usuario.
    Valida la información, crea el usuario, registra los eventos de registro e inicio de sesión y redirige a la página principal.
    """
    if request.user.is_authenticated:
        return redirect("booksapp:index")

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
            register_event = Event.create_registration_event(user, web_agent_id)
            register_event.save()
            # login(request, user)
            # login_event = Event.create_login_event(user, web_agent_id)
            # login_event.save()
            messages.success(request, f"Account created successfully. Welcome, {username}!")
            return redirect("booksapp:index")

    return render(request, "register.html")


@login_required
def profile_view(request):
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
        )
        edit_user_event.save()

        messages.success(request, "Your profile has been updated successfully!")
        return redirect("booksapp:profile")

    # For GET requests, display the form
    all_genres = Genre.objects.all().order_by("name")
    context = {
        "profile": profile,
        "genres": all_genres,
        "selected_genres": [g.id for g in profile.favorite_genres.all()],
    }
    return render(request, "profile.html", context)
