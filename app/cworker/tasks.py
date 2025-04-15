from celery import shared_task
from .models import CSVFile, CSVRow
import csv
from django.db import transaction
from django.core.exceptions import ValidationError
import logging

# Set up logging
logger = logging.getLogger(__name__)

@shared_task(bind=True)
def process_csv_file(self, csv_file_id):
    try:
        # Get the CSV file object
        obj = CSVFile.objects.get(id=csv_file_id)
        file_path = obj.file.path

        # Open the CSV file
        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            # Prepare data to batch insert
            rows_to_insert = []
            for row in reader:
                try:
                    name = row.get('name', '')
                    age = int(row.get('age', 0))
                    rows_to_insert.append(CSVRow(
                        csv_file=obj,
                        name=name,
                        age=age
                    ))
                except ValueError as e:
                    # Handle any invalid data (e.g., age being non-integer)
                    logger.error(f"Invalid data in row: {row}. Error: {str(e)}")
                    continue

            # Perform the bulk insert
            with transaction.atomic():
                CSVRow.objects.bulk_create(rows_to_insert)

        return f"Successfully processed {len(rows_to_insert)} rows"

    except CSVFile.DoesNotExist:
        logger.error(f"CSVFile with id {csv_file_id} not found")
        return "CSVFile not found"
    except Exception as e:
        logger.error(f"Error processing CSV file {csv_file_id}: {str(e)}")
        return f"Error: {str(e)}"
