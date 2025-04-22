from django.db import models

class CSVFile(models.Model):
    name = models.CharField(max_length=255)
    file_content = models.BinaryField()  # Store CSV content directly in DB
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

    def update_row_count(self, row_count):
        self.total_rows = row_count
        self.save()

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'cworker_csvfile'
        verbose_name = "CSV File"
        verbose_name_plural = "CSV Files"