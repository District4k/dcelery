from rest_framework import serializers
from cworker.models import CSVFile

class CSVFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = CSVFile
        fields = ['id', 'name', 'file', 'uploaded_at', 'processed', 'task_id', 'columns', 'status', 'total_rows', 'file_size']
        read_only_fields = ['uploaded_at', 'processed', 'task_id', 'columns', 'status', 'total_rows', 'file_size']