from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('widgets/update/', views.update_widgets, name='dashboard-update-widgets'),
]