from django.contrib import admin
from .models import UserProfile

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'city', 'state', 'country')
    list_filter = ('city', 'state', 'country')
    search_fields = ('user__username', 'user__email', 'phone')

admin.site.register(UserProfile, UserProfileAdmin)