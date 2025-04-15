from django.urls import path
from . import views

urlpatterns = [
    path('', views.ContactListView.as_view(), name='contact-list'),
    path('<int:pk>/', views.ContactDetailView.as_view(), name='contact-detail'),
    path('create/', views.ContactCreateView.as_view(), name='contact-create'),
    path('<int:pk>/update/', views.ContactUpdateView.as_view(), name='contact-update'),
    path('<int:pk>/delete/', views.ContactDeleteView.as_view(), name='contact-delete'),
]