from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """Extended user profile model"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=50, blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    zipcode = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='userprofile', blank=True, null=True)
    
    def __str__(self):
        return self.user.username
    
    def full_address(self):
        """Return the full address as a string"""
        address_parts = [
            self.address,
            self.city,
            self.state,
            self.zipcode,
            self.country
        ]
        # Filter out empty parts
        address_parts = [part for part in address_parts if part]
        return ", ".join(address_parts) if address_parts else "No address provided"