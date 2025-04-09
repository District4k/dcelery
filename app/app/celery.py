import os
from celery import Celery

# Set default Django settings module for 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

# Create a Celery instance
c_app = Celery("app")

# Load configuration from Django settings, using the 'CELERY_' namespace
c_app.config_from_object("django.conf:settings", namespace="CELERY")

# Define a task to add two numbers
@c_app.task
def add_numbers():
    return

# Automatically discover tasks in all installed apps
c_app.autodiscover_tasks()
