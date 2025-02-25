from django import forms
from .models import Movie, Genre, Comment

class MovieForm(forms.ModelForm):
    class Meta:
        model = Movie
        fields = ['name', 'desc', 'year', 'img', 'director', 'cast', 'duration', 'trailer_url', 'rating', 'genres']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter the movie name'}),
            'desc': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Write a synopsis or description of the movie'}),
            'year': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Release year', 'min': 1900, 'max': 2025}),
            'director': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Director\'s name'}),
            'cast': forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Main actors separated by commas'}),
            'duration': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Duration in minutes', 'min': 1}),
            'trailer_url': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://www.youtube.com/watch?v=...'}),
            'rating': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Rating (0-5)', 'step': '0.1', 'min': 0, 'max': 5}),
            'genres': forms.SelectMultiple(attrs={'class': 'form-control'}),
        }
        labels = {
            'name': 'Movie Title',
            'desc': 'Synopsis',
            'year': 'Release Year',
            'img': 'Movie Poster',
            'director': 'Director',
            'cast': 'Cast',
            'duration': 'Duration (minutes)',
            'trailer_url': 'Trailer URL',
            'rating': 'Rating',
            'genres': 'Genres',
        }
        help_texts = {
            'genres': 'Hold Ctrl/Cmd key to select multiple genres.',
            'rating': 'Rating between 0 and 5 stars.',
        }

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['name', 'content']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control', 
                'placeholder': 'Your name',
                'required': True
            }),
            'content': forms.Textarea(attrs={
                'class': 'form-control', 
                'rows': 3, 
                'placeholder': 'Write a comment...',
                'required': True
            }),
        }
        labels = {
            'name': 'Name',
            'content': 'Comment',
        }