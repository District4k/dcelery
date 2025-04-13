# tasks.py
from celery import shared_task
from .models import CSVFile, CSVRow
import csv

@shared_task(bind=True)
def process_csv_file(self, csv_file_id):
    obj = CSVFile.objects.get(id=csv_file_id)
    file_path = obj.file.path

    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            CSVRow.objects.create(
                csv_file=obj,
                name=row.get('name', ''),
                age=int(row.get('age', 0))
            )

    return "done"
