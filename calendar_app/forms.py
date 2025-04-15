from django import forms
from django.contrib.auth.models import User
from .models import CalendarEvent
from projects.models import Project
from clients.models import Client

class CalendarEventForm(forms.ModelForm):
    start_date = forms.DateField(
        widget=forms.DateInput(attrs={'class': 'form-control datepicker', 'autocomplete': 'off'}),
        required=True
    )
    start_time = forms.TimeField(
        widget=forms.TimeInput(attrs={'class': 'form-control timepicker', 'autocomplete': 'off'}),
        required=False
    )
    end_date = forms.DateField(
        widget=forms.DateInput(attrs={'class': 'form-control datepicker', 'autocomplete': 'off'}),
        required=True
    )
    end_time = forms.TimeField(
        widget=forms.TimeInput(attrs={'class': 'form-control timepicker', 'autocomplete': 'off'}),
        required=False
    )
    
    attendees = forms.ModelMultipleChoiceField(
        queryset=User.objects.all(),
        required=False,
        widget=forms.SelectMultiple(attrs={'class': 'form-control select2'})
    )
    
    class Meta:
        model = CalendarEvent
        fields = ['title', 'description', 'all_day', 'location', 'event_type', 
                 'color', 'attendees', 'project', 'client', 'is_recurring',
                 'recurrence_pattern', 'recurrence_end_date']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'all_day': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'location': forms.TextInput(attrs={'class': 'form-control'}),
            'event_type': forms.Select(attrs={'class': 'form-control'}),
            'color': forms.TextInput(attrs={'class': 'form-control color-picker'}),
            'project': forms.Select(attrs={'class': 'form-control select2'}),
            'client': forms.Select(attrs={'class': 'form-control select2'}),
            'is_recurring': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'recurrence_pattern': forms.TextInput(attrs={'class': 'form-control'}),
            'recurrence_end_date': forms.DateInput(attrs={'class': 'form-control datepicker', 'autocomplete': 'off'}),
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Make some fields optional
        self.fields['event_type'].required = False
        self.fields['recurrence_pattern'].required = False
        self.fields['recurrence_end_date'].required = False
        
        # Set queryset for related models
        self.fields['project'].queryset = Project.objects.all().order_by('name')
        self.fields['client'].queryset = Client.objects.all().order_by('name')
        self.fields['attendees'].queryset = User.objects.all().order_by('first_name', 'last_name')
        
        # Set initial values for fields
        if self.instance.pk:
            # For editing existing events
            self.fields['start_date'].initial = self.instance.start_time.date()
            self.fields['end_date'].initial = self.instance.end_time.date()
            
            if not self.instance.all_day:
                self.fields['start_time'].initial = self.instance.start_time.time()
                self.fields['end_time'].initial = self.instance.end_time.time()
    
    def clean(self):
        cleaned_data = super().clean()
        all_day = cleaned_data.get('all_day')
        start_date = cleaned_data.get('start_date')
        start_time = cleaned_data.get('start_time')
        end_date = cleaned_data.get('end_date')
        end_time = cleaned_data.get('end_time')
        is_recurring = cleaned_data.get('is_recurring')
        recurrence_pattern = cleaned_data.get('recurrence_pattern')
        recurrence_end_date = cleaned_data.get('recurrence_end_date')
        
        # Validate start and end dates
        if start_date and end_date and start_date > end_date:
            self.add_error('end_date', 'End date cannot be before start date.')
        
        # Set default times if not provided
        if all_day:
            # For all-day events, set times to beginning and end of day
            from datetime import time
            start_time = time(0, 0)
            end_time = time(23, 59, 59)
        else:
            # For time-specific events, require times
            if not start_time:
                self.add_error('start_time', 'Start time is required for non-all-day events.')
            if not end_time:
                self.add_error('end_time', 'End time is required for non-all-day events.')
            
            # Validate start and end times for same-day events
            if start_date and end_date and start_date == end_date and start_time and end_time and start_time > end_time:
                self.add_error('end_time', 'End time cannot be before start time on the same day.')
        
        # Validate recurrence fields
        if is_recurring:
            if not recurrence_pattern:
                self.add_error('recurrence_pattern', 'Recurrence pattern is required for recurring events.')
            if not recurrence_end_date:
                self.add_error('recurrence_end_date', 'Recurrence end date is required for recurring events.')
            elif recurrence_end_date < start_date:
                self.add_error('recurrence_end_date', 'Recurrence end date must be after the start date.')
        
        return cleaned_data
    
    def save(self, commit=True):
        event = super().save(commit=False)
        
        # Combine date and time fields
        from datetime import datetime, time
        start_date = self.cleaned_data.get('start_date')
        start_time = self.cleaned_data.get('start_time') or time(0, 0)
        end_date = self.cleaned_data.get('end_date')
        end_time = self.cleaned_data.get('end_time') or time(23, 59, 59)
        
        event.start_time = datetime.combine(start_date, start_time)
        event.end_time = datetime.combine(end_date, end_time)
        
        # Set created_by if it's a new event
        if not event.pk and self.user:
            event.created_by = self.user
        
        if commit:
            event.save()
            # Save many-to-many relationships
            self.save_m2m()
        
        return event