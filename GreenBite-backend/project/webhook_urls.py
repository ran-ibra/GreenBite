from django.urls import path
from payments.views import paymob_webhook

urlpatterns = [
    path("webhook/", paymob_webhook),
]
