import csv
import os
from celery import shared_task
from .models import GenericCsvRecord

@shared_task
def process_csv_file(file_path, csv_type):
    with open (file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            GenericCsvRecord.objects.create(csv_type = csv_type, data = row)

    os.remove(file_path)
    return f"Processed {csv_type} file."