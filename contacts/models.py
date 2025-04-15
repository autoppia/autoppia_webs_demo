from django.db import models
from django.urls import reverse
from clients.models import Client

class Contact(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='contacts')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    mobile = models.CharField(max_length=20, blank=True, null=True)
    job_title = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_absolute_url(self):
        return reverse('contact-detail', kwargs={'pk': self.pk})
    
    def save(self, *args, **kwargs):
        # If this contact is marked as primary, unmark other contacts for this client
        if self.is_primary:
            Contact.objects.filter(client=self.client, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['last_name', 'first_name']