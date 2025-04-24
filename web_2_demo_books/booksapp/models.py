from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Genre(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Book(models.Model):
    id = models.BigIntegerField(primary_key=True)
    userId = models.BigIntegerField()
    name = models.CharField(max_length=250)
    desc = models.TextField()
    year = models.IntegerField(validators=[MinValueValidator(1900), MaxValueValidator(2100)])
    img = models.ImageField(upload_to="gallery", blank=True, null=True)
    director = models.CharField(max_length=250, blank=True, null=True)
    duration = models.IntegerField(blank=True, null=True, help_text="Duration in minutes")
    trailer_url = models.URLField(blank=True, null=True)
    rating = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        help_text="Rating between 0 and 5",
    )
    price = models.FloatField(default=0)
    genres = models.ManyToManyField(Genre, blank=True, related_name="movies")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]  # Or keep ["-created_at"]

    def __str__(self):
        return f"{self.name} (ID: {self.id})"

    def get_genre_list(self):
        return ", ".join([g.name for g in self.genres.all()])


class Comment(models.Model):
    movie = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="comments")
    name = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    avatar = models.ImageField(upload_to="gallery/avatars", blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Comment by {self.name} on {self.movie.name}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(max_length=500, blank=True, null=True)
    profile_pic = models.ImageField(upload_to="gallery/profiles", blank=True, null=True)
    favorite_genres = models.ManyToManyField(Genre, blank=True, related_name="user_favorites")
    website = models.URLField(blank=True, null=True, help_text="Please include http:// or https://")
    location = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s profile"


class Cart(models.Model):
    userId = models.BigIntegerField()
    bookId = models.BigIntegerField()


# Signals para crear/guardar perfiles automáticamente


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Message from {self.name}: {self.subject[:30]}"
