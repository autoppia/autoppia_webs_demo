from django.db import models
from django.contrib.auth.models import User

class DashboardWidget(models.Model):
    WIDGET_TYPES = (
        ('clients', 'Clients'),
        ('projects', 'Projects'),
        ('tasks', 'Tasks'),
        ('documents', 'Documents'),
        ('calendar', 'Calendar'),
        ('chart', 'Chart'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboard_widgets')
    widget_type = models.CharField(max_length=20, choices=WIDGET_TYPES)
    title = models.CharField(max_length=100)
    order = models.IntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    settings = models.JSONField(default=dict, blank=True)
    
    def __str__(self):
        return f"{self.title} ({self.get_widget_type_display()})"
    
    class Meta:
        ordering = ['order']
        unique_together = ['user', 'widget_type']