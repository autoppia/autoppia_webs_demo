from django.urls import path
from . import views

urlpatterns = [
    path('', views.DocumentListView.as_view(), name='document-list'),
    path('<int:pk>/', views.DocumentDetailView.as_view(), name='document-detail'),
    path('create/', views.DocumentCreateView.as_view(), name='document-create'),
    path('<int:pk>/update/', views.DocumentUpdateView.as_view(), name='document-update'),
    path('<int:pk>/delete/', views.DocumentDeleteView.as_view(), name='document-delete'),
    path('<int:pk>/download/', views.download_document, name='document-download'),
    path('sample/', views.sample_document, name='document-sample'),
]