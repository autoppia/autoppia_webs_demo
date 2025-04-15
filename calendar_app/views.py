from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy, reverse
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone
from django.contrib import messages
from datetime import datetime, timedelta
import json

from .models import CalendarEvent
from .forms import CalendarEventForm

class CalendarView(LoginRequiredMixin, TemplateView):
    template_name = 'calendar_app/calendar.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context

@login_required
def get_events(request):
    """API endpoint to get events for FullCalendar."""
    start = request.GET.get('start')
    end = request.GET.get('end')
    
    # Convert string dates to datetime objects
    start_date = datetime.fromisoformat(start.replace('Z', '+00:00'))
    end_date = datetime.fromisoformat(end.replace('Z', '+00:00'))
    
    # Query events within the requested date range
    events = CalendarEvent.objects.filter(
        start_time__lt=end_date,
        end_time__gt=start_date
    )
    
    # Convert events to dictionary format for FullCalendar
    event_list = [event.to_dict() for event in events]
    
    return JsonResponse(event_list, safe=False)

class CalendarEventCreateView(LoginRequiredMixin, CreateView):
    model = CalendarEvent
    form_class = CalendarEventForm
    template_name = 'calendar_app/event_form.html'
    success_url = reverse_lazy('calendar')
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs
    
    def form_valid(self, form):
        # Set the created_by field to the current user
        form.instance.created_by = self.request.user
        response = super().form_valid(form)
        messages.success(self.request, 'Event created successfully.')
        return response
    
    def get_initial(self):
        initial = super().get_initial()
        
        # Pre-fill date and time if provided in URL parameters
        if 'date' in self.request.GET:
            try:
                date_str = self.request.GET.get('date')
                event_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                initial['start_date'] = event_date
                initial['end_date'] = event_date
            except ValueError:
                pass
        
        if 'start' in self.request.GET and 'end' in self.request.GET:
            try:
                start_str = self.request.GET.get('start')
                end_str = self.request.GET.get('end')
                
                start_dt = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
                end_dt = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
                
                initial['start_date'] = start_dt.date()
                initial['start_time'] = start_dt.time()
                initial['end_date'] = end_dt.date()
                initial['end_time'] = end_dt.time()
                initial['all_day'] = False
            except ValueError:
                pass
        
        return initial

class CalendarEventUpdateView(LoginRequiredMixin, UpdateView):
    model = CalendarEvent
    form_class = CalendarEventForm
    template_name = 'calendar_app/event_form.html'
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs
    
    def get_success_url(self):
        return reverse('calendar-event-detail', kwargs={'pk': self.object.pk})
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Event updated successfully.')
        return response

class CalendarEventDetailView(LoginRequiredMixin, DetailView):
    model = CalendarEvent
    template_name = 'calendar_app/event_detail.html'
    context_object_name = 'event'

class CalendarEventDeleteView(LoginRequiredMixin, DeleteView):
    model = CalendarEvent
    template_name = 'calendar_app/event_confirm_delete.html'
    success_url = reverse_lazy('calendar')
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, 'Event deleted successfully.')
        return super().delete(request, *args, **kwargs)

@login_required
def quick_add_event(request):
    """Quick add event via AJAX."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            title = data.get('title')
            start = data.get('start')
            end = data.get('end')
            all_day = data.get('allDay', False)
            
            if not title or not start:
                return JsonResponse({'success': False, 'error': 'Missing required fields'}, status=400)
            
            # Convert string dates to datetime objects
            start_dt = datetime.fromisoformat(start.replace('Z', '+00:00'))
            
            if end:
                end_dt = datetime.fromisoformat(end.replace('Z', '+00:00'))
            else:
                # Default to 1 hour duration if no end time provided
                end_dt = start_dt + timedelta(hours=1)
            
            # Create the event
            event = CalendarEvent.objects.create(
                title=title,
                start_time=start_dt,
                end_time=end_dt,
                all_day=all_day,
                created_by=request.user
            )
            
            return JsonResponse({
                'success': True,
                'event': event.to_dict()
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)

@login_required
def update_event_dates(request, pk):
    """Update event dates via AJAX (for drag and drop)."""
    if request.method == 'POST':
        try:
            event = get_object_or_404(CalendarEvent, pk=pk)
            data = json.loads(request.body)
            
            start = data.get('start')
            end = data.get('end')
            all_day = data.get('allDay', event.all_day)
            
            if not start:
                return JsonResponse({'success': False, 'error': 'Missing start date'}, status=400)
            
            # Convert string dates to datetime objects
            start_dt = datetime.fromisoformat(start.replace('Z', '+00:00'))
            
            if end:
                end_dt = datetime.fromisoformat(end.replace('Z', '+00:00'))
            else:
                # Maintain same duration if no end time provided
                duration = event.end_time - event.start_time
                end_dt = start_dt + duration
            
            # Update the event
            event.start_time = start_dt
            event.end_time = end_dt
            event.all_day = all_day
            event.save()
            
            return JsonResponse({
                'success': True,
                'event': event.to_dict()
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)