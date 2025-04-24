# yourapp/urls.py
from django.urls import path
from .views import CSVUploadView, TaskStatusView

urlpatterns = [
    path("api/upload/", CSVUploadView.as_view(), name="csv-upload"),
    path("api/task/<str:task_id>/", TaskStatusView.as_view(), name="task-status"),
]