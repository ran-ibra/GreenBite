from django.urls import path
from .views import subscription_plan_list

urlpatterns = [
    path("subscription-plans/", subscription_plan_list, name="subscription-plan-list"),
]