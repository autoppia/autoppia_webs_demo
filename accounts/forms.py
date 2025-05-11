from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import UserProfile

class LoginEmailForm(forms.Form):
    """Form for the first step of login (email only)"""
    email = forms.EmailField(
        widget=forms.EmailInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Email',
                'id': 'email'
            }
        )
    )

class LoginPasswordForm(forms.Form):
    """Form for the second step of login (password only)"""
    password = forms.CharField(
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Password',
                'id': 'password'
            }
        )
    )
    keep_signed_in = forms.BooleanField(required=False)

class RegistrationForm(forms.ModelForm):
    """Form for user registration with combined name field"""
    name = forms.CharField(
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'First and last name',
                'id': 'name'
            }
        )
    )
    email = forms.EmailField(
        widget=forms.EmailInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Email',
                'id': 'email'
            }
        )
    )
    password = forms.CharField(
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'At least 6 characters',
                'id': 'password'
            }
        )
    )
    confirm_password = forms.CharField(
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Re-enter password',
                'id': 'confirm_password'
            }
        )
    )

    class Meta:
        model = User
        fields = ['name', 'email', 'password']

    def clean(self):
        cleaned_data = super(RegistrationForm, self).clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')

        if password and confirm_password and password != confirm_password:
            raise forms.ValidationError("Passwords do not match!")
        
        if password and len(password) < 6:
            raise forms.ValidationError("Password must be at least 6 characters long")
        
        return cleaned_data
    
    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Email already exists!")
        return email

class UserProfileForm(forms.ModelForm):
    """Form for updating user profile"""
    profile_picture = forms.ImageField(
        required=False,
        widget=forms.FileInput(
            attrs={
                'class': 'form-control-file',
                'id': 'profile_picture'
            }
        )
    )
    phone = forms.CharField(
        required=False,
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Phone Number',
                'id': 'phone'
            }
        )
    )
    address = forms.CharField(
        required=False,
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Address',
                'id': 'address'
            }
        )
    )
    city = forms.CharField(
        required=False,
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'City',
                'id': 'city'
            }
        )
    )
    state = forms.CharField(
        required=False,
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'State',
                'id': 'state'
            }
        )
    )
    country = forms.CharField(
        required=False,
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Country',
                'id': 'country'
            }
        )
    )
    zipcode = forms.CharField(
        required=False,
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Zip Code',
                'id': 'zipcode'
            }
        )
    )

    class Meta:
        model = UserProfile
        fields = ['profile_picture', 'phone', 'address', 'city', 'state', 'country', 'zipcode']

class UserForm(forms.ModelForm):
    """Form for updating user information"""
    first_name = forms.CharField(
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'First Name',
                'id': 'first_name'
            }
        )
    )
    last_name = forms.CharField(
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Last Name',
                'id': 'last_name'
            }
        )
    )

    class Meta:
        model = User
        fields = ['first_name', 'last_name']