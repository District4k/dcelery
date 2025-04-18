from django.shortcuts import render
from django.http import JsonResponse
from cworker.models import CSVFile, CSVRow
from .serializers import CSVFileSerializer
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListCreateAPIView
from celery.result import AsyncResult
from django.conf import settings
from celery import Celery
from cworker.tasks import process_csv_file

class TaskStatusView(APIView):
    def get(self, request, task_id):
        task_result = AsyncResult(task_id)
        
        try:
            # Find the CSV file associated with this task
            csv_file = CSVFile.objects.get(task_id=task_id)
            
            response_data = {
                'task_id': task_id,
                'status': task_result.status,
                'file_status': csv_file.status,
                'progress': {
                    'total_rows': csv_file.total_rows,
                    'processed_rows': csv_file.rows.count() if hasattr(csv_file, 'rows') else 0
                }
            }
            
            # If task is complete, include the file data
            if task_result.status == 'SUCCESS':
                response_data['file_id'] = csv_file.id
                # Get all rows for this CSV file
                rows = CSVRow.objects.filter(csv_file=csv_file).order_by('row_number')
                response_data['data'] = {
                    'rows': [row.data for row in rows],
                    'columns': csv_file.columns
                }
                
            return Response(response_data)
            
        except CSVFile.DoesNotExist:
            return Response({
                'status': 'ERROR',
                'message': 'CSV file not found'
            }, status=404)


class CSVFileListCreate(ListCreateAPIView):
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