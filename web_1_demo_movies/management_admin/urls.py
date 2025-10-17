# Add this to your project's urls.py

from django.urls import path
from management_admin.views import reset_database

urlpatterns = [
    path("management_admin/reset_db/", reset_database, name="reset_database"),
]
