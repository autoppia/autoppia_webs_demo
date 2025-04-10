from django.urls import path
from . import views

app_name = 'movieapp'

urlpatterns = [
    # Main view
    path('', views.index, name='index'),

    # Movie details
    path('book/<int:movie_id>/', views.detail, name='detail'),

    # CRUD operations for movies
    path('add/', views.add_movie, name='add_movie'),
    path('update/<int:id>', views.update_movie, name='update'),
    path('delete_cart/<int:id>', views.delete_cart, name="delete_cart"),
    path('delete/<int:id>', views.delete_movie, name='delete'),
    path('cart/<int:id>', views.add_to_cart, name='cart'),
    path("carts/", views.carts_count, name="carts_count"),
    path('shoppingcarts/', views.shoppingcart, name='shoppingcart'),
    path('mybook/', views.mybook, name="mybook"),
    # Genre pages
    path('genres/', views.genre_list, name='genre_list'),
    path('genre/<int:genre_id>/', views.genre_detail, name='genre_detail'),
    path('payment-success/', views.payment_success, name="payment_success"),

    # Comments
    path('book/<int:movie_id>/comment/', views.add_comment, name='add_comment'),
    path('contact/', views.contact, name='contact'),
    path('about/', views.about, name='about'),
    # Authentication
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    path('profile/', views.profile_view, name='profile'),
]
