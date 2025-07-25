# Generated by Django 5.1.6 on 2025-03-04 17:11

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ContactMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True,
                 primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("email", models.EmailField(max_length=254)),
                ("subject", models.CharField(max_length=200)),
                ("message", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="Genre",
            fields=[
                ("id", models.BigAutoField(auto_created=True,
                 primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name="Movie",
            fields=[
                ("id", models.BigAutoField(auto_created=True,
                 primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=250)),
                ("desc", models.TextField()),
                ("year", models.IntegerField(validators=[django.core.validators.MinValueValidator(
                    1), django.core.validators.MaxValueValidator(9999)])),
                ("img", models.ImageField(upload_to="gallery")),
                ("director", models.CharField(blank=True, max_length=250, null=True)),
                ("cast", models.TextField(blank=True,
                 help_text="Names of actors separated by commas", null=True)),
                ("duration", models.IntegerField(blank=True,
                 help_text="Duration in minutes", null=True)),
                ("trailer_url", models.URLField(blank=True, null=True)),
                (
                    "rating",
                    models.FloatField(default=0.0, help_text="Rating between 0 and 5", validators=[
                                      django.core.validators.MinValueValidator(0.0), django.core.validators.MaxValueValidator(5.0)]),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("genres", models.ManyToManyField(blank=True,
                 related_name="movies", to="movieapp.genre")),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="Comment",
            fields=[
                ("id", models.BigAutoField(auto_created=True,
                 primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("content", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("avatar", models.ImageField(blank=True,
                 null=True, upload_to="gallery/avatars")),
                ("movie", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name="comments", to="movieapp.movie")),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="UserProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True,
                 primary_key=True, serialize=False, verbose_name="ID")),
                ("bio", models.TextField(blank=True, max_length=500, null=True)),
                ("profile_pic", models.ImageField(blank=True,
                 null=True, upload_to="gallery/profiles")),
                ("website", models.URLField(blank=True, null=True)),
                ("location", models.CharField(blank=True, max_length=100, null=True)),
                ("favorite_genres", models.ManyToManyField(blank=True,
                 related_name="user_favorites", to="movieapp.genre")),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE,
                 related_name="profile", to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
