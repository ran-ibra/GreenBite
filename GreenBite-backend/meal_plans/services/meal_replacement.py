"""
Service for replacing meals in a meal plan.
"""
import logging
from django.utils import timezone
from django.db import transaction
from meal_plans.models import MealPlanMeal
from food.models import Meal
from .inventory import InventoryService
from .recipeProvider import MealDBRecipeProvider, AIRecipeProvider

logger = logging.getLogger(__name__)


@transaction.atomic
def replace_meal(meal_plan_meal_id, user, use_ai=True):
    """
    Replace a meal in the meal plan with an alternative.
    
    Args:
        meal_plan_meal_id: ID of MealPlanMeal to replace
        user: User making the replacement
        use_ai: Whether to use AI fallback
    
    Returns:
        Updated MealPlanMeal instance
    
    Raises:
        ValueError: If meal cannot be replaced
    """
    # Get the meal plan meal
    try:
        meal_plan_meal = MealPlanMeal.objects.select_related(
            'meal_plan_day__meal_plan',
            'meal'
        ).get(
            id=meal_plan_meal_id,
            meal_plan_day__meal_plan__user=user
        )
    except MealPlanMeal.DoesNotExist:
        raise ValueError("Meal not found or you don't have permission")
    
    # Check if day is already confirmed
    if meal_plan_meal.meal_plan_day.is_confirmed:
        raise ValueError("Cannot replace meal in a confirmed day")
    
    # Get user's inventory
    inventory = InventoryService(user)
    
    if not inventory.get_available_logs().exists():
        raise ValueError("No available ingredients to generate alternative meal")
    
    # Get alternative recipes
    providers = [MealDBRecipeProvider(inventory)]
    if use_ai:
        providers.append(AIRecipeProvider(inventory))
    
    all_candidates = []
    for provider in providers:
        try:
            candidates = provider.find_recipes(limit=10)
            all_candidates.extend(candidates)
        except Exception as e:
            logger.exception(f"Provider {provider.provider_name} failed: {e}")
    
    if not all_candidates:
        raise ValueError("No alternative recipes found")
    
    # Filter out the current meal (avoid replacing with same meal)
    current_recipe = meal_plan_meal.meal.recipe if meal_plan_meal.meal else ""
    alternatives = [
        c for c in all_candidates 
        if c.title.lower() != current_recipe.lower()
    ]
    
    if not alternatives:
        raise ValueError("No different alternatives found")
    
    # Pick the best alternative (highest score)
    alternatives.sort(key=lambda x: x.score, reverse=True)
    best_alternative = alternatives[0]
    
    # Store original meal if not already stored
    if not meal_plan_meal.is_replaced and meal_plan_meal.meal:
        meal_plan_meal.original_meal = meal_plan_meal.meal
    
    # Create new meal from alternative
    new_meal = Meal.objects.create(
        user=user,
        recipe=best_alternative.title,
        ingredients=best_alternative.ingredients,
        mealTime=meal_plan_meal.meal_time,
        photo=best_alternative.thumbnail or ''
    )
    
    # Update meal plan meal
    meal_plan_meal.meal = new_meal
    meal_plan_meal.is_replaced = True
    meal_plan_meal.replaced_at = timezone.now()
    meal_plan_meal.save(update_fields=['meal', 'is_replaced', 'replaced_at', 'original_meal'])
    
    logger.info(
        f"Replaced meal {meal_plan_meal.id}: "
        f"{current_recipe} → {best_alternative.title}"
    )
    
    return meal_plan_meal