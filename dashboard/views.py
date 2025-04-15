from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from clients.models import Client
from projects.models import Project
from tasks.models import Task
from documents.models import Document
from calendar_app.models import CalendarEvent
from .models import DashboardWidget
import json

@login_required
def dashboard(request):
    # Get counts for various models
    client_count = Client.objects.count()
    project_count = Project.objects.count()
    task_count = Task.objects.count()
    document_count = Document.objects.count()
    
    # Get recent items
    recent_clients = Client.objects.order_by('-created_at')[:5]
    recent_projects = Project.objects.order_by('-created_at')[:5]
    recent_tasks = Task.objects.order_by('-created_at')[:5]
    
    # Get upcoming events
    today = timezone.now().date()
    upcoming_events = CalendarEvent.objects.filter(
        start_time__date__gte=today
    ).order_by('start_time')[:5]
    
    # Get project status counts for chart
    project_status_counts = []
    for status, label in Project.STATUS_CHOICES:
        count = Project.objects.filter(status=status).count()
        project_status_counts.append({
            'status': label,
            'count': count
        })
    
    # Get task status counts for chart
    task_status_counts = []
    for status, label in Task.STATUS_CHOICES:
        count = Task.objects.filter(status=status).count()
        task_status_counts.append({
            'status': label,
            'count': count
        })
    
    # Get tasks due soon
    next_week = today + timedelta(days=7)
    tasks_due_soon = Task.objects.filter(
        due_date__gte=today,
        due_date__lte=next_week
    ).order_by('due_date')
    
    # Get user's dashboard widgets
    widgets = DashboardWidget.objects.filter(
        user=request.user,
        is_visible=True
    ).order_by('order')
    
    context = {
        'client_count': client_count,
        'project_count': project_count,
        'task_count': task_count,
        'document_count': document_count,
        'recent_clients': recent_clients,
        'recent_projects': recent_projects,
        'recent_tasks': recent_tasks,
        'upcoming_events': upcoming_events,
        'project_status_counts': project_status_counts,
        'task_status_counts': task_status_counts,
        'tasks_due_soon': tasks_due_soon,
        'widgets': widgets,
    }
    
    return render(request, 'dashboard/dashboard.html', context)

@login_required
def update_widgets(request):
    if request.method == 'POST' and request.is_ajax():
        try:
            data = json.loads(request.body)
            widgets = data.get('widgets', [])
            
            for i, widget_data in enumerate(widgets):
                widget_id = widget_data.get('id')
                is_visible = widget_data.get('visible', True)
                
                widget = DashboardWidget.objects.get(id=widget_id, user=request.user)
                widget.order = i
                widget.is_visible = is_visible
                widget.save()
            
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False})