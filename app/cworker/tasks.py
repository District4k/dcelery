from celery import shared_task
from .models import CSVFile
import csv
import io
from django.db import transaction
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def process_csv_file(self, csv_file_id):
    try:
        # Get the CSV file object
        obj = CSVFile.objects.get(id=csv_file_id)
        logger.info(f"Processing in-memory CSV content: {obj.name}")

        # Read the binary content from DB and convert to a text stream
        csv_text = obj.file_content.decode('utf-8')
        csvfile = io.StringIO(csv_text)

        # Parse CSV
        reader = csv.DictReader(csvfile)

        columns = reader.fieldnames if reader.fieldnames else []
        if not columns:
            raise ValidationError("CSV file has no columns.")
        obj.columns = columns
        obj.status = 'PROCESSING'
        obj.save()
        logger.info(f"Found columns: {columns}")

        rows_to_insert = []
        row_count = 0
        for row in reader:
            if not row:
                continue  # Skip empty rows
            try:
                row_count += 1
                logger.info(f"Processing row {row_count}: {row}")
                csv_row = CSVFile(
                    csv_file=obj,
                    data=row,
                    row_number=row_count
                )
                rows_to_insert.append(csv_row)
            except ValueError as e:
                logger.error(f"Invalid data in row {row}. Error: {str(e)}")
                continue

        logger.info(f"Prepared {len(rows_to_insert)} rows for insertion")

        # Bulk insert
        with transaction.atomic():
            created_rows = CSVFile.objects.bulk_create(rows_to_insert)
            logger.info(f"Successfully created {len(created_rows)} rows in database")

        # Update CSVFile status
        obj.total_rows = row_count
        obj.processed = True
        obj.status = 'COMPLETED'
        obj.save()

        # Return result
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
    except ValidationError as ve:
        logger.error(f"Validation error: {str(ve)}")
        return f"Validation error: {str(ve)}"
    except Exception as e:
        logger.error(f"Error processing CSV file {csv_file_id}: {str(e)}")
        obj.status = 'FAILED'
        obj.save()
        return f"Error: {str(e)}"
