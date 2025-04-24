from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework import status
from cworker.tasks import process_csv_file
import os
import uuid
import logging
from celery.result import AsyncResult
from cworker.models import GenericCsvRecord

logger = logging.getLogger(__name__)

UPLOAD_DIR = '/app/uploads/'

class CSVUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get("file")
        csv_type = request.data.get("csv_type", "generic")
        csv_name = request.data.get("csv_name")

        if not uploaded_file:
            logger.error("No file provided in request.")
            return Response(
                {"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST
            )

        if not uploaded_file.name.endswith(".csv"):
            logger.error(f"Invalid file type: {uploaded_file.name}")
            return Response(
                {"error": "Invalid file type. Please upload a CSV file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not csv_name:
            logger.error("No CSV name provided.")
            return Response(
                {"error": "Please provide a name for the CSV."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            logger.info(f"Created upload directory: {UPLOAD_DIR}")

            file_name = f"{uuid.uuid4()}.csv"
            file_path = os.path.join(UPLOAD_DIR, file_name)

            with open(file_path, 'wb') as f:
                for chunk in uploaded_file.chunks():
                    f.write(chunk)
            logger.info(f"Saved file to: {file_path}")

            if not os.path.exists(file_path):
                logger.error(f"File not found after saving: {file_path}")
                return Response(
                    {"error": "Failed to save file."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            task = process_csv_file.delay(file_path, csv_type, csv_name)
            logger.info(f"Started Celery task: {task.id}")
            return Response({"task_id": task.id}, status=status.HTTP_202_ACCEPTED)

        except Exception as e:
            logger.exception(f"Error processing file: {str(e)}")
            if 'file_path' in locals() and os.path.exists(file_path):
                os.unlink(file_path)
                logger.info(f"Cleaned up file: {file_path}")
            return Response(
                {"error": f"Error processing file: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class TaskStatusView(APIView):
    def get(self, request, task_id):
        try:
            result = AsyncResult(task_id)
            response_data = {"task_id": task_id, "status": result.status}

            if result.ready():
                try:
                    if result.status == 'SUCCESS':
                        task_result = result.get(propagate=False)
                        response_data["result"] = task_result
                        record = GenericCsvRecord.objects.filter(task_id=task_id).first()
                        response_data["record"] = {
                            "id": record.id,
                            "csv_type": record.csv_type,
                            "name": record.name,
                            "rows": len(record.data) if record else 0,
                            "uploaded_at": record.uploaded_at.isoformat() if record else None
                        } if record else None
                        response_data["error"] = None
                    elif result.status == 'FAILURE':
                        error = result.get(propagate=False)
                        response_data["result"] = None
                        response_data["record"] = None
                        response_data["error"] = str(error) if error else "Unknown task failure"
                    else:
                        response_data["result"] = None
                        response_data["record"] = None
                        response_data["error"] = None
                except Exception as e:
                    logger.exception(f"Error retrieving task result for {task_id}: {str(e)}")
                    response_data["error"] = f"Failed to retrieve task result: {str(e)}"
                    response_data["result"] = None
                    response_data["record"] = None

            logger.info(f"Task status for {task_id}: {response_data}")
            return Response(response_data)

        except Exception as e:
            logger.exception(f"Error retrieving task status for {task_id}: {str(e)}")
            return Response(
                {"error": f"Error retrieving task status: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request, task_id):
        try:
            result = AsyncResult(task_id)
            if result.ready():
                file_path = result.info.get('file_path') if result.info else None
                if file_path and os.path.exists(file_path):
                    os.unlink(file_path)
                    logger.info(f"Cleaned up file: {file_path}")
                return Response({"status": "cleanup completed"})
            return Response({"status": "task not ready"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error during cleanup for {task_id}: {str(e)}")
            return Response(
                {"error": f"Error during cleanup: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )