from django.urls import path 
from .views import MealPlanDetailAPIView, MealPlanGeneratorView, MealPlanDeleteAPIView , MealPlanDayConfirmAPIView, MealPlanMealSkipAPIView
app_name = 'meal_plans'
urlpatterns = [
    path('generate/', MealPlanGeneratorView.as_view(), name='meal_plan_generator'),
    path('<int:pk>/', MealPlanDetailAPIView.as_view(), name='meal_plan_detail'), #meal plan details you can confirm meal or skip ones 
    path('<int:pk>/confirm-day/', MealPlanDayConfirmAPIView.as_view(), name='confirm_meal_plan_day'),
    path('<int:pk>/skip-meal/', MealPlanMealSkipAPIView.as_view(), name='skip_meal_plan'),
    path('<int:pk>/delete/', MealPlanDeleteAPIView.as_view(), name='delete_meal_plan'),

]
