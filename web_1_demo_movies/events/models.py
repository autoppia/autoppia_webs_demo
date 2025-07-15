from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

from movieapp.models import Genre


class EventName(models.TextChoices):
    FILM_DETAIL = "FILM_DETAIL", "Film Detail View"
    SEARCH_FILM = "SEARCH_FILM", "Search Film"
    ADD_FILM = "ADD_FILM", "Add Film"
    EDIT_FILM = "EDIT_FILM", "Edit Film"
    DELETE_FILM = "DELETE_FILM", "Delete Film"
    ADD_COMMENT = "ADD_COMMENT", "Add Comment"
    REGISTRATION = "REGISTRATION", "User Registration"
    LOGIN = "LOGIN", "User Login"
    LOGOUT = "LOGOUT", "User Logout"
    CONTACT = "CONTACT", "Contact Message"
    EDIT_USER = "EDIT_USER", "Edit User Profile"
    FILTER_FILM = "FILTER_FILM", "Filter Films"


class Event(models.Model):
    """
    Modelo para almacenar distintos tipos de eventos
    relacionados con películas y acciones de usuario.
    """

    # Campos básicos comunes a todos los eventos
    event_name = models.CharField(max_length=50, choices=EventName.choices)
    timestamp = models.DateTimeField(default=timezone.now)
    web_agent_id = models.CharField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    # Campo JSON para datos específicos del evento
    data = models.JSONField(default=dict)

    # Campo adicional para búsquedas específicas

    class Meta:
        indexes = [
            models.Index(fields=["event_name"]),
            models.Index(fields=["timestamp"]),
            models.Index(fields=["user"]),
        ]
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.get_event_name_display()} at {self.timestamp}"

    # -------------------- EVENTOS RELACIONADOS CON PELÍCULAS --------------------

    @classmethod
    def create_film_detail_event(cls, user, web_agent_id, movie):
        """Factory method para crear un evento de detalles de película."""
        event = cls(event_name=EventName.FILM_DETAIL, user=user, web_agent_id=web_agent_id)
        genres = [{"id": genre.id, "name": genre.name} for genre in movie.genres.all()]
        event.data = {
            "id": movie.id,
            "name": movie.name,
            "desc": movie.desc,
            "year": movie.year,
            "img": movie.img.url if movie.img else None,
            "director": movie.director,
            "cast": movie.cast,
            "duration": movie.duration,
            "trailer_url": movie.trailer_url,
            "rating": float(movie.rating),
            "genres": genres,
            "created_at": movie.created_at.isoformat() if movie.created_at else None,
            "updated_at": movie.updated_at.isoformat() if movie.updated_at else None,
        }
        return event

    @classmethod
    def create_search_film_event(cls, user, web_agent_id, query):
        """Factory method para crear un evento de búsqueda de película."""
        event = cls(
            event_name=EventName.SEARCH_FILM,
            user=user,
            web_agent_id=web_agent_id,
        )
        event.data = {
            "query": query,
        }
        return event

    @classmethod
    def create_add_film_event(cls, user, web_agent_id, movie_data):
        """Factory method para crear un evento de añadir película."""
        event = cls(event_name=EventName.ADD_FILM, user=user, web_agent_id=web_agent_id)

        genres = movie_data.get("genres", [])
        processed_genres = []
        if genres:
            processed_genres = [{"name": genre.name, "id": genre.id} if hasattr(genre, "id") and hasattr(genre, "name") else {"name": str(genre)} for genre in genres]

        event.data = {
            "name": movie_data.get("name"),
            "desc": movie_data.get("desc"),
            "year": movie_data.get("year"),
            "director": movie_data.get("director"),
            "cast": movie_data.get("cast"),
            "duration": movie_data.get("duration"),
            "trailer_url": movie_data.get("trailer_url"),
            "rating": float(movie_data.get("rating")) if movie_data.get("rating") else None,
            "genres": processed_genres,
        }
        return event

    @classmethod
    def create_edit_film_event(cls, user, web_agent_id, movie, previous_values=None, changed_fields=None, new_values=None):
        """
        Factory method para crear un evento de editar película, incorporando los nuevos valores sin persistirlos.
        """
        event = cls(event_name=EventName.EDIT_FILM, user=user, web_agent_id=web_agent_id)

        # Obtiene los géneros actuales de la película
        genres = [{"id": genre.id, "name": genre.name} for genre in movie.genres.all()]

        # Datos base tomados de la película original
        base_data = {
            "id": movie.id,
            "name": movie.name,
            "desc": movie.desc,
            "year": movie.year,
            "img": movie.img.url if movie.img else None,
            "director": movie.director,
            "cast": movie.cast,
            "duration": movie.duration,
            "trailer_url": movie.trailer_url,
            "rating": float(movie.rating) if movie.rating is not None else None,
            "genres": genres,
            "created_at": movie.created_at.isoformat() if movie.created_at else None,
            "updated_at": movie.updated_at.isoformat() if movie.updated_at else None,
        }

        # Si se reciben nuevos valores para campos modificados, se sobreescriben en base_data
        if new_values:
            for field in changed_fields or []:
                if field in new_values:
                    base_data[field] = new_values[field]

        event.data = {**base_data, "previous_values": previous_values or {}, "changed_fields": changed_fields or []}

        return event

    @classmethod
    def create_delete_film_event(cls, user, web_agent_id, movie):
        """Factory method para crear un evento de eliminar película."""
        event = cls(event_name=EventName.DELETE_FILM, user=user, web_agent_id=web_agent_id)
        genres = [{"id": genre.id, "name": genre.name} for genre in movie.genres.all()]
        event.data = {
            "id": movie.id,
            "name": movie.name,
            "desc": movie.desc,
            "year": movie.year,
            "img": movie.img.url if movie.img else None,
            "director": movie.director,
            "cast": movie.cast,
            "duration": movie.duration,
            "trailer_url": movie.trailer_url,
            "rating": float(movie.rating),
            "genres": genres,
            "created_at": movie.created_at.isoformat() if movie.created_at else None,
            "updated_at": movie.updated_at.isoformat() if movie.updated_at else None,
        }
        return event

    @classmethod
    def create_filter_film_event(cls, user, web_agent_id, genre=None, year=None):
        """Factory method to create a filter films event"""
        event = cls(event_name=EventName.FILTER_FILM, user=user, web_agent_id=web_agent_id)

        # Get genre information if provided
        genre_data = None
        if genre:
            if isinstance(genre, int):
                try:
                    genre_obj = Genre.objects.get(id=genre)
                    genre_data = {"id": genre_obj.id, "name": genre_obj.name}
                except Genre.DoesNotExist:
                    pass
            elif hasattr(genre, "id") and hasattr(genre, "name"):
                genre_data = {"id": genre.id, "name": genre.name}

        # Save filter data in JSON format
        event.data = {"genre": genre_data, "year": year, "filters_applied": {"genre": genre_data is not None, "year": year is not None}}

        return event

    @classmethod
    def create_add_comment_event(cls, user, web_agent_id, comment, movie):
        """Factory method para crear un evento de añadir comentario."""
        event = cls(event_name=EventName.ADD_COMMENT, user=user, web_agent_id=web_agent_id)
        event.data = {
            "comment_id": comment.id,
            "name": comment.name,
            "content": comment.content,
            "created_at": comment.created_at.isoformat() if comment.created_at else None,
            "movie": {"id": movie.id, "name": movie.name, "director": movie.director, "year": movie.year},
        }
        return event

    # --------------------- CONTACT --------------------------------
    @classmethod
    def create_contact_event(cls, user, web_agent_id, contact):
        """Factory method para crear un evento de contacto"""
        event = cls(event_name=EventName.CONTACT, user=user, web_agent_id=web_agent_id)

        # Guardar datos del mensaje de contacto en formato JSON
        event.data = {
            "id": contact.id,
            "name": contact.name,
            "email": contact.email,
            "subject": contact.subject,
            "message": contact.message,
            "created_at": contact.created_at.isoformat() if hasattr(contact, "created_at") and contact.created_at else None,
        }

        return event

    # -------------------- EVENTOS DE USUARIO --------------------

    @classmethod
    def create_registration_event(cls, user, web_agent_id):
        """Factory method para crear un evento de registro."""
        event = cls(event_name=EventName.REGISTRATION, user=user, web_agent_id=web_agent_id)
        event.data = {
            "username": user.username,
        }
        return event

    @classmethod
    def create_login_event(cls, user, web_agent_id):
        """Factory method para crear un evento de inicio de sesión."""
        event = cls(event_name=EventName.LOGIN, user=user, web_agent_id=web_agent_id)
        event.data = {
            "username": user.username,
        }
        return event

    @classmethod
    def create_logout_event(cls, user, web_agent_id):
        """Factory method para crear un evento de cierre de sesión."""
        event = cls(event_name=EventName.LOGOUT, user=user, web_agent_id=web_agent_id)
        event.data = {
            "username": user.username,
        }
        return event

    @classmethod
    def create_edit_user_event(cls, user, web_agent_id, profile, previous_values=None):
        """Factory method to create an edit user profile event"""
        event = cls(event_name=EventName.EDIT_USER, user=user, web_agent_id=web_agent_id)

        # Get favorite genres as a list of dictionaries
        favorite_genres = []
        if hasattr(profile, "favorite_genres") and profile.favorite_genres.exists():
            favorite_genres = [{"id": genre.id, "name": genre.name} for genre in profile.favorite_genres.all()]

        # Save user and profile data in JSON format
        event.data = {
            "user_id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "profile_id": profile.id if profile else None,
            "bio": profile.bio if profile else None,
            "location": profile.location if profile else None,
            "website": profile.website if profile else None,
            "has_profile_pic": bool(profile.profile_pic) if profile and hasattr(profile, "profile_pic") else False,
            "favorite_genres": favorite_genres,
            "previous_values": previous_values or {},
        }

        return event
