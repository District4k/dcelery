from django.db import models

class CSVFile(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='csv_uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    task_id = models.CharField(max_length=255, blank=True, null=True)
    columns = models.JSONField(default=list)  # Store column names
    total_rows = models.IntegerField(default=0)
    file_size = models.IntegerField(default=0)  # in bytes
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

    def __str__(self):
        return self.name

class CSVRow(models.Model):
    csv_file = models.ForeignKey(CSVFile, on_delete=models.CASCADE, related_name='rows')
    data = models.JSONField()  # Store row data as JSON
    row_number = models.IntegerField()  # Keep track of row order

    class Meta:
        ordering = ['row_number']  # Ensure rows stay in order

    def __str__(self):
        return f"Row {self.row_number} of {self.csv_file.name}"