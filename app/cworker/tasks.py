from celery import shared_task
from .models import CSVFile, CSVRow
import csv
from django.db import transaction
from django.core.exceptions import ValidationError
import logging

# Set up logging
logger = logging.getLogger(__name__)

@shared_task(bind=True)
def process_csv_file(self, csv_file_id, request=None):
    try:
        # Get the CSV file object
        obj = CSVFile.objects.get(id=csv_file_id)
        file_path = obj.file.path
        logger.info(f"Processing CSV file: {file_path}")

        # Open the CSV file
        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            # Store all columns
            columns = reader.fieldnames if reader.fieldnames else []
            logger.info(f"Found columns: {columns}")
            
            # Prepare data to batch insert
            rows_to_insert = []
            row_count = 0
            for row in reader:
                try:
                    row_count += 1
                    logger.info(f"Processing row {row_count}: {row}")
                    # Create a row for each field in the CSV
                    csv_row = CSVRow(
                        csv_file=obj,
                        data=row  # Store the entire row as JSON/dict
                    )
                    rows_to_insert.append(csv_row)
                except ValueError as e:
                    logger.error(f"Invalid data in row: {row}. Error: {str(e)}")
                    continue

            logger.info(f"Prepared {len(rows_to_insert)} rows for insertion")

            # Perform the bulk insert
            with transaction.atomic():
                created_rows = CSVRow.objects.bulk_create(rows_to_insert)
                logger.info(f"Successfully created {len(created_rows)} rows in database")

            # Prepare return data
            processed_rows = [row.data for row in rows_to_insert]
            logger.info(f"Returning {len(processed_rows)} rows of data")

            return {
                "message": f"Successfully processed {len(rows_to_insert)} rows",
                "data": {
                    "rows": processed_rows,
                    "columns": columns
                }
            }

    except CSVFile.DoesNotExist:
        logger.error(f"CSVFile with id {csv_file_id} not found")
        return "CSVFile not found"
    except Exception as e:
        logger.error(f"Error processing CSV file {csv_file_id}: {str(e)}")
        return f"Error: {str(e)}"
