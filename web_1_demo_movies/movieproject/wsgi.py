"""
WSGI config for movieproject project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/wsgi/
"""

import os
import sys
from loguru import logger

# Minimal Loguru configuration so messages appear in container logs
logger.remove()
log_level = os.environ.get("LOG_LEVEL", "INFO")
logger.add(sys.stderr, level=log_level, format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}")

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "movieproject.settings")

application = get_wsgi_application()
