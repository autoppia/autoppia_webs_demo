from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.
class Genre(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class Movie(models.Model):
    name = models.CharField(max_length=250)
    desc = models.TextField()
    year = models.IntegerField(validators=[MinValueValidator(1900), MaxValueValidator(2100)])
    img = models.ImageField(upload_to='gallery')
    director = models.CharField(max_length=250, blank=True, null=True)
    cast = models.TextField(blank=True, null=True, help_text="Nombres de los actores separados por comas")
    duration = models.IntegerField(blank=True, null=True, help_text="Duración en minutos")
    trailer_url = models.URLField(blank=True, null=True)
    rating = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        help_text="Calificación entre 0 y 5"
    )
    genres = models.ManyToManyField(Genre, blank=True, related_name="movies")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def get_genre_list(self):
        return ", ".join([g.name for g in self.genres.all()])
    
    def get_cast_list(self):
        if not self.cast:
            return []
        return [actor.strip() for actor in self.cast.split(',')]