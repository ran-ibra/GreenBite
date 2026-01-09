from django.urls import path
from .views import start_subscription_payment, paymob_webhook

urlpatterns = [
    path("start-subscription/", start_subscription_payment),
    path("webhook/", paymob_webhook),
]