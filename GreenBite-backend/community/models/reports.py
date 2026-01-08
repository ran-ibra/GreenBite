import uuid
from django.db import models

class CommunityReport(models.Model):
    TARGET_CHOICES = [
        ('MARKET', 'Marketplace Listing'),
        ('USER', 'User'),
        # Future phases
        ('BLOG', 'Blog Post'),
        ('SHARE', 'Shared Food'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Relations
    reporter_id = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        db_column='reporter_id',
        related_name='community_reports'
    )

    # Target info
    target_type = models.CharField(max_length=20, choices=TARGET_CHOICES)
    target_id = models.UUIDField()  # Could be linked manually depending on type

    # Report info
    reason = models.CharField(max_length=100)
    details = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'community_report'
        ordering = ['-created_at']

    def __str__(self):
        return f"Report {self.id} - {self.target_type} - {self.reason}"
