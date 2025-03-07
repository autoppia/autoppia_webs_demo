# Add this to your project's urls.py

from django.urls import path
from modules.webs_demo.web_1_demo_movies.admin.views import reset_database 

urlpatterns = [
    path('admin/reset_db/', reset_database, name='reset_database'),
]
