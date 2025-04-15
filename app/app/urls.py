from django.urls import path
from .views import CSVFileListCreate, TaskStatusView, upload_file, get_file_data

urlpatterns = [
    path('api/csv/', CSVFileListCreate.as_view(), name='csv-list-create'),
    path('api/task-status/<str:task_id>/', TaskStatusView.as_view(), name='task-status'),
    path('upload/', upload_file, name='upload-file'),
    path('data/<int:file_id>/', get_file_data, name='get-file-data'),
]
