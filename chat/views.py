from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db.models import Q
from django.contrib.auth.models import User
from .models import ChatRoom, Message

@login_required
def chat_home(request):
    # Get all chat rooms the user is part of
    chat_rooms = ChatRoom.objects.filter(participants=request.user)
    
    context = {
        'chat_rooms': chat_rooms,
        'users': User.objects.exclude(id=request.user.id),
    }
    
    return render(request, 'chat/chat_home.html', context)

@login_required
def chat_list(request):
    """List of chat rooms - can be identical to chat_index"""
    chat_rooms = ChatRoom.objects.all().order_by('-created_at')
    return render(request, 'chat/chat_list.html', {'chat_rooms': chat_rooms})

@login_required
def chat_room(request, room_id):
    room = get_object_or_404(ChatRoom, id=room_id, participants=request.user)
    messages = room.messages.all()
    
    # Mark all messages as read
    unread_messages = messages.filter(is_read=False).exclude(sender=request.user)
    unread_messages.update(is_read=True)
    
    context = {
        'room': room,
        'messages': messages,
        'users': User.objects.exclude(id=request.user.id),
    }
    
    return render(request, 'chat/chat_room.html', context)

@login_required
def create_room(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        participant_ids = request.POST.getlist('participants')
        
        if name and participant_ids:
            # Create a new chat room
            room = ChatRoom.objects.create(name=name, is_group=True)
            
            # Add the current user and selected participants
            room.participants.add(request.user)
            for user_id in participant_ids:
                room.participants.add(User.objects.get(id=user_id))
            
            return redirect('chat-room', room_id=room.id)
    
    return redirect('chat-home')

@login_required
def create_direct_chat(request, user_id):
    other_user = get_object_or_404(User, id=user_id)
    
    # Check if a direct chat already exists
    existing_rooms = ChatRoom.objects.filter(is_group=False, participants=request.user).filter(participants=other_user)
    
    if existing_rooms.exists():
        room = existing_rooms.first()
    else:
        # Create a new direct chat room
        room_name = f"Chat with {other_user.username}"
        room = ChatRoom.objects.create(name=room_name, is_group=False)
        room.participants.add(request.user, other_user)
    
    return redirect('chat-room', room_id=room.id)

@login_required
def send_message(request, room_id):
    if request.method == 'POST':
        room = get_object_or_404(ChatRoom, id=room_id, participants=request.user)
        content = request.POST.get('content')
        
        if content:
            message = Message.objects.create(
                room=room,
                sender=request.user,
                content=content
            )
            
            # Handle file attachment if present
            if request.FILES.get('attachment'):
                message.attachment = request.FILES['attachment']
                message.save()
            
            return JsonResponse({
                'status': 'success',
                'message_id': message.id,
                'sender': request.user.username,
                'content': message.content,
                'attachment': message.attachment.url if message.attachment else None,
                'timestamp': message.created_at.strftime('%b %d, %Y, %I:%M %p')
            })
    
    return JsonResponse({'status': 'error'})

@login_required
def get_messages(request, room_id):
    room = get_object_or_404(ChatRoom, id=room_id, participants=request.user)
    
    # Get messages after a certain ID (for polling)
    last_id = request.GET.get('last_id', 0)
    messages = room.messages.filter(id__gt=last_id)
    
    # Mark messages as read
    unread_messages = messages.filter(is_read=False).exclude(sender=request.user)
    unread_messages.update(is_read=True)
    
    message_list = []
    for message in messages:
        message_list.append({
            'id': message.id,
            'sender': message.sender.username,
            'is_self': message.sender == request.user,
            'content': message.content,
            'attachment': message.attachment.url if message.attachment else None,
            'timestamp': message.created_at.strftime('%b %d, %Y, %I:%M %p')
        })
    
    return JsonResponse({'messages': message_list})