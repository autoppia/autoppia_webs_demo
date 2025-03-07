# Generated by Django 3.1.13 on 2025-01-13 00:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_type', models.CharField(choices=[('registration', 'User Registration'), ('login', 'User Login'), ('logout', 'User Logout'), ('password_change', 'Password Change'), ('profile_update', 'Profile Update'), ('job_application', 'Job Application'), ('job_post_creation', 'Job Post Creation'), ('job_post_update', 'Job Post Update'), ('job_post_deletion', 'Job Post Deletion'), ('resume_upload', 'Resume Upload'), ('newsletter_subscription', 'Newsletter Subscription'), ('newsletter_unsubscription', 'Newsletter Unsubscription'), ('message_sent', 'Message Sent'), ('message_received', 'Message Received'), ('page_view', 'Page View'), ('search', 'Search')], max_length=50)),
                ('description', models.TextField()),
                ('data', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='events', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
