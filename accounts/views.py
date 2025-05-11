from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages, auth
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import HttpResponse
from .models import UserProfile
from orders.models import Order, OrderProduct

def login_email(request):
    """First step of login - collect email"""
    if request.method == 'POST':
        email = request.POST['email']
        
        # Store email in session for the next step
        request.session['login_email'] = email
        
        # Check if user exists with this email
        try:
            user = User.objects.get(email=email)
            return redirect('login_password')
        except User.DoesNotExist:
            messages.error(request, 'No account found with this email address')
            return redirect('login')
    
    return render(request, 'accounts/login.html')

def login_password(request):
    """Second step of login - collect password"""
    # Get email from session
    email = request.session.get('login_email')
    if not email:
        return redirect('login')
    
    if request.method == 'POST':
        password = request.POST['password']
        
        # Get username from email
        try:
            user = User.objects.get(email=email)
            username = user.username
            
            # Authenticate and login
            user = auth.authenticate(username=username, password=password)
            
            if user is not None:
                auth.login(request, user)
                messages.success(request, 'You are now logged in')
                
                # Clear session data
                if 'login_email' in request.session:
                    del request.session['login_email']
                
                # Redirect to checkout if coming from checkout
                url = request.META.get('HTTP_REFERER')
                try:
                    query = requests.utils.urlparse(url).query
                    params = dict(x.split('=') for x in query.split('&'))
                    if 'next' in params:
                        return redirect(params['next'])
                except:
                    return redirect('dashboard')
            else:
                messages.error(request, 'Invalid password')
                return redirect('login_password')
        except User.DoesNotExist:
            messages.error(request, 'User does not exist')
            return redirect('login')
    
    context = {
        'email': email
    }
    return render(request, 'accounts/login_password.html', context)

def register(request):
    if request.method == 'POST':
        # Get form data
        name = request.POST.get('name', '')
        email = request.POST.get('email', '')
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')
        
        # Split name into first_name and last_name
        name_parts = name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Validate form data
        if password != confirm_password:
            messages.error(request, 'Passwords do not match!')
            return redirect('register')
        
        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists!')
            return redirect('register')
        
        # Create user
        username = email.split('@')[0]
        
        # Make sure username is unique
        if User.objects.filter(username=username).exists():
            username = f"{username}{User.objects.count()}"
        
        user = User.objects.create_user(
            first_name=first_name,
            last_name=last_name,
            email=email,
            username=username,
            password=password
        )
        
        # Create user profile
        profile = UserProfile()
        profile.user = user
        
        # If email is actually a phone number, store it in the profile
        if not '@' in email and email.replace('+', '').replace('-', '').isdigit():
            profile.phone = email
        
        profile.save()
        
        messages.success(request, 'Registration successful')
        return redirect('login')
    
    return render(request, 'accounts/register.html')

@login_required(login_url='login')
def logout(request):
    auth.logout(request)
    messages.success(request, 'You are logged out')
    return redirect('login')

@login_required(login_url='login')
def dashboard(request):
    orders = Order.objects.filter(user=request.user, is_ordered=True).order_by('-created_at')
    orders_count = orders.count()
    
    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        userprofile = UserProfile.objects.create(user=request.user)
    
    context = {
        'orders_count': orders_count,
        'userprofile': userprofile,
    }
    return render(request, 'accounts/dashboard.html', context)

@login_required(login_url='login')
def my_orders(request):
    orders = Order.objects.filter(user=request.user, is_ordered=True).order_by('-created_at')
    
    context = {
        'orders': orders,
    }
    return render(request, 'accounts/my_orders.html', context)

@login_required(login_url='login')
def edit_profile(request):
    userprofile = get_object_or_404(UserProfile, user=request.user)
    
    if request.method == 'POST':
        # Get form data
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        phone = request.POST.get('phone', '')
        address = request.POST.get('address', '')
        city = request.POST.get('city', '')
        state = request.POST.get('state', '')
        country = request.POST.get('country', '')
        zipcode = request.POST.get('zipcode', '')
        
        # Update user
        user = request.user
        user.first_name = first_name
        user.last_name = last_name
        user.save()
        
        # Update profile
        userprofile.phone = phone
        userprofile.address = address
        userprofile.city = city
        userprofile.state = state
        userprofile.country = country
        userprofile.zipcode = zipcode
        
        if 'profile_picture' in request.FILES:
            userprofile.profile_picture = request.FILES['profile_picture']
            
        userprofile.save()
        messages.success(request, 'Your profile has been updated')
        return redirect('edit_profile')
    
    context = {
        'userprofile': userprofile,
    }
    return render(request, 'accounts/edit_profile.html', context)

@login_required(login_url='login')
def order_detail(request, order_id):
    order_detail = OrderProduct.objects.filter(order__order_number=order_id)
    order = Order.objects.get(order_number=order_id)
    
    subtotal = 0
    for i in order_detail:
        subtotal += i.product_price * i.quantity
    
    context = {
        'order_detail': order_detail,
        'order': order,
        'subtotal': subtotal,
    }
    return render(request, 'accounts/order_detail.html', context)