# Generated by Django 5.1.6 on 2025-03-07 13:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0002_alter_event_event_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='event',
            name='search_query',
        ),
        migrations.AlterField(
            model_name='event',
            name='event_name',
            field=models.CharField(choices=[('FILM_DETAIL', 'Film Detail View'), ('SEARCH_FILM', 'Search Film'), ('ADD_FILM', 'Add Film'), ('EDIT_FILM', 'Edit Film'), ('DELETE_FILM', 'Delete Film'), ('ADD_COMMENT', 'Add Comment'), ('REGISTRATION', 'User Registration'), ('LOGIN', 'User Login'), ('LOGOUT', 'User Logout'), ('CONTACT', 'Contact Message'), ('EDIT_USER', 'Edit User Profile'), ('FILTER_FILM', 'Filter Films')], max_length=50),
        ),
    ]
