from django.utils import timezone
from django.core.exceptions import PermissionDenied
from django.db import transaction
from meal_plans.models import MealPlanFoodUsage,MealPlanDay
from food.models import FoodLogUsage

@transaction.atomic
def confirm_meal_plan_day(meal_plan_day, user):
    if meal_plan_day.meal_plan.user != user:
        raise PermissionDenied("You do not have permission to confirm this meal plan day.")
    if meal_plan_day.is_confirmed:
        raise ValueError("This meal plan day is already confirmed.")
    planned_food_usages = meal_plan_day.planned_food_usages.select_related('food_log',
                                                                           'meal_plan_meal',
                                                                           'meal_plan_meal__meal').filter(meal_plan_meal__meal_plan_day= meal_plan_day
                                                                                                          )
    for p in planned_food_usages:
        f_log= p.food_log
        qq = p.planned_quantity
        f_log.consume(qq)
        FoodLogUsage.objects.create( 
            user=meal_plan_day.meal_plan.user,
            recipe=p.meal_plan_meal.meal,
            foodlog=f_log,
            used_quantity=qq
        )

    
    # Mark the meal plan day as confirmed
    meal_plan_day.is_confirmed = True
    meal_plan_day.confirmed_at = timezone.now()

    meal_plan_day.save(update_fields=['is_confirmed', 'confirmed_at'])
    meal_plan = meal_plan_day.meal_plan

    all_confirmed = not meal_plan.days_plan.filter(
        is_confirmed=False
    ).exists()

    if all_confirmed:
        meal_plan.is_confirmed = True
        meal_plan.save(update_fields=["is_confirmed"])

    return meal_plan_day