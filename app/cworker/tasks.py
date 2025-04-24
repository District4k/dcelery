# cworker/tasks.py
from celery import shared_task
import csv
import os
import logging
from .models import GenericCsvRecord

logger = logging.getLogger(__name__)

@shared_task
def process_csv_file(file_path, csv_type="generic", csv_name=None):
    try:
        logger.info(f"Attempting to access file: {file_path}")
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            raise FileNotFoundError(f"File not found: {file_path}")

        with open(file_path, newline='', encoding='utf-8') as csvfile:
            logger.info(f"Opened file: {file_path}")
            reader = csv.reader(csvfile)
            data = [row for row in reader]  # Read all rows, including header
            if not data:
                logger.error("Empty CSV file")
                raise ValueError("CSV file is empty")

            logger.info(f"Processed CSV data: {len(data)} rows")

            # Save to database with csv_name
            record = GenericCsvRecord.objects.create(
                task_id=process_csv_file.request.id,
                csv_type=csv_type,
                name=csv_name,  # Store the user-provided name
                data=data
            )
            logger.info(f"Saved record to database: {record}")

        # Store file_path in task metadata for cleanup
        process_csv_file.update_state(state='SUCCESS', meta={'file_path': file_path})
        return {
            "record_id": record.id,
            "csv_type": csv_type,
            "csv_name": csv_name,  # Include csv_name in response
            "rows_saved": len(data),
            "error": None,
            "task_id": process_csv_file.request.id
        }

    except FileNotFoundError as e:
        logger.exception(f"FileNotFoundError in task: {str(e)}")
        process_csv_file.update_state(state='FAILURE', meta={'file_path': file_path})
        return {
            "record_id": None,
            "csv_type": csv_type,
            "csv_name": csv_name,
            "rows_saved": 0,
            "error": str(e),
            "task_id": process_csv_file.request.id
        }
    except Exception as e:
        logger.exception(f"Unexpected error in task: {str(e)}")
        process_csv_file.update_state(state='FAILURE', meta={'file_path': file_path})
        return {
            "record_id": None,
            "csv_type": csv_type,
            "csv_name": csv_name,
            "rows_saved": 0,
            "error": str(e),
            "task_id": process_csv_file.request.id
        }