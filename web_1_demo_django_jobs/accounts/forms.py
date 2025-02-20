from django import forms
from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm

from accounts.models import User
from events.utils import create_event

GENDER_CHOICES = (
    ('male', 'Male'),
    ('female', 'Female')
)


class EmployeeRegistrationForm(UserCreationForm):
    # gender = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple, choices=GENDER_CHOICES)

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)

        # Update field attributes
        self.fields['gender'].required = True
        self.fields['first_name'].label = "First Name"
        self.fields['last_name'].label = "Last Name"
        self.fields['password1'].label = "Password"
        self.fields['password2'].label = "Confirm Password"

        self.fields['first_name'].widget.attrs.update({'placeholder': 'Enter First Name'})
        self.fields['last_name'].widget.attrs.update({'placeholder': 'Enter Last Name'})
        self.fields['email'].widget.attrs.update({'placeholder': 'Enter Email'})
        self.fields['password1'].widget.attrs.update({'placeholder': 'Enter Password'})
        self.fields['password2'].widget.attrs.update({'placeholder': 'Confirm Password'})

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password1', 'password2', 'gender']
        error_messages = {
            'first_name': {
                'required': 'First name is required',
                'max_length': 'Name is too long'
            },
            'last_name': {
                'required': 'Last name is required',
                'max_length': 'Last Name is too long'
            },
            'gender': {
                'required': 'Gender is required'
            }
        }

    def clean_gender(self):
        gender = self.cleaned_data.get('gender')
        if not gender:
            raise forms.ValidationError("Gender is required")
        return gender

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = "employee"
        if commit:
            user.save()

            # Log registration event
            create_event(
                user=user,
                event_type='registration',
                description='New employee registered',
                data={'username': user.username},
                miner_id=self.request.headers.get("X-Miner_Id", None)
            )

            # Log profile creation event
            create_event(
                user=user,
                event_type='profile_update',
                description='Employee profile created',
                data={'username': user.username},
                miner_id=self.request.headers.get("X-Miner_Id", None)
            )
        return user


class EmployerRegistrationForm(UserCreationForm):

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)

        # Update field attributes
        self.fields['first_name'].label = "Company Name"
        self.fields['last_name'].label = "Company Address"
        self.fields['password1'].label = "Password"
        self.fields['password2'].label = "Confirm Password"

        self.fields['first_name'].widget.attrs.update({'placeholder': 'Enter Company Name'})
        self.fields['last_name'].widget.attrs.update({'placeholder': 'Enter Company Address'})
        self.fields['email'].widget.attrs.update({'placeholder': 'Enter Email'})
        self.fields['password1'].widget.attrs.update({'placeholder': 'Enter Password'})
        self.fields['password2'].widget.attrs.update({'placeholder': 'Confirm Password'})

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password1', 'password2']
        error_messages = {
            'first_name': {
                'required': 'Company name is required',
                'max_length': 'Company name is too long'
            },
            'last_name': {
                'required': 'Company address is required',
                'max_length': 'Company address is too long'
            }
        }

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = "employer"
        if commit:
            user.save()

            # Log registration event
            create_event(
                user=user,
                event_type='registration',
                description='New employer registered',
                data={'username': user.username},
                miner_id=self.request.headers.get("X-Miner_Id", None)
            )

            # Log profile creation event
            create_event(
                user=user,
                event_type='profile_update',
                description='Employer profile created',
                data={'username': user.username},
                miner_id=self.request.headers.get("X-Miner_Id", None)
            )
        return user


class UserLoginForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField(
        label="Password",
        strip=False,
        widget=forms.PasswordInput,
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.fields['email'].widget.attrs.update({'placeholder': 'Enter Email'})
        self.fields['password'].widget.attrs.update({'placeholder': 'Enter Password'})

    def clean(self, *args, **kwargs):
        email = self.cleaned_data.get("email")
        password = self.cleaned_data.get("password")

        if email and password:
            self.user = authenticate(email=email, password=password)

            if self.user is None:
                raise forms.ValidationError("User Does Not Exist.")
            if not self.user.check_password(password):
                raise forms.ValidationError("Password Does not Match.")
            if not self.user.is_active:
                raise forms.ValidationError("User is not Active.")

        return super(UserLoginForm, self).clean()

    def get_user(self):
        return self.user


class EmployeeProfileUpdateForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)
        self.fields['first_name'].widget.attrs.update({'placeholder': 'Enter First Name'})
        self.fields['last_name'].widget.attrs.update({'placeholder': 'Enter Last Name'})

    class Meta:
        model = User
        fields = ["first_name", "last_name", "gender"]

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()

            # Log profile update event
            create_event(
                user=user,
                event_type='profile_update',
                description='Employee profile updated',
                data={'username': user.username, 'first_name': user.first_name, 'last_name': user.last_name},
                miner_id=self.request.headers.get("X-Miner_Id", None)
            )
        return user
