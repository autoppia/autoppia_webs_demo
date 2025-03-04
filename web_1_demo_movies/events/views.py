from rest_framework import status
from rest_framework.decorators import api_view
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Event
from .serializers import EventSerializer


@api_view(["GET"])
def get_events(request):
    """
    Fetch events for the web_agent identified by the provided `web_agent_id`.
    """
    web_agent_id = request.headers.get("X-WebAgent-Id")
    if not web_agent_id:
        return Response({"error": "X-WebAgent-Id is required."}, status=status.HTTP_400_BAD_REQUEST)

    events = Event.objects.filter(web_agent_id=web_agent_id).order_by("-timestamp")
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(["GET"])
# @permission_classes([IsAuthenticated])
def my_events(request):
    """
    Get all events
    """
    events = Event.objects.order_by("-timestamp")
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(["DELETE"])
def reset_events(request):
    """
    Delete Events for a specific web_agent_id
    """
    web_agent_id = request.headers.get("X-WebAgent-Id")
    if not web_agent_id:
        return Response({"error": "X-WebAgent-Id is required."}, status=status.HTTP_400_BAD_REQUEST)

    Event.objects.filter(web_agent_id=web_agent_id).delete()
    return Response(
        {"message": f"Events for web_agent '{web_agent_id}' have been deleted successfully."},
        status=status.HTTP_204_NO_CONTENT,
    )


@api_view(["POST"])
def add_event(request):
    """
    Add a new event to the database.

    Expected JSON payload formats:
    
    For FilmDetailEvent:
    {
        "event_name": "FILM_DETAIL",
        "web_agent_id": 12345,
        "user_id": 1,  # Optional
        "data": {
            "movie_id": 42
        }
    }
    
    For SearchEvent:
    {
        "event_name": "SEARCH",
        "web_agent_id": 12345,
        "user_id": 1,  # Optional
        "data": {
            "query": "action movies"
        }
    }
    
    For RegistrationEvent:
    {
        "event_name": "REGISTRATION",
        "web_agent_id": 12345,
        "user_id": 1
    }
    
    For LoginEvent:
    {
        "event_name": "LOGIN",
        "web_agent_id": 12345,
        "user_id": 1
    }
    """
    from django.contrib.auth.models import User
    from movieapp.models import Movie
    
    event_name = request.data.get("event_name")
    web_agent_id = request.data.get("web_agent_id")
    user_id = request.data.get("user_id")
    data = request.data.get("data", {})
    
    # Validaciones básicas
    if not event_name:
        return Response({"error": "event_name is required."}, status=status.HTTP_400_BAD_REQUEST)
    if not web_agent_id:
        return Response({"error": "web_agent_id is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    # Obtener usuario si se proporciona user_id
    user = None
    if user_id:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": f"User with id {user_id} not found."}, status=status.HTTP_404_NOT_FOUND)
    
    # Crear evento según su tipo usando los métodos de fábrica
    try:
        if event_name == "FILM_DETAIL":
            movie_id = data.get("movie_id")
            if not movie_id:
                return Response({"error": "movie_id is required for FILM_DETAIL events."}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            try:
                movie = Movie.objects.get(id=movie_id)
            except Movie.DoesNotExist:
                return Response({"error": f"Movie with id {movie_id} not found."}, 
                               status=status.HTTP_404_NOT_FOUND)
                
            event = Event.create_film_detail_event(user, web_agent_id, movie)
            
        elif event_name == "SEARCH":
            query = data.get("query")
            if not query:
                return Response({"error": "query is required for SEARCH events."}, 
                               status=status.HTTP_400_BAD_REQUEST)
                
            event = Event.create_search_event(user, web_agent_id, query)
            
        elif event_name == "REGISTRATION":
            if not user:
                return Response({"error": "user_id is required for REGISTRATION events."}, 
                               status=status.HTTP_400_BAD_REQUEST)
                
            event = Event.create_registration_event(user, web_agent_id)
            
        elif event_name == "LOGIN":
            if not user:
                return Response({"error": "user_id is required for LOGIN events."}, 
                               status=status.HTTP_400_BAD_REQUEST)
                
            event = Event.create_login_event(user, web_agent_id)
            
        else:
            return Response({"error": f"Unknown event_name: {event_name}"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Guardar el evento
        event.save()
        
        # Serializar y devolver la respuesta
        serializer = EventSerializer(event)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)