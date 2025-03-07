from django.urls import path
from . import views

app_name = 'movieapp'

urlpatterns = [
    # Main view
    path('', views.index, name='index'),

    # Movie details
    path('movie/<int:movie_id>/', views.detail, name='detail'),

    # CRUD operations for movies
    path('add/', views.add_movie, name='add_movie'),
    path('update/<int:id>', views.update_movie, name='update'),
    path('delete/<int:id>', views.delete_movie, name='delete'),

    # Genre pages
    path('genres/', views.genre_list, name='genre_list'),
    path('genre/<int:genre_id>/', views.genre_detail, name='genre_detail'),

    # Comments
    path('movie/<int:movie_id>/comment/', views.add_comment, name='add_comment'),
    path('contact/', views.contact, name='contact'),
    path('about/', views.about, name='about'),
    # Authentication
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    path('profile/', views.profile_view, name='profile'),
]
