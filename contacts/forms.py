from django import forms
from .models import Contact

class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = ['client', 'first_name', 'last_name', 'email', 'phone', 'mobile', 
                  'job_title', 'department', 'is_primary', 'notes']
        widgets = {
            'notes': forms.Textarea(attrs={'rows': 3}),
        }