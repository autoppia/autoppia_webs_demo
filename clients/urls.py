from django.urls import path
from . import views

urlpatterns = [
    path('', views.ClientListView.as_view(), name='client-list'),
    path('<int:pk>/', views.ClientDetailView.as_view(), name='client-detail'),
    path('create/', views.ClientCreateView.as_view(), name='client-create'),
    path('<int:pk>/update/', views.ClientUpdateView.as_view(), name='client-update'),
    path('<int:pk>/delete/', views.ClientDeleteView.as_view(), name='client-delete'),
]