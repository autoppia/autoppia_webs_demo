from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from .models import Movie, Genre, Comment, UserProfile


class MovieForm(forms.ModelForm):
    # Incluimos el campo 'img' como opcional.
    img = forms.ImageField(required=False)

    # Now required=True to make genre selection mandatory
    genres = forms.ModelChoiceField(
        queryset=Genre.objects.all(),
        required=True,
        widget=forms.Select(attrs={"class": "form-control"}),
        label="Genre",
    )

    class Meta:
        model = Movie
        # Se incluye 'img' en la lista de campos para que se renderice en el formulario,
        # pero luego lo ignoramos al guardar.
        fields = [
            "name",
            "desc",
            "year",
            "img",
            "director",
            "cast",
            "duration",
            "trailer_url",
            "rating",
            "genres",
        ]
        widgets = {
            "name": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Enter the movie name"}
            ),
            "desc": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 4,
                    "placeholder": "Write a synopsis or description of the movie",
                }
            ),
            "year": forms.NumberInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Release year",
                    "min": 1900,
                    "max": 2025,
                }
            ),
            "director": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Director's name"}
            ),
            "cast": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 2,
                    "placeholder": "Main actors separated by commas",
                }
            ),
            "duration": forms.NumberInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Duration in minutes",
                    "min": 1,
                }
            ),
            "trailer_url": forms.URLInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "https://www.youtube.com/watch?v=...",
                }
            ),
            "rating": forms.NumberInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Rating (0-5)",
                    "step": "0.1",
                    "min": 0,
                    "max": 5,
                }
            ),
        }
        labels = {
            "name": "Movie Title",
            "desc": "Synopsis",
            "year": "Release Year",
            "img": "Movie Poster",
            "director": "Director",
            "cast": "Cast",
            "duration": "Duration (minutes)",
            "trailer_url": "Trailer URL",
            "rating": "Rating",
            "genres": "Genre",
        }
        help_texts = {"rating": "Rating between 0 and 5 stars."}

    def save(self, commit=True):
        # Primero obtenemos la instancia sin guardar.
        instance = super().save(commit=False)
        # Ignoramos el archivo subido (si es que lo hubiera) y dejamos el campo en None.
        instance.img = None
        if commit:
            instance.save()
            self.save_m2m()
        return instance


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ["name", "content"]
        widgets = {
            "name": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Your name",
                    "required": True,
                }
            ),
            "content": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 3,
                    "placeholder": "Write a comment...",
                    "required": True,
                }
            ),
        }
        labels = {"name": "Name", "content": "Comment"}


# Custom login form with Bootstrap styling
class CustomLoginForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "Username"}
        )
    )
    password = forms.CharField(
        widget=forms.PasswordInput(
            attrs={"class": "form-control", "placeholder": "Password"}
        )
    )


# Custom registration form with Bootstrap styling
class SignUpForm(UserCreationForm):
    email = forms.EmailField(
        max_length=254,
        help_text="Required. Enter a valid email address.",
        widget=forms.EmailInput(
            attrs={"class": "form-control", "placeholder": "Email"}
        ),
    )

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def __init__(self, *args, **kwargs):
        super(SignUpForm, self).__init__(*args, **kwargs)
        # Add Bootstrap classes to default fields
        self.fields["username"].widget.attrs.update(
            {"class": "form-control", "placeholder": "Username"}
        )
        self.fields["password1"].widget.attrs.update(
            {"class": "form-control", "placeholder": "Password"}
        )
        self.fields["password2"].widget.attrs.update(
            {"class": "form-control", "placeholder": "Confirm Password"}
        )

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("This email is already in use.")
        return email


# Form for updating user profile
class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ["bio", "profile_pic", "favorite_genres", "website", "location"]
        widgets = {
            "bio": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 3,
                    "placeholder": "Tell us about yourself",
                }
            ),
            "profile_pic": forms.FileInput(attrs={"class": "custom-file-input"}),
            "favorite_genres": forms.Select(attrs={"class": "form-control"}),
            "website": forms.URLInput(
                attrs={"class": "form-control", "placeholder": "Your website URL"}
            ),
            "location": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Your location"}
            ),
        }
        labels = {
            "bio": "About Me",
            "profile_pic": "Profile Picture",
            "favorite_genres": "Favorite Genres",
            "website": "Website",
            "location": "Location",
        }


# Form for updating basic user information
class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email"]
        widgets = {
            "first_name": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "First Name"}
            ),
            "last_name": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Last Name"}
            ),
            "email": forms.EmailInput(
                attrs={"class": "form-control", "placeholder": "Email"}
            ),
        }


# Formulario de contacto - Agregar al archivo forms.py existente
# Formulario de contacto
class ContactForm(forms.Form):
    name = forms.CharField(
        max_length=100,
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "Your name"}
        ),
    )
    email = forms.EmailField(
        widget=forms.EmailInput(
            attrs={"class": "form-control", "placeholder": "Your email address"}
        )
    )
    subject = forms.CharField(
        max_length=200,
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "What is this regarding?"}
        ),
    )
    message = forms.CharField(
        widget=forms.Textarea(
            attrs={"class": "form-control", "placeholder": "Your message", "rows": 5}
        )
    )
