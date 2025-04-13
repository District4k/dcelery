from rest_framework import serializers
from .models import CSVRow

class CSVFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CSVRow
        fields = ['id', 'name', 'age']