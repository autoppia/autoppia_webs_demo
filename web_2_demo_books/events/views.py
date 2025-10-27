from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Event
from .serializers import EventSerializer
from booksapp.models import Book


@api_view(["GET"])
def get_events(request):
    """
    Fetch events for the web_agent identified by the provided `X-WebAgent-Id` header.
    If `X-Validator-Id` is provided it will be used to further filter results; otherwise
    all events for the web_agent_id are returned (backwards compatible).

    This endpoint will also accept `web_agent_id` as a query parameter for clients that
    cannot send custom headers (e.g. simple browsers or static pages).
    """
    web_agent_id = request.headers.get("X-WebAgent-Id") or request.GET.get("web_agent_id")
    validator_id = request.headers.get("X-Validator-Id") or request.GET.get("validator_id")
    if not web_agent_id:
        return Response({"error": "X-WebAgent-Id header or web_agent_id query param is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Build filter depending on whether validator_id was supplied
    filter_kwargs = {"web_agent_id": web_agent_id}
    if validator_id:
        filter_kwargs["validator_id"] = validator_id

    events = Event.objects.filter(**filter_kwargs).order_by("-timestamp")
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def my_events(request):
    """
    Get all events, ordered by timestamp (newest first).
    """
    events = Event.objects.order_by("-timestamp")
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(["DELETE"])
def reset_events(request):
    """
    Delete events for a specific web_agent_id provided in the X-WebAgent-Id header or as a query parameter.
    If X-Validator-Id/query param is present we delete only events matching both; otherwise delete
    all events for the web_agent_id.
    """
    web_agent_id = request.headers.get("X-WebAgent-Id") or request.GET.get("web_agent_id")
    validator_id = request.headers.get("X-Validator-Id") or request.GET.get("validator_id")
    if not web_agent_id:
        return Response({"error": "X-WebAgent-Id header or web_agent_id query param is required."}, status=status.HTTP_400_BAD_REQUEST)

    filter_kwargs = {"web_agent_id": web_agent_id}
    if validator_id:
        filter_kwargs["validator_id"] = validator_id

    count = Event.objects.filter(**filter_kwargs).count()
    Event.objects.filter(**filter_kwargs).delete()

    if validator_id:
        msg = f"Events for web_agent '{web_agent_id}' and validator_id '{validator_id}' have been deleted successfully ({count} events)."
    else:
        msg = f"Events for web_agent '{web_agent_id}' have been deleted successfully ({count} events)."

    return Response({"message": msg}, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def reset_all_events(request):
    """
    Delete all events in the database.
    Requires admin/staff privileges.
    """
    count = Event.objects.count()
    Event.objects.all().delete()

    return Response(
        {"message": f"All events have been deleted successfully ({count} events)."},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def add_event(request):
    """
    Add a new event to the database.

    Expected JSON payload formats:

    For BookDetailEvent:
    {
        "event_name": "BOOK_DETAIL",
        "web_agent_id": "agent123",
        "validator_id": "val1",
        "user_id": 1,  # Optional
        "data": {
            "book_id": 42
        }
    }

    For SearchEvent:
    {
        "event_name": "SEARCH_BOOK",
        "web_agent_id": "agent123",
        "validator_id": "val1",
        "user_id": 1,  # Optional
        "data": {
            "query": "education books"
        }
    }

    For RegistrationEvent:
    {
        "event_name": "REGISTRATION",
        "web_agent_id": "agent123",
        "validator_id": "val1",
        "user_id": 1
    }

    For LoginEvent:
    {
        "event_name": "LOGIN",
        "web_agent_id": "agent123",
        "validator_id": "val1",
        "user_id": 1
    }

    For ShoppingCartEvent:
    {
        "event_name": "SHOPPING_CART",
        "web_agent_id": "agent123",
        "validator_id": "val1",
        "user_id": 1,
        "data": {
            "book_id": 42
        }
    }

    For PurchaseBookEvent:
    {
        "event_name": "PURCHASE_BOOK",
        "web_agent_id": "agent123",
        "validator_id": "val1",
        "user_id": 1,
        "data": {
            "book_id": 42
        }
    }
    """
    event_name = request.data.get("event_name")
    web_agent_id = request.data.get("web_agent_id") or request.headers.get("X-WebAgent-Id")
    # Allow validator_id to be supplied either in payload or in header
    validator_id = request.data.get("validator_id") or request.headers.get("X-Validator-Id")
    user_id = request.data.get("user_id")
    data = request.data.get("data", {})

    # Basic validations
    if not event_name:
        return Response({"error": "event_name is required."}, status=status.HTTP_400_BAD_REQUEST)
    if not web_agent_id:
        return Response({"error": "web_agent_id is required (payload or X-WebAgent-Id header)."}, status=status.HTTP_400_BAD_REQUEST)
    if not validator_id:
        return Response({"error": "validator_id is required (payload or X-Validator-Id header)."}, status=status.HTTP_400_BAD_REQUEST)

    # Get user if user_id is provided
    user = None
    if user_id:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": f"User with id {user_id} not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    # Create event based on its type using factory methods
    try:
        if event_name == "BOOK_DETAIL":
            book_id = data.get("book_id") or data.get("movie_id")
            if not book_id:
                return Response(
                    {"error": "book_id is required for BOOK_DETAIL events."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                book = Book.objects.get(id=book_id)
            except Book.DoesNotExist:
                return Response(
                    {"error": f"Book with id {book_id} not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            event = Event.create_book_detail_event(user, web_agent_id, book, validator_id=validator_id)

        elif event_name == "SEARCH_BOOK":
            query = data.get("query")
            if not query:
                return Response(
                    {"error": "query is required for SEARCH events."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            event = Event.create_search_book_event(user, web_agent_id, query, validator_id=validator_id)

        elif event_name == "REGISTRATION":
            if not user:
                return Response(
                    {"error": "user_id is required for REGISTRATION events."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            event = Event.create_registration_event(user, web_agent_id, validator_id=validator_id)

        elif event_name == "LOGIN":
            if not user:
                return Response(
                    {"error": "user_id is required for LOGIN events."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            event = Event.create_login_event(user, web_agent_id, validator_id=validator_id)

        elif event_name == "PURCHASE_BOOK":
            if not user:
                return Response(
                    {"error": "user_id is required for PURCHASE_BOOK events."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            book_id = data.get("book_id")
            if not book_id:
                return Response(
                    {"error": "book_id is required for PURCHASE_BOOK events."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                book = Book.objects.get(id=book_id)
            except Book.DoesNotExist:
                return Response(
                    {"error": f"Book with id {book_id} not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            event = Event.create_purchase_book_event(user, web_agent_id, book, validator_id=validator_id)

        elif event_name == "SHOPPING_CART":
            if not user:
                return Response(
                    {"error": "user_id is required for SHOPPING_CART events."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            book_id = data.get("book_id")
            if not book_id:
                return Response(
                    {"error": "book_id is required for SHOPPINGCART events."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                book = Book.objects.get(id=book_id)
            except Book.DoesNotExist:
                return Response(
                    {"error": f"Book with id {book_id} not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            event = Event.create_shoppingcart_event(user, web_agent_id, book, validator_id=validator_id)

        else:
            return Response(
                {"error": f"Unknown event_name: {event_name}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Save the event
        event.save()

        # Serialize and return the response
        serializer = EventSerializer(event)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
