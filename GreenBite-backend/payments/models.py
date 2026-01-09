from django.db import models
from django.conf import settings

# Create your models here.
class Payment(models.Model):
  PENDING = 'pending'
  SUCCESS = 'success'
  FAILED = 'failed'

  STATUS_CHOICES = [
      (PENDING, 'Pending'),
      (SUCCESS, 'Success'),
      (FAILED, 'Failed'),
  ]

  user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  subscription_plan = models.ForeignKey("subscriptions.SubscriptionPlan", on_delete=models.CASCADE)
  amount = models.PositiveIntegerField()
  paymob_intention_id = models.CharField(max_length=255, blank=True, null=True)
  paymob_order_id = models.CharField(max_length=255, blank=True, null=True)
  client_secret = models.CharField(max_length=255, blank=True, null=True)

  status = models.CharField(max_length=20,choices=STATUS_CHOICES, default=PENDING)

  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"{self.user} - {self.amount} - {self.status}"