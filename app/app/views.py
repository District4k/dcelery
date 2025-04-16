from django.shortcuts import render
from django.http import JsonResponse
from .models import CSVFile, CSVRow
from .serializers import CSVFileSerializer
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from celery.result import AsyncResult
from django.conf import settings
from celery import Celery
from cworker.tasks import process_csv_file

class TaskStatusView(APIView):
    def get(self, request, task_id):
        result = AsyncResult(task_id)
        response_data = {
            'task_id': task_id,
            'status': result.status,
        }

        if result.status == 'SUCCESS':
            task_meta = result._get_task_meta()
            csv_file_id = task_meta.get('kwargs', {}).get('csv_file_id')

            if csv_file_id:
                csv_file = CSVFile.objects.get(id=csv_file_id)
                rows = csv_file.rows.all()  # Using related_name
                response_data['data'] = {
                    'columns': csv_file.columns,
                    'rows': [row.data for row in rows]
                }

        elif result.status == 'FAILURE':
            response_data['error'] = str(result.result)

        return Response(response_data, status=status.HTTP_200_OK)


class CSVFileListCreate(generics.ListCreateAPIView):
    queryset = CSVFile.objects.all()
    serializer_class = CSVFileSerializer

    def create(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        csv_file = request.FILES['file']
        if not csv_file.name.endswith('.csv'):
            return Response({'error': 'File must be a CSV'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Read CSV to get columns
            df = pd.read_csv(csv_file)
            columns = df.columns.tolist()
            
            # Create CSVFile instance
            file_obj = CSVFile.objects.create(
                name=csv_file.name,
                file=csv_file,
                columns=columns,
                file_size=csv_file.size,
                status='PENDING'
            )
            
            # Start the processing task
            task = process_csv_file.delay(file_obj.id)
            file_obj.task_id = task.id
            file_obj.save()
            
            serializer = self.get_serializer(file_obj)
            return Response({
                'success': True,
                'file_id': file_obj.id,
                'task_id': task.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

def home(request):
    files = CSVFile.objects.all().order_by('-uploaded_at')
    return render(request, 'index.html', {'files': files})

def upload_file(request):
    if request.method == 'POST' and request.FILES.get('file'):
        csv_file = request.FILES['file']
        if csv_file.name.endswith('.csv'):
            try:
                # Read CSV to get columns
                df = pd.read_csv(csv_file)
                columns = df.columns.tolist()
                
                file_obj = CSVFile.objects.create(
                    name=csv_file.name,
                    file=csv_file,
                    columns=columns,
                    file_size=csv_file.size,
                    status='PENDING'
                )
                
                # Start the processing task
                task = process_csv_file.delay(file_obj.id)
                file_obj.task_id = task.id
                file_obj.save()
                
                return JsonResponse({
                    'success': True, 
                    'file_id': file_obj.id,
                    'task_id': task.id
                })
            except Exception as e:
                return JsonResponse({
                    'success': False,
                    'error': str(e)
                }, status=400)
        else:
            return JsonResponse({
                'success': False,
                'error': 'File must be a CSV'
            }, status=400)
    return JsonResponse({
        'success': False,
        'error': 'No file provided'
    }, status=400)

def get_file_data(request, file_id):
    try:
        file_obj = CSVFile.objects.get(id=file_id)
        rows = file_obj.rows.all()
        
        data = {
            'columns': file_obj.columns,
            'data': [row.data for row in rows]
        }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400) 