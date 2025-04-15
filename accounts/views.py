from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse_lazy
from django.views.generic import CreateView
from django.contrib.auth.views import (
    LoginView, LogoutView, PasswordResetView, PasswordResetDoneView,
    PasswordResetConfirmView, PasswordResetCompleteView
)
from .forms import LoginForm, RegistrationForm, CustomPasswordResetForm, CustomSetPasswordForm

class CustomLoginView(LoginView):
    form_class = LoginForm
    template_name = 'authentication/login.html'
    redirect_authenticated_user = True
    
    def form_valid(self, form):
        remember_me = form.cleaned_data.get('remember_me')
        if not remember_me:
            # Session expires when the user closes the browser
            self.request.session.set_expiry(0)
        return super().form_valid(form)

class CustomLogoutView(LogoutView):
    """Custom logout view that redirects to login page and shows a success message."""
    next_page = reverse_lazy('login')  # Use reverse_lazy instead of string
    
    def dispatch(self, request, *args, **kwargs):
        # Add a success message before logging out
        messages.success(request, "You have been successfully logged out.")
        return super().dispatch(request, *args, **kwargs)

class RegisterView(CreateView):
    form_class = RegistrationForm
    template_name = 'authentication/register.html'
    success_url = reverse_lazy('login')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, "Your account has been created successfully. You can now log in.")
        return response
    
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('dashboard')
        return super().dispatch(request, *args, **kwargs)

class CustomPasswordResetView(PasswordResetView):
    form_class = CustomPasswordResetForm
    template_name = 'authentication/password_reset.html'
    email_template_name = 'authentication/password_reset_email.html'
    subject_template_name = 'authentication/password_reset_subject.txt'
    success_url = reverse_lazy('password_reset_done')

class CustomPasswordResetDoneView(PasswordResetDoneView):
    template_name = 'authentication/password_reset_done.html'

class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    form_class = CustomSetPasswordForm
    template_name = 'authentication/password_reset_confirm.html'
    success_url = reverse_lazy('password_reset_complete')

class CustomPasswordResetCompleteView(PasswordResetCompleteView):
    template_name = 'authentication/password_reset_complete.html'

def terms_view(request):
    return render(request, 'authentication/terms.html')

def privacy_view(request):
    return render(request, 'authentication/privacy.html')