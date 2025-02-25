from django.urls import path
from . import views

app_name = 'movieapp'

urlpatterns = [
    # Vista principal
    path('', views.index, name='index'),
    
    # Detalles de película
    path('movie/<int:movie_id>/', views.detail, name='detail'),
    
    # Operaciones CRUD para películas
    path('add/', views.add_movie, name='add_movie'),
    path('update/<int:id>', views.update, name='update'),
    path('delete/<int:id>', views.delete, name='delete'),
    
    # Páginas de género
    path('genres/', views.genre_list, name='genre_list'),
    path('genre/<int:genre_id>/', views.genre_detail, name='genre_detail'),
]