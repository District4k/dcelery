from django.db import models

class CSVFile(models.Model):
    file = models.FileField(upload_to='csv_uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    task_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.file.name

class CSVFile(models.Model):
    file = models.FileField(upload_to='csv/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class CSVRow(models.Model):
    csv_file = models.ForeignKey(CSVFile, on_delete=models.CASCADE, related_name='rows')
    name = models.CharField(max_length=100)
    age = models.IntegerField()