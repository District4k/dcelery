from rest_framework import serializers
from .models import GenericsCSVRecord

class GenericCSVRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenericsCSVRecord
        fields = '__all__'