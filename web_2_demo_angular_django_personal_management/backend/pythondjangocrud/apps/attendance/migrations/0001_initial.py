# Generated by Django 3.1.13 on 2025-01-13 00:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('employee', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Attendance',
            fields=[
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this record should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('creation_date', models.DateTimeField(auto_now_add=True, help_text='record creation date', verbose_name='creation date')),
                ('created_by', models.CharField(help_text='username that created the record', max_length=100, verbose_name='username created')),
                ('update_date', models.DateTimeField(auto_now=True, help_text='record update date', verbose_name='update date')),
                ('update_by', models.CharField(help_text='username that updated the record', max_length=100, verbose_name='username updated')),
                ('name', models.CharField(blank=True, default=None, help_text='Name of the choice.', max_length=200, null=True, verbose_name='name')),
                ('code', models.CharField(blank=True, default=None, help_text='Code.', max_length=20, null=True, verbose_name='code')),
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('date', models.DateField()),
                ('status', models.TextField()),
                ('employee_id', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='attendance', to='employee.employee')),
            ],
            options={
                'verbose_name': 'attendance',
                'verbose_name_plural': 'attendance',
                'db_table': 'attendance',
                'ordering': ['id'],
            },
        ),
    ]
