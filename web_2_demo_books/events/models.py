from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

from booksapp.models import Genre


class EventName(models.TextChoices):
    BOOK_DETAIL = "BOOK_DETAIL", "Book Detail View"
    SEARCH_BOOK = "SEARCH_BOOK", "Search Book"
    ADD_BOOK = "ADD_BOOK", "Add Book"
    EDIT_BOOK = "EDIT_BOOK", "Edit Book"
    DELETE_BOOK = "DELETE_BOOK", "Delete Book"
    ADD_COMMENT = "ADD_COMMENT_BOOK", "Add Comment"
    REGISTRATION = "REGISTRATION_BOOK", "User Registration"
    LOGIN = "LOGIN_BOOK", "User Login"
    LOGOUT = "LOGOUT_BOOK", "User Logout"
    CONTACT = "CONTACT_BOOK", "Contact Message"
    EDIT_USER = "EDIT_USER_BOOK", "Edit User Profile"
    FILTER_BOOK = "FILTER_BOOK", "Filter Book"
    PURCHASE_BOOK = "PURCHASE_BOOK", "Purchase Book"
    SHOPPING_CART = "SHOPPING_CART", "Shopping Cart"


class Event(models.Model):
    """
    Modelo para almacenar distintos tipos de eventos
    relacionados con libros y acciones de usuario.
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

    # -------------------- EVENTOS RELACIONADOS CON LIBROS --------------------

    @classmethod
    def create_book_detail_event(cls, user, web_agent_id, book):
        """Factory method para crear un evento de detalles de libro."""
        event = cls(event_name=EventName.BOOK_DETAIL, user=user, web_agent_id=web_agent_id)
        genres = [{"id": genre.id, "name": genre.name} for genre in book.genres.all()]
        event.data = {
            "id": book.id,
            "name": book.name,
            "desc": book.desc,
            "year": book.year,
            "img": book.img.url if book.img else None,
            "director": book.director,
            "duration": book.duration,
            "trailer_url": book.trailer_url,
            "rating": float(book.rating),
            "genres": genres,
            "created_at": book.created_at.isoformat() if book.created_at else None,
            "updated_at": book.updated_at.isoformat() if book.updated_at else None,
        }
        return event

    @classmethod
    def create_search_book_event(cls, user, web_agent_id, query):
        """Factory method para crear un evento de búsqueda de libro."""
        event = cls(
            event_name=EventName.SEARCH_BOOK,
            user=user,
            web_agent_id=web_agent_id,
        )
        event.data = {
            "query": query,
        }
        return event

    @classmethod
    def create_add_book_event(cls, user, web_agent_id, book):
        """Factory method para crear un evento de añadir libro."""
        event = cls(event_name=EventName.ADD_BOOK, user=user, web_agent_id=web_agent_id)
        genres = [{"id": genre.id, "name": genre.name} for genre in book.genres.all()]
        event.data = {
            "id": book.id,
            "userId": book.user.id,
            "name": book.name,
            "desc": book.desc,
            "year": book.year,
            "img": book.img.url if book.img else None,
            "director": book.director,
            "duration": book.duration,
            "trailer_url": book.trailer_url,
            "rating": float(book.rating),
            "genres": genres,
            "created_at": book.created_at.isoformat() if book.created_at else None,
            "updated_at": book.updated_at.isoformat() if book.updated_at else None,
        }
        return event

    @classmethod
    def create_edit_book_event(cls, user, web_agent_id, book, previous_values=None, changed_fields=None):
        """Factory method para crear un evento de editar libro."""
        event = cls(event_name=EventName.EDIT_BOOK, user=user, web_agent_id=web_agent_id)
        genres = [{"id": genre.id, "name": genre.name} for genre in book.genres.all()]
        event.data = {
            "id": book.id,
            "userId": book.user.id,
            "name": book.name,
            "desc": book.desc,
            "year": book.year,
            "img": book.img.url if book.img else None,
            "director": book.director,
            "duration": book.duration,
            "trailer_url": book.trailer_url,
            "rating": float(book.rating),
            "genres": genres,
            "created_at": book.created_at.isoformat() if book.created_at else None,
            "updated_at": book.updated_at.isoformat() if book.updated_at else None,
            "previous_values": previous_values or {},
            "changed_fields": changed_fields or [],
        }
        return event

    @classmethod
    def create_delete_book_event(cls, user, web_agent_id, book):
        """Factory method para crear un evento de eliminar libro."""
        event = cls(event_name=EventName.DELETE_BOOK, user=user, web_agent_id=web_agent_id)
        genres = [{"id": genre.id, "name": genre.name} for genre in book.genres.all()]
        event.data = {
            "id": book.id,
            "userId": book.user.id,
            "name": book.name,
            "desc": book.desc,
            "year": book.year,
            "img": book.img.url if book.img else None,
            "director": book.director,
            "duration": book.duration,
            "trailer_url": book.trailer_url,
            "rating": float(book.rating),
            "genres": genres,
            "created_at": book.created_at.isoformat() if book.created_at else None,
            "updated_at": book.updated_at.isoformat() if book.updated_at else None,
        }
        return event

    @classmethod
    def create_filter_book_event(cls, user, web_agent_id, genre=None, year=None):
        """Factory method to create a filter book event"""
        event = cls(event_name=EventName.FILTER_BOOK, user=user, web_agent_id=web_agent_id)

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
        event.data = {
            "genre": genre_data,
            "year": year,
            "filters_applied": {
                "genre": genre_data is not None,
                "year": year is not None,
            },
        }

        return event

    @classmethod
    def create_purchase_book_event(cls, user, web_agent_id, book):
        """Factory method to create a purchase book event"""
        event = cls(event_name=EventName.PURCHASE_BOOK, user=user, web_agent_id=web_agent_id)
        genres = [{"id": genre.id, "name": genre.name} for genre in book.genres.all()]

        event.data = {
            "id": book.id,
            "userId": book.user.id,
            "name": book.name,
            "desc": book.desc,
            "year": book.year,
            "img": book.img.url if book.img else None,
            "director": book.director,
            "duration": book.duration,
            "trailer_url": book.trailer_url,
            "price": book.price,
            "rating": float(book.rating),
            "genres": genres,
            "created_at": book.created_at.isoformat() if book.created_at else None,
            "updated_at": book.updated_at.isoformat() if book.updated_at else None,
        }

        return event

    @classmethod
    def create_shoppingcart_event(cls, user, web_agent_id, book):
        """Factory method to create a shopping cart event"""
        event = cls(event_name=EventName.SHOPPING_CART, user=user, web_agent_id=web_agent_id)
        genres = [{"id": genre.id, "name": genre.name} for genre in book.genres.all()]
        event.data = {
            "id": book.id,
            "userId": book.user.id,
            "name": book.name,
            "desc": book.desc,
            "year": book.year,
            "img": book.img.url if book.img else None,
            "director": book.director,
            "duration": book.duration,
            "trailer_url": book.trailer_url,
            "price": book.price,
            "rating": float(book.rating),
            "genres": genres,
            "created_at": book.created_at.isoformat() if book.created_at else None,
            "updated_at": book.updated_at.isoformat() if book.updated_at else None,
        }
        return event

    @classmethod
    def create_add_comment_event(cls, user, web_agent_id, comment, book):
        """Factory method para crear un evento de añadir comentario."""
        event = cls(event_name=EventName.ADD_COMMENT, user=user, web_agent_id=web_agent_id)
        event.data = {
            "comment_id": comment.id,
            "name": comment.name,
            "content": comment.content,
            "created_at": comment.created_at.isoformat() if comment.created_at else None,
            "book": {
                "id": book.id,
                "name": book.name,
                "director": book.director,
                "year": book.year,
            },
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