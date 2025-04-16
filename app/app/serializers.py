from rest_framework import serializers
from .models import CSVFile, CSVRow

class CSVRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = CSVRow
        fields = ['row_number', 'data']

class CSVFileSerializer(serializers.ModelSerializer):
    rows = CSVRowSerializer(many=True, read_only=True)

    class Meta:
        model = CSVFile
        fields = ['id', 'name', 'file', 'uploaded_at', 'processed', 'task_id', 'columns', 'status']
        read_only_fields = ['uploaded_at', 'processed', 'task_id', 'columns', 'status']