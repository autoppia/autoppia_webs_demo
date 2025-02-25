from django import forms
from .models import Movie, Genre

class MovieForm(forms.ModelForm):
    class Meta:
        model = Movie
        fields = ['name', 'desc', 'year', 'img', 'director', 'cast', 'duration', 'trailer_url', 'rating', 'genres']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Introduce el nombre de la película'}),
            'desc': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Escribe una sinopsis o descripción de la película'}),
            'year': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Año de lanzamiento', 'min': 1900, 'max': 2025}),
            'director': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nombre del director'}),
            'cast': forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Actores principales separados por comas'}),
            'duration': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Duración en minutos', 'min': 1}),
            'trailer_url': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://www.youtube.com/watch?v=...'}),
            'rating': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Calificación (0-5)', 'step': '0.1', 'min': 0, 'max': 5}),
            'genres': forms.SelectMultiple(attrs={'class': 'form-control'}),
        }
        labels = {
            'name': 'Nombre de la Película',
            'desc': 'Descripción',
            'year': 'Año',
            'img': 'Póster de la Película',
            'director': 'Director',
            'cast': 'Reparto',
            'duration': 'Duración (minutos)',
            'trailer_url': 'URL del Trailer',
            'rating': 'Calificación',
            'genres': 'Géneros',
        }
        help_texts = {
            'genres': 'Mantén presionada la tecla Ctrl para seleccionar múltiples géneros.',
            'rating': 'Calificación entre 0 y 5 estrellas.',
        }