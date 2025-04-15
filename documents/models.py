from django.db import models
from django.urls import reverse
from django.contrib.auth.models import User
from clients.models import Client
from projects.models import Project

def document_upload_path(instance, filename):
    # File will be uploaded to MEDIA_ROOT/documents/client_<id>/<filename>
    if instance.client:
        return f'documents/client_{instance.client.id}/{filename}'
    elif instance.project:
        return f'documents/project_{instance.project.id}/{filename}'
    else:
        return f'documents/general/{filename}'

class Document(models.Model):
    CATEGORY_CHOICES = (
        ('contract', 'Contract'),
        ('proposal', 'Proposal'),
        ('report', 'Report'),
        ('invoice', 'Invoice'),
        ('other', 'Other'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to=document_upload_path)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_documents')
    is_public = models.BooleanField(default=False, help_text="If checked, clients can view this document")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('document-detail', kwargs={'pk': self.pk})
    
    def filename(self):
        return self.file.name.split('/')[-1]
    
    class Meta:
        ordering = ['-created_at']