from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

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
    cast = models.TextField(blank=True, null=True, help_text="Names of actors separated by commas")
    duration = models.IntegerField(blank=True, null=True, help_text="Duration in minutes")
    trailer_url = models.URLField(blank=True, null=True)
    rating = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        help_text="Rating between 0 and 5"
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

class Comment(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='comments')
    name = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    avatar = models.ImageField(upload_to='gallery/avatars', blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.name} on {self.movie.name}"