import os
from celery import Celery

# Set default Django settings module for 'celery' program
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

# Create Celery application instance
app = Celery('app')

# Load task settings from Django settings with CELERY_ prefix
app.config_from_object('django.conf:settings', namespace='CELERY')

# Autodiscover tasks from installed apps
app.autodiscover_tasks()

# Optional: test task
@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
