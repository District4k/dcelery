# yourapp/models.py
from django.db import models

class GenericCsvRecord(models.Model):
    task_id = models.CharField(max_length=36, null=True, blank=True)
    csv_type = models.CharField(max_length=100)
    name = models.CharField(max_length=255, null=True, blank=True)
    data = models.JSONField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name or self.csv_type}-{self.uploaded_at.strftime('%Y-%m-%d %H:%M:%S')}"

    class Meta:
        indexes = [
            models.Index(fields=['task_id']),
        ]