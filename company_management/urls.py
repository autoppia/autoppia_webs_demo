from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from accounts.views import CustomLogoutView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', RedirectView.as_view(url='dashboard/', permanent=True)),
    path('auth/', include('accounts.urls')),
    path('accounts/logout/', CustomLogoutView.as_view(next_page='login'), name='logout'),
    path('dashboard/', include('dashboard.urls')),
    path('clients/', include('clients.urls')),
    path('contacts/', include('contacts.urls')),
    path('projects/', include('projects.urls')),
    path('tasks/', include('tasks.urls')),
    path('documents/', include('documents.urls')),
    path('chat/', include('chat.urls')),
    path('calendar/', include('calendar_app.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)