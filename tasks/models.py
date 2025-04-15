from django.db import models
from django.contrib.auth.models import User
from projects.models import Project
from django.utils import timezone

class Task(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    RECURRENCE_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('biweekly', 'Bi-weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assignee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_tasks')
    due_date = models.DateField()
    start_date = models.DateField(blank=True, null=True)
    completion_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    actual_hours = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    is_billable = models.BooleanField(default=True)
    is_recurring = models.BooleanField(default=False)
    recurrence_type = models.CharField(max_length=20, choices=RECURRENCE_CHOICES, blank=True, null=True)
    recurrence_end_date = models.DateField(blank=True, null=True)
    parent_task = models.ForeignKey('self', on_delete=models.SET_NULL, blank=True, null=True, related_name='subtasks')
    attachments = models.FileField(upload_to='task_attachments/', blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']
    
    def get_status_badge_class(self):
        status_classes = {
            'not_started': 'badge bg-secondary',
            'in_progress': 'badge bg-primary',
            'on_hold': 'badge bg-warning',
            'completed': 'badge bg-success',
            'cancelled': 'badge bg-danger',
        }
        return status_classes.get(self.status, 'badge bg-secondary')
    
    def get_priority_badge_class(self):
        priority_classes = {
            'low': 'badge bg-info',
            'medium': 'badge bg-secondary',
            'high': 'badge bg-warning',
            'urgent': 'badge bg-danger',
        }
        return priority_classes.get(self.priority, 'badge bg-secondary')
    
    def is_overdue(self):
        if self.status in ['completed', 'cancelled']:
            return False
        return self.due_date < timezone.now().date() if self.due_date else False
    
    def get_completion_percentage(self):
        if self.status == 'completed':
            return 100
        elif self.status == 'not_started':
            return 0
        elif self.status == 'in_progress':
            return 50
        elif self.status == 'on_hold':
            return 25
        else:
            return 0

class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    attachment = models.FileField(upload_to='task_comment_attachments/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Comment on {self.task.title} by {self.author.username}"
    
    class Meta:
        ordering = ['created_at']

class TaskAttachment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachment_files')
    file = models.FileField(upload_to='task_attachments/')
    filename = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return f"{self.filename or self.file.name}"
    
    def save(self, *args, **kwargs):
        if not self.filename and self.file:
            self.filename = self.file.name
        super().save(*args, **kwargs)