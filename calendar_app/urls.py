from django.urls import path
from . import views

urlpatterns = [
    path('', views.CalendarView.as_view(), name='calendar'),
    path('events/', views.get_events, name='calendar-get-events'),
    path('events/create/', views.CalendarEventCreateView.as_view(), name='calendar-event-create'),
    path('events/<int:pk>/', views.CalendarEventDetailView.as_view(), name='calendar-event-detail'),
    path('events/<int:pk>/update/', views.CalendarEventUpdateView.as_view(), name='calendar-event-update'),
    path('events/<int:pk>/delete/', views.CalendarEventDeleteView.as_view(), name='calendar-event-delete'),
    path('events/quick-add/', views.quick_add_event, name='calendar-quick-add-event'),
    path('events/<int:pk>/update-dates/', views.update_event_dates, name='calendar-update-event-dates'),
]