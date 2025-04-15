from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from projects.models import Project
from clients.models import Client

class CalendarEvent(models.Model):
    EVENT_TYPES = [
        ('meeting', 'Meeting'),
        ('deadline', 'Deadline'),
        ('reminder', 'Reminder'),
        ('task', 'Task'),
        ('appointment', 'Appointment'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    all_day = models.BooleanField(default=False)
    location = models.CharField(max_length=200, blank=True, null=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='meeting')
    color = models.CharField(max_length=20, blank=True, null=True, help_text="CSS color code or name")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events')
    attendees = models.ManyToManyField(User, related_name='attending_events', blank=True)
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    is_recurring = models.BooleanField(default=False)
    recurrence_pattern = models.CharField(max_length=50, blank=True, null=True, 
                                         help_text="e.g., 'FREQ=WEEKLY;INTERVAL=1'")
    recurrence_end_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('calendar-event-detail', args=[str(self.id)])
    
    def get_event_color(self):
        if self.color:
            return self.color
        
        # Default colors based on event type
        colors = {
            'meeting': '#4e73df',  # blue
            'deadline': '#e74a3b',  # red
            'reminder': '#f6c23e',  # yellow
            'task': '#36b9cc',  # turquoise
            'appointment': '#1cc88a',  # green
            'other': '#858796',  # gray
        }
        return colors.get(self.event_type, '#4e73df')
    
    def to_dict(self):
        """Convert event to a dictionary for FullCalendar."""
        return {
            'id': self.id,
            'title': self.title,
            'start': self.start_time.isoformat(),
            'end': self.end_time.isoformat(),
            'allDay': self.all_day,
            'url': self.get_absolute_url(),
            'backgroundColor': self.get_event_color(),
            'borderColor': self.get_event_color(),
            'extendedProps': {
                'description': self.description,
                'location': self.location,
                'eventType': self.get_event_type_display(),
                'createdBy': self.created_by.get_full_name() or self.created_by.username,
            }
        }