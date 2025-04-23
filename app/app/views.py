from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework import status
from cworker.tasks import process_csv_file
import tempfile
from celery.result import AsyncResult
from django.conf import settings

class CSVUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, *args,**kwargs):
        uploaded_file = request.FILES.get('file')
        csv_type = request.data.get('csv_type', 'generic')
        if not uploaded_file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
            for chunk in uploaded_file.chunks():
                tmp.write(chunk)
                tmp_path = tmp.name
                task = process_csv_file.delay(tmp_path, csv_type)
                return Response({'task_id': task.id},
                                status=status.HTTP_202_ACCEPTED)
            
class TaskStatusView(APIView):
    def get(self, request, task_id):
        result = AsyncResult(task_id)
        return Response({'task_id': task_id, 'status': result.status})