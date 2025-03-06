# models.py

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from movieapp.models import Movie

class EventName(models.TextChoices):
    FILM_DETAIL = 'FILM_DETAIL', 'Film Detail View'
    SEARCH_FILM = 'SEARCH_FILM', 'Search Film'
    ADD_FILM = 'ADD_FILM', 'Add Film'
    EDIT_FILM = 'EDIT_FILM', 'Edit Film'
    DELETE_FILM = 'DELETE_FILM', 'Delete Film'
    ADD_COMMENT = 'ADD_COMMENT', 'Add Comment'
    REGISTRATION = 'REGISTRATION', 'User Registration'
    LOGIN = 'LOGIN', 'User Login'
    LOGOUT = 'LOGOUT', 'User Logout'


class Event(models.Model):
    """
    Modelo para almacenar distintos tipos de eventos
    relacionados con películas y acciones de usuario.
    """
    # Campos básicos comunes a todos los eventos
    event_name = models.CharField(max_length=50, choices=EventName.choices)
    timestamp = models.DateTimeField(default=timezone.now)
    web_agent_id = models.IntegerField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Campo JSON para datos específicos del evento
    data = models.JSONField(default=dict)
    
    # Campo adicional para búsquedas específicas
    search_query = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['event_name']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['user']),
        ]
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.get_event_name_display()} at {self.timestamp}"

    # ========== MÉTODOS DE FÁBRICA ==========

    @classmethod
    def create_film_detail_event(cls, user, web_agent_id, movie):
        """Factory method para crear un evento de detalles de película."""
        event = cls(
            event_name=EventName.FILM_DETAIL,
            user=user,
            web_agent_id=web_agent_id
        )
        genres = [
            {"id": genre.id, "name": genre.name}
            for genre in movie.genres.all()
        ]
        event.data = {
            'id': movie.id,
            'name': movie.name,
            'desc': movie.desc,
            'year': movie.year,
            'img': movie.img.url if movie.img else None,
            'director': movie.director,
            'cast': movie.cast,
            'duration': movie.duration,
            'trailer_url': movie.trailer_url,
            'rating': float(movie.rating),
            'genres': genres,
            'created_at': movie.created_at.isoformat() if movie.created_at else None,
            'updated_at': movie.updated_at.isoformat() if movie.updated_at else None
        }
        return event

    @classmethod
    def create_search_event(cls, user, web_agent_id, query):
        """Factory method para crear un evento de búsqueda de película."""
        event = cls(
            event_name=EventName.SEARCH_FILM,
            user=user,
            web_agent_id=web_agent_id,
            search_query=query
        )
        event.data = {
            'query': query,
        }
        return event

    @classmethod
    def create_add_film_event(cls, user, web_agent_id, movie):
        """Factory method para crear un evento de añadir película."""
        event = cls(
            event_name=EventName.ADD_FILM,
            user=user,
            web_agent_id=web_agent_id
        )
        genres = [
            {"id": genre.id, "name": genre.name}
            for genre in movie.genres.all()
        ]
        event.data = {
            'id': movie.id,
            'name': movie.name,
            'desc': movie.desc,
            'year': movie.year,
            'img': movie.img.url if movie.img else None,
            'director': movie.director,
            'cast': movie.cast,
            'duration': movie.duration,
            'trailer_url': movie.trailer_url,
            'rating': float(movie.rating),
            'genres': genres,
            'created_at': movie.created_at.isoformat() if movie.created_at else None,
            'updated_at': movie.updated_at.isoformat() if movie.updated_at else None
        }
        return event

    @classmethod
    def create_edit_film_event(cls, user, web_agent_id, movie, previous_values=None, changed_fields=None):
        """Factory method para crear un evento de editar película."""
        event = cls(
            event_name=EventName.EDIT_FILM,
            user=user,
            web_agent_id=web_agent_id
        )
        genres = [
            {"id": genre.id, "name": genre.name}
            for genre in movie.genres.all()
        ]
        event.data = {
            'id': movie.id,
            'name': movie.name,
            'desc': movie.desc,
            'year': movie.year,
            'img': movie.img.url if movie.img else None,
            'director': movie.director,
            'cast': movie.cast,
            'duration': movie.duration,
            'trailer_url': movie.trailer_url,
            'rating': float(movie.rating),
            'genres': genres,
            'created_at': movie.created_at.isoformat() if movie.created_at else None,
            'updated_at': movie.updated_at.isoformat() if movie.updated_at else None,
            'previous_values': previous_values or {},
            'changed_fields': changed_fields or []
        }
        return event

    @classmethod
    def create_delete_film_event(cls, user, web_agent_id, movie):
        """Factory method para crear un evento de eliminar película."""
        event = cls(
            event_name=EventName.DELETE_FILM,
            user=user,
            web_agent_id=web_agent_id
        )
        genres = [
            {"id": genre.id, "name": genre.name}
            for genre in movie.genres.all()
        ]
        event.data = {
            'id': movie.id,
            'name': movie.name,
            'desc': movie.desc,
            'year': movie.year,
            'img': movie.img.url if movie.img else None,
            'director': movie.director,
            'cast': movie.cast,
            'duration': movie.duration,
            'trailer_url': movie.trailer_url,
            'rating': float(movie.rating),
            'genres': genres,
            'created_at': movie.created_at.isoformat() if movie.created_at else None,
            'updated_at': movie.updated_at.isoformat() if movie.updated_at else None
        }
        return event

    @classmethod
    def create_add_comment_event(cls, user, web_agent_id, comment, movie):
        """Factory method para crear un evento de añadir comentario"""
        event = cls(
            event_name=EventName.ADD_COMMENT,
            user=user,
            web_agent_id=web_agent_id
        )
        
        # Guardar datos del comentario y película en formato JSON
        event.data = {
            'comment_id': comment.id,
            'name': comment.name,
            'content': comment.content,
            'created_at': comment.created_at.isoformat() if comment.created_at else None,
            'movie': {
                'id': movie.id,
                'name': movie.name,
                'director': movie.director,
                'year': movie.year
            }
        }
        
        return event
        
    @classmethod
    def create_registration_event(cls, user, web_agent_id):
        """Factory method para crear un evento de registro."""
        event = cls(
            event_name=EventName.REGISTRATION,
            user=user,
            web_agent_id=web_agent_id
        )
        event.data = {
            'username': user.username,
        }
        return event
    
    @classmethod
    def create_login_event(cls, user, web_agent_id):
        """Factory method para crear un evento de inicio de sesión."""
        event = cls(
            event_name=EventName.LOGIN,
            user=user,
            web_agent_id=web_agent_id
        )
        event.data = {
            'username': user.username,
        }
        return event
    
    @classmethod
    def create_logout_event(cls, user, web_agent_id):
        """Factory method para crear un evento de cierre de sesión."""
        event = cls(
            event_name=EventName.LOGOUT,
            user=user,
            web_agent_id=web_agent_id
        )
        event.data = {
            'username': user.username,
        }
        return event
