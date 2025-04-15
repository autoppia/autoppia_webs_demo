from django import forms
from .models import Task, TaskComment, TaskAttachment
from projects.models import Project
from django.contrib.auth.models import User

class TaskForm(forms.ModelForm):
    tags = forms.CharField(required=False, 
                          widget=forms.TextInput(attrs={'data-role': 'tagsinput'}),
                          help_text="Enter tags separated by commas")
    
    class Meta:
        model = Task
        fields = ['title', 'description', 'project', 'assignee', 'due_date', 
                 'start_date', 'completion_date', 'status', 'priority', 
                 'estimated_hours', 'is_billable',
                 'is_recurring', 'recurrence_type', 'recurrence_end_date', 'notes',
                 'parent_task']
        widgets = {
            'due_date': forms.DateInput(attrs={'class': 'datepicker', 'autocomplete': 'off'}),
            'start_date': forms.DateInput(attrs={'class': 'datepicker', 'autocomplete': 'off'}),
            'completion_date': forms.DateInput(attrs={'class': 'datepicker', 'autocomplete': 'off'}),
            'recurrence_end_date': forms.DateInput(attrs={'class': 'datepicker', 'autocomplete': 'off'}),
            'description': forms.Textarea(attrs={'rows': 4}),
            'notes': forms.Textarea(attrs={'rows': 3}),
        }
    
    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)
        
        # Sort projects alphabetically
        self.fields['project'].queryset = Project.objects.all().order_by('name')
        
        # Sort users alphabetically
        self.fields['assignee'].queryset = User.objects.all().order_by('first_name', 'last_name')
        
        # Filter parent tasks to exclude self and descendants
        if self.instance.pk:
            self.fields['parent_task'].queryset = Task.objects.exclude(
                pk=self.instance.pk
            ).order_by('-created_at')
        
        # Make some fields optional
        self.fields['start_date'].required = False
        self.fields['completion_date'].required = False
        self.fields['estimated_hours'].required = False
        self.fields['notes'].required = False
        self.fields['parent_task'].required = False
        self.fields['recurrence_type'].required = False
        self.fields['recurrence_end_date'].required = False
        
        # Set initial values for new tasks
        if not self.instance.pk:
            self.fields['status'].initial = 'not_started'
            self.fields['priority'].initial = 'medium'
            self.fields['is_billable'].initial = True
            self.fields['is_recurring'].initial = False
            
            # Set current user as default assignee if authenticated
            if self.request and self.request.user.is_authenticated:
                self.fields['assignee'].initial = self.request.user.id
        
        # Set tags field value from instance
        if self.instance.pk and self.instance.tags:
            self.initial['tags'] = ', '.join(self.instance.tags)
    
    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('start_date')
        due_date = cleaned_data.get('due_date')
        completion_date = cleaned_data.get('completion_date')
        is_recurring = cleaned_data.get('is_recurring')
        recurrence_type = cleaned_data.get('recurrence_type')
        recurrence_end_date = cleaned_data.get('recurrence_end_date')
        
        # Validate due date is after start date
        if start_date and due_date and due_date < start_date:
            self.add_error('due_date', 'Due date must be after start date')
        
        # Validate completion date is after or on due date
        if completion_date and due_date and completion_date < due_date:
            self.add_error('completion_date', 'Completion date must be after or on due date')
        
        # Validate recurring task fields
        if is_recurring:
            if not recurrence_type:
                self.add_error('recurrence_type', 'Recurrence type is required for recurring tasks')
            
            if not recurrence_end_date:
                self.add_error('recurrence_end_date', 'Recurrence end date is required for recurring tasks')
            elif due_date and recurrence_end_date < due_date:
                self.add_error('recurrence_end_date', 'Recurrence end date must be after due date')
        
        return cleaned_data
    
    def save(self, commit=True):
        task = super().save(commit=False)
        
        # Process tags
        if 'tags' in self.cleaned_data and self.cleaned_data['tags']:
            tags_list = [tag.strip() for tag in self.cleaned_data['tags'].split(',') if tag.strip()]
            task.tags = tags_list
        else:
            task.tags = []
        
        # Set created_by if it's a new task
        if not task.pk and self.request and self.request.user.is_authenticated:
            task.created_by = self.request.user
        
        if commit:
            task.save()
        
        return task

class TaskCommentForm(forms.ModelForm):
    class Meta:
        model = TaskComment
        fields = ['content', 'attachment']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Add a comment...'}),
        }

class TaskAttachmentForm(forms.Form):
    files = forms.FileField(
        widget=forms.FileInput(),
        required=False
    )

class TaskFilterForm(forms.Form):
    STATUS_CHOICES = [('', 'All Statuses')] + list(Task.STATUS_CHOICES)
    PRIORITY_CHOICES = [('', 'All Priorities')] + list(Task.PRIORITY_CHOICES)
    
    search = forms.CharField(required=False, widget=forms.TextInput(attrs={
        'placeholder': 'Search tasks...',
        'class': 'form-control'
    }))
    
    status = forms.ChoiceField(choices=STATUS_CHOICES, required=False, widget=forms.Select(attrs={
        'class': 'form-select'
    }))
    
    priority = forms.ChoiceField(choices=PRIORITY_CHOICES, required=False, widget=forms.Select(attrs={
        'class': 'form-select'
    }))
    
    project = forms.ModelChoiceField(
        queryset=Project.objects.all().order_by('name'),
        required=False,
        empty_label="All Projects",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    assignee = forms.ModelChoiceField(
        queryset=User.objects.all().order_by('first_name', 'last_name'),
        required=False,
        empty_label="All Assignees",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    due_date_from = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'class': 'form-control datepicker', 'placeholder': 'From'})
    )
    
    due_date_to = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'class': 'form-control datepicker', 'placeholder': 'To'})
    )
    
    is_overdue = forms.BooleanField(required=False, widget=forms.CheckboxInput(attrs={
        'class': 'form-check-input'
    }))