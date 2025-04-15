from django.urls import path
from . import views

urlpatterns = [
    path('', views.TaskListView.as_view(), name='task-list'),
    path('<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),
    path('create/', views.TaskCreateView.as_view(), name='task-create'),
    path('<int:pk>/update/', views.TaskUpdateView.as_view(), name='task-update'),
    path('<int:pk>/delete/', views.TaskDeleteView.as_view(), name='task-delete'),
    path('<int:pk>/comment/', views.add_task_comment, name='task-add-comment'),
    path('<int:pk>/attachments/upload/', views.upload_task_attachments, name='task-upload-attachments'),
    path('<int:task_pk>/attachment/<int:attachment_pk>/delete/', views.delete_task_attachment, name='task-delete-attachment'),
    path('<int:pk>/status/update/', views.update_task_status, name='task-update-status'),
]