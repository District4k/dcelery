from django.urls import path
from .views import CSVUploadView, TaskStatusView

urlpatterns = [
    path('api/upload/', CSVUploadView.as_view(), name='csv-upload'),
    path('api/task-status/<str:task_id>/', TaskStatusView.as_view(), name='task_status'),
]