from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User

from .models import Book, Genre, Comment, UserProfile


class BookForm(forms.ModelForm):
    # Incluimos el campo 'img' como opcional.
    img = forms.ImageField(required=False)

    # Now required=True to make genre selection mandatory
    genre = forms.ModelChoiceField(
        queryset=Genre.objects.all(),
        required=True,
        widget=forms.Select(attrs={"class": "form-control"}),
        label="Genre",
    )
    user = forms.ModelChoiceField(
        queryset=User.objects.all(),
        widget=forms.HiddenInput(),
        required=False,
    )

    class Meta:
        model = Book
        fields = ["name", "desc", "year", "director", "duration",
                  "trailer_url", "rating", "genres", "user"]
        widgets = {
            "name": forms.TextInput(attrs={"class": "form-control", "placeholder": "Enter the book name"}),
            "desc": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 4,
                    "placeholder": "Write a synopsis or description of the book",
                }
            ),
            "year": forms.NumberInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Release year",
                    "min": 1,
                    "max": 9999,
                }
            ),
            "director": forms.TextInput(attrs={"class": "form-control", "placeholder": "Director's name"}),
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
            "genres": forms.HiddenInput(),  # Hide the ManyToMany field in the form
            "user": forms.HiddenInput(),
        }
        labels = {
            "name": "Book Title",
            "user": "User",  # Cambio de "User Id" a "User"
            "desc": "Synopsis",
            "year": "Release Year",
            "img": "Book Poster",
            "director": "Director",
            "duration": "Duration (minutes)",
            "trailer_url": "Trailer URL",
            "rating": "Rating",
            "genres": "Genres",
        }
        help_texts = {"rating": "Rating between 0 and 5 stars."}

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop("request", None)
        super().__init__(*args, **kwargs)

    def save(self, commit=True):
        book = super().save(commit=False)

        if self.request and self.request.user.is_authenticated:
            book.user = self.request.user
        elif not book.user:  # For updates, ensure we don't overwrite with None
            pass
        else:
            raise ValueError(
                "User must be provided to create or update a book.")

        book.img = self.cleaned_data["img"] or None

        if commit:
            book.save()
            genre = self.cleaned_data["genre"]
            book.genres.add(genre)
        return book


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
        labels = {
            "name": "Name",
            "content": "Comment",
        }


# Custom login form with Bootstrap styling
class CustomLoginForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(
        attrs={"class": "form-control", "placeholder": "Username"}))
    password = forms.CharField(widget=forms.PasswordInput(
        attrs={"class": "form-control", "placeholder": "Password"}))


# Custom registration form with Bootstrap styling
class SignUpForm(UserCreationForm):
    email = forms.EmailField(
        max_length=254,
        help_text="Required. Enter a valid email address.",
        widget=forms.EmailInput(
            attrs={"class": "form-control", "placeholder": "Email"}),
    )

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def __init__(self, *args, **kwargs):
        super(SignUpForm, self).__init__(*args, **kwargs)
        # Add Bootstrap classes to default fields
        self.fields["username"].widget.attrs.update(
            {"class": "form-control", "placeholder": "Username"})
        self.fields["password1"].widget.attrs.update(
            {"class": "form-control", "placeholder": "Password"})
        self.fields["password2"].widget.attrs.update(
            {"class": "form-control", "placeholder": "Confirm Password"})

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("This email is already in use.")
        return email


# Form for updating user profile
class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ["bio", "profile_pic",
                  "favorite_genres", "website", "location"]
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
            "website": forms.URLInput(attrs={"class": "form-control", "placeholder": "Your website URL"}),
            "location": forms.TextInput(attrs={"class": "form-control", "placeholder": "Your location"}),
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
            "first_name": forms.TextInput(attrs={"class": "form-control", "placeholder": "First Name"}),
            "last_name": forms.TextInput(attrs={"class": "form-control", "placeholder": "Last Name"}),
            "email": forms.EmailInput(attrs={"class": "form-control", "placeholder": "Email"}),
        }


# Formulario de contacto - Agregar al archivo forms.py existente
# Formulario de contacto
class ContactForm(forms.Form):
    name = forms.CharField(
        max_length=100,
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "Your name"}),
    )
    email = forms.EmailField(widget=forms.EmailInput(
        attrs={"class": "form-control", "placeholder": "Your email address"}))
    subject = forms.CharField(
        max_length=200,
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "What is this regarding?"}),
    )
    message = forms.CharField(widget=forms.Textarea(
        attrs={"class": "form-control", "placeholder": "Your message", "rows": 5}))
