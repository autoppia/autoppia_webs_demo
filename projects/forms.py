from django import forms
from .models import Project, ProjectAttachment
from clients.models import Client
from django.contrib.auth.models import User

class ProjectForm(forms.ModelForm):
    tags = forms.CharField(required=False, 
                          widget=forms.TextInput(attrs={'data-role': 'tagsinput'}),
                          help_text="Enter tags separated by commas")
    
    class Meta:
        model = Project
        fields = ['name', 'description', 'client', 'start_date', 'end_date', 
                 'status', 'priority', 'budget', 'manager', 'team_members', 
                 'is_billable']
        widgets = {
            'start_date': forms.DateInput(attrs={'class': 'datepicker', 'autocomplete': 'off'}),
            'end_date': forms.DateInput(attrs={'class': 'datepicker', 'autocomplete': 'off'}),
            'team_members': forms.SelectMultiple(attrs={'class': 'select2-multiple'}),
        }
    
    def __init__(self, *args, **kwargs):
        # Properly extract the request object before calling super().__init__
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)
        
        # Sort clients alphabetically
        self.fields['client'].queryset = Client.objects.all().order_by('name')
        # Sort users alphabetically
        self.fields['manager'].queryset = User.objects.all().order_by('first_name', 'last_name')
        self.fields['team_members'].queryset = User.objects.all().order_by('first_name', 'last_name')
        
        # Make some fields optional
        self.fields['end_date'].required = False
        self.fields['manager'].required = False
        self.fields['budget'].required = False
        
        # Set initial values for new projects
        if not self.instance.pk:
            self.fields['status'].initial = 'not_started'
            self.fields['priority'].initial = 'medium'
    
    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('start_date')
        end_date = cleaned_data.get('end_date')
        
        # Validate end date is after start date
        if start_date and end_date and end_date < start_date:
            self.add_error('end_date', 'End date must be after start date')
        
        return cleaned_data
    
    def save(self, commit=True):
        project = super().save(commit=True)  # Save the project first
        
        # Process tags
        if 'tags' in self.cleaned_data and self.cleaned_data['tags']:
            tags_list = [tag.strip() for tag in self.cleaned_data['tags'].split(',') if tag.strip()]
            project.tags = tags_list
        
        if commit:
            self._save_m2m()  # Save many-to-many relationships
        
        return project