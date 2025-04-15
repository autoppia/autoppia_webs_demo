from django.urls import path
from . import views

urlpatterns = [
    path('', views.chat_home, name='chat-home'),
    path('room/<int:room_id>/', views.chat_room, name='chat-room'),
    path('create/', views.create_room, name='chat-create'),
    path('direct/<int:user_id>/', views.create_direct_chat, name='chat-direct'),
    path('', views.chat_list, name='chat-list'),
    path('room/<int:room_id>/send/', views.send_message, name='chat-send'),
    path('room/<int:room_id>/messages/', views.get_messages, name='chat-messages'),
]