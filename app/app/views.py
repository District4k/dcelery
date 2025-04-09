from django.shortcuts import render
from django.http import JsonResponse
from .models import CSVFile
import pandas as pd
import json

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