from django.db import models

class CSVFile(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='csv_uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    task_id = models.CharField(max_length=255, blank=True, null=True)
    columns = models.JSONField(default=list)
    total_rows = models.IntegerField(default=0)
    file_size = models.IntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('PROCESSING', 'Processing'),
            ('COMPLETED', 'Completed'),
            ('FAILED', 'Failed')
        ],
        default='PENDING'
    )

    class Meta:
        db_table = 'cworker_csvfile'  # Explicitly set the table name

    def __str__(self):
        return self.name

class CSVRow(models.Model):
    csv_file = models.ForeignKey(CSVFile, on_delete=models.CASCADE, related_name='rows')
    data = models.JSONField()
    row_number = models.IntegerField()

    class Meta:
        db_table = 'cworker_csvrow'  # Explicitly set the table name
        ordering = ['row_number']

    def __str__(self):
        return f"Row {self.row_number} of {self.csv_file.name}" 