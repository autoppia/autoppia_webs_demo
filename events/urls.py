from django.urls import path
from .views import get_events, my_events, reset_events, add_event, reset_all_events

urlpatterns = [
    path("events/list/", get_events, name="event-list"),
    path("events/my/", my_events, name="my_events"),
    path("events/reset/", reset_events, name="reset_events"),
    path("events/reset/all/", reset_all_events, name="reset_all_events"),
    path("events/add/", add_event, name="add_events"),
]
