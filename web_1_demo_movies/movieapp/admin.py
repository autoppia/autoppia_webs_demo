from django.contrib import admin
from .models import Movie
from .models import ContactMessage

admin.site.register(Movie)
# Register your models here.


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "email", "subject", "message")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
