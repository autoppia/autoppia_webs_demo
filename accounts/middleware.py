from django.shortcuts import redirect
from django.urls import reverse
from django.conf import settings

class LoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization
        self.login_url = settings.LOGIN_URL
        self.open_urls = [
            self.login_url,
            reverse('register'),
            reverse('password_reset'),
            reverse('password_reset_done'),
            reverse('password_reset_complete'),
            reverse('terms'),
            reverse('privacy'),
        ]
        # Add password reset confirm URL pattern
        self.open_url_prefixes = [
            '/admin/',
            '/auth/',
            '/static/',
            '/media/',
        ]

    def __call__(self, request):
        # Code to be executed for each request before the view is called
        if not request.user.is_authenticated:
            path = request.path_info
            
            # Check if the path is in the open URLs
            if path in self.open_urls:
                return self.get_response(request)
            
            # Check if the path starts with any of the open URL prefixes
            for prefix in self.open_url_prefixes:
                if path.startswith(prefix):
                    return self.get_response(request)
            
            # Check for password reset confirm URL pattern
            if 'password-reset-confirm' in path:
                return self.get_response(request)
            
            # If not authenticated and not in open URLs, redirect to login
            return redirect(self.login_url)
        
        return self.get_response(request)