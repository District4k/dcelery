from django.db import models

class GenericCsvRecord(models.Model):
    csv_type = models.CharField(max_length=100)
    data = models.JSONField()
    uploaded_at = models.DataTimeField(auto_now_add=True)

    def __srt__(self):
        return f"{self.csv_type}-{self.uploaded_at.strftime('%Y-%m-%d %H:%M:%S')}"