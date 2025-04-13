from django.shortcuts import render
from django.http import JsonResponse
from .models import CSVFile
from .serializers import CSVFileSerializer
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from celery.result import AsyncResult
from django.conf import settings
from celery import Celery

class TaskStatusView(APIView):
    def get(self, request, task_id):
        result = AsyncResult(task_id)
        response_data = {
            'task_id': task_id,
            'status': result.status,
        }

        if result.status == 'SUCCESS':
            # Find the CSV file by ID passed via task kwargs
            task_meta = result._get_task_meta()
            csv_file_id = task_meta.get('kwargs', {}).get('csv_file_id')

            if csv_file_id:
                rows = CSVRow.objects.filter(csv_file_id=csv_file_id)
                serialized_data = CSVRowSerializer(rows, many=True).data
                response_data['data'] = serialized_data

        elif result.status == 'FAILURE':
            response_data['error'] = str(result.result)

        return Response(response_data, status=status.HTTP_200_OK)


class CSVFileListCreate(generics.ListCreateAPIView):
    queryset = CSVFile.objects.all()
    serializer_class = CSVFileSerializer

    def perform_create(self, serializer):
        serializer.save(name=self.request.FILES['file'].name)

def home(request):
    files = CSVFile.objects.all().order_by('-uploaded_at')
    return render(request, 'index.html', {'files': files})

def upload_file(request):
    if request.method == 'POST' and request.FILES.get('csv_file'):
        csv_file = request.FILES['csv_file']
        if csv_file.name.endswith('.csv'):
            file_obj = CSVFile.objects.create(
                name=csv_file.name,
                file=csv_file
            )
            return JsonResponse({'success': True, 'file_id': file_obj.id})
    return JsonResponse({'success': False})

def get_file_data(request, file_id):
    try:
        file_obj = CSVFile.objects.get(id=file_id)
        df = pd.read_csv(file_obj.file.path)
        
        data = {
            'columns': df.columns.tolist(),
            'data': {
                col: df[col].tolist() for col in df.columns
            }
        }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400) 