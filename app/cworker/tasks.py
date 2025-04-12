from celery import shared_task
import csv
import os
from .models import CSVFile

@shared_task
def progress_csv_file(self. csv_file_id):
    obj = CSVFile.objects.get(id=csv_file_id)
    file_path = obj.file.path
    data = []

    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data.append(row)

    return data