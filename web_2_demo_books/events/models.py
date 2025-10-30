from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

from booksapp.models import Genre
import logging

logger = logging.getLogger(__name__)


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


class EventQuerySet(models.QuerySet):
    def delete(self):
        try:
            criteria = str(self.query)
        except Exception:
            criteria = "<unrepresentable queryset>"

        try:
            count = self.count()
        except Exception:
            count = None

        try:
            Event._deletion_counters.setdefault(criteria, 0)
            if count is not None:
                Event._deletion_counters[criteria] += count
                total = Event._deletion_counters[criteria]
            else:
                total = Event._deletion_counters[criteria]
        except Exception:
            total = None

        logger.info(
            "Deleting events: count=%s, criteria=%s, total_deleted_for_criteria=%s",
            count,
            criteria,
            total,
        )

        return super().delete()


class Event(models.Model):
    """
    Modelo para almacenar distintos tipos de eventos
    relacionados con libros y acciones de usuario.
    """

    # Add a class-level dict to accumulate deletion counters by criteria
    _deletion_counters = {}

    # Campos básicos comunes a todos los eventos
    event_name = models.CharField(max_length=50, choices=EventName.choices)
    timestamp = models.DateTimeField(default=timezone.now)
    web_agent_id = models.CharField(max_length=100)
    validator_id = models.CharField(max_length=100)
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

    def save(self, *args, **kwargs):
        """Override save to log when an event is created or updated."""
        is_create = self.pk is None
        super().save(*args, **kwargs)

        try:
            logger.info(
                "Event %s saved (id=%s) name=%s web_agent_id=%s validator_id=%s timestamp=%s",
                "created" if is_create else "updated",
                self.pk,
                getattr(self, "event_name", None),
                getattr(self, "web_agent_id", None),
                getattr(self, "validator_id", None),
                getattr(self, "timestamp", None),
            )
        except Exception:
            pass

    def delete(self, *args, **kwargs):
        """Log single-instance deletions and update deletion counters."""
        try:
            criteria = f"id={self.pk}"
        except Exception:
            criteria = "<unrepresentable instance>"

        try:
            Event._deletion_counters.setdefault(criteria, 0)
            Event._deletion_counters[criteria] += 1
            total = Event._deletion_counters[criteria]
        except Exception:
            total = None

        logger.info(
            "Deleting single event: id=%s criteria=%s total_deleted_for_criteria=%s",
            getattr(self, "pk", None),
            criteria,
            total,
        )

        return super().delete(*args, **kwargs)

    # Attach a custom manager that uses EventQuerySet so QuerySet.delete() is intercepted
    objects = models.Manager.from_queryset(EventQuerySet)()

    # -------------------- EVENTOS RELACIONADOS CON LIBROS --------------------

    @classmethod
    def create_book_detail_event(cls, user, web_agent_id, book, validator_id):
        """Factory method para crear un evento de detalles de libro."""
        event = cls(event_name=EventName.BOOK_DETAIL, user=user, web_agent_id=web_agent_id, validator_id=validator_id)
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
    def create_search_book_event(cls, user, web_agent_id, query, validator_id):
        """Factory method para crear un evento de búsqueda de libro."""
        event = cls(
            event_name=EventName.SEARCH_BOOK,
            user=user,
            web_agent_id=web_agent_id,
            validator_id=validator_id,
        )
        event.data = {
            "query": query,
        }
        return event

    @classmethod
    def create_add_book_event(cls, user, web_agent_id, book, validator_id):
        """Factory method para crear un evento de añadir libro."""
        event = cls(event_name=EventName.ADD_BOOK, user=user, web_agent_id=web_agent_id, validator_id=validator_id)
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
    def create_edit_book_event(cls, user, web_agent_id, book, previous_values=None, changed_fields=None, validator_id=None):
        """Factory method para crear un evento de editar libro."""
        event = cls(event_name=EventName.EDIT_BOOK, user=user, web_agent_id=web_agent_id, validator_id=validator_id)
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
    def create_delete_book_event(cls, user, web_agent_id, book, validator_id):
        """Factory method para crear un evento de eliminar libro."""
        event = cls(event_name=EventName.DELETE_BOOK, user=user, web_agent_id=web_agent_id, validator_id=validator_id)
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
    def create_filter_book_event(cls, user, web_agent_id, genre=None, year=None, validator_id=None):
        """Factory method to create a filter book event"""
        event = cls(event_name=EventName.FILTER_BOOK, user=user, web_agent_id=web_agent_id, validator_id=validator_id)

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
    def create_purchase_book_event(cls, user, web_agent_id, book, validator_id=None):
        """Factory method to create a purchase book event"""
        event = cls(event_name=EventName.PURCHASE_BOOK, user=user, web_agent_id=web_agent_id, validator_id=validator_id)
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
    def create_shoppingcart_event(cls, user, web_agent_id, book, validator_id=None):
        """Factory method to create a shopping cart event"""
        event = cls(event_name=EventName.SHOPPING_CART, user=user, web_agent_id=web_agent_id, validator_id=validator_id)
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
    def create_add_comment_event(cls, user, web_agent_id, comment, book, validator_id=None):
        """Factory method para crear un evento de añadir comentario."""
        event = cls(event_name=EventName.ADD_COMMENT, user=user, web_agent_id=web_agent_id, validator_id=validator_id)
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
    def create_contact_event(cls, user, web_agent_id, contact, validator_id=None):
        """Factory method para crear un evento de contacto"""
        event = cls(event_name=EventName.CONTACT, user=user, web_agent_id=web_agent_id, validator_id=validator_id)

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
    def create_registration_event(cls, user, web_agent_id, validator_id=None):
        """Factory method para crear un evento de registro."""
        event = cls(event_name=EventName.REGISTRATION, user=user, web_agent_id=web_agent_id, validator_id=validator_id)
        event.data = {
            "username": user.username,
        }
        return event

    @classmethod
    def create_login_event(cls, user, web_agent_id, validator_id=None):
        """Factory method para crear un evento de inicio de sesión."""
        event = cls(event_name=EventName.LOGIN, user=user, web_agent_id=web_agent_id, validator_id=validator_id)
        event.data = {
            "username": user.username,
        }
        return event

    @classmethod
    def create_logout_event(cls, user, web_agent_id, validator_id=None):
        """Factory method para crear un evento de cierre de sesión."""
        event = cls(event_name=EventName.LOGOUT, user=user, web_agent_id=web_agent_id, validator_id=validator_id)
        event.data = {
            "username": user.username,
        }
        return event

    @classmethod
    def create_edit_user_event(cls, user, web_agent_id, profile, previous_values=None, validator_id=None):
        """Factory method to create an edit user profile event"""
        event = cls(event_name=EventName.EDIT_USER, user=user, web_agent_id=web_agent_id, validator_id=validator_id)

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
