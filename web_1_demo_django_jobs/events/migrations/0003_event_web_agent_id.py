# Generated by Django 5.1 on 2025-01-29 11:51

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0002_alter_event_event_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="event",
            name="web_agent_id",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
