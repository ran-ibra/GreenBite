from django.shortcuts import render
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from .models import SubscriptionPlan
from .serializers import SubscriptionPlanSerializer
# Create your views here.

@api_view(["GET"])
@permission_classes([AllowAny])
def subscription_plan_list(request):
  plans = SubscriptionPlan.objects.filter(is_active=True).order_by('price')
  serializer = SubscriptionPlanSerializer(plans, many=True)
  return Response(serializer.data, status=status.HTTP_200_OK)
  