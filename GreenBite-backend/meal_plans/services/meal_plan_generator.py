from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.db.models import Q
from food.models import FoodLogSys
from recipes.models import MealDBRecipe
from meal_plans.models import (
    MealPlan,
    MealPlanDay,
    MealPlanMeal,
)
from .ai_fallback import generate_ai_recipes
from project.utils.normalize import normalize_ingredient_name
from food.models import Meal, MealTime
from food.models import MealTime
def get_available_food_logs(user):
    return FoodLogSys.objects.filter(
        user=user,
        is_consumed=False,
        expiry_date__gte=timezone.now().date(),
        quantity__gt=0
    ).order_by('expiry_date')
def map_food_logs( food_logs):
    logged= {}
    for log in food_logs:
        key = normalize_ingredient_name(log.name)
        logged.setdefault(key,Decimal('0')
                          )
        logged[key] += log.quantity
    return logged
def score_recipe(recipe, food_log_map):
    matched = 0
    miss = 0
    for ingredient in recipe.ingredients_norm:
        norm_ingredient = normalize_ingredient_name(ingredient)
        if norm_ingredient in food_log_map:
            matched += 1
        
        else :
            miss += 1
            
    score = matched*3 - miss
    return score
def expiry_weighted_score(recipe_ingredients, inventory_logs):
    score = 0
    for log in inventory_logs:
        if normalize_ingredient_name(log.name) in recipe_ingredients:
            days_left = (log.expiry_date - timezone.now().date()).days
            score += max(0, 10 - days_left)
    return score
# i need to combine two scorse
def find_best_recipes(food_log_map, limit=30):
    inventory_ings = list(food_log_map.keys())

    if not inventory_ings:
        return []

    # 🔥 THIS uses your GIN index
    candidate_recipes = MealDBRecipe.objects.filter(
        ingredients__overlap=inventory_ings
    ).only("id", "title", "ingredients_norm", "instructions", "thumbnail")

    scored = []

    for recipe in candidate_recipes:
        recipe_ings = [
            normalize_ingredient_name(i)
            for i in recipe.ingredients_norm
        ]

        matched = sum(1 for i in recipe_ings if i in food_log_map)
        missing = len(recipe_ings) - matched

        score = matched * 2 - missing

        if score > 0:
            scored.append((score, recipe))

    scored.sort(reverse=True, key=lambda x: x[0])
    return [r for _, r in scored[:limit]]


@transaction.atomic
def generate_meal_plan(user, start_date, num_days, meals_per_day):
    food_logs = get_available_food_logs(user)
    if not food_logs.exists():
        raise ValueError("No available food logs to base the meal plan on.")
    food_log_map = map_food_logs(food_logs)

    total_meals = num_days * meals_per_day
    best_recipes = find_best_recipes(food_log_map, total_meals)
    if len(best_recipes) < total_meals:
        aii= total_meals - len(best_recipes)
        ai_recipes = generate_ai_recipes(food_log_map, aii)
        best_recipes.extend(ai_recipes)
        
    if not best_recipes:
        raise ValueError("No suitable recipes found to generate the meal plan.")
    # if len(best_recipes) < total_meals:
    #     raise ValueError("Not enough suitable recipes found to generate the meal plan.")

    meal_plan = MealPlan.objects.create(
    user=user,
    start_date=start_date,
    days=num_days
    )
    recipe_index = 0
    for day_offset in range(num_days):
        plan_day = MealPlanDay.objects.create(
            meal_plan=meal_plan,
            date=start_date + timedelta(days=day_offset)
        )
        for meal_time in MealTime.values[:meals_per_day]:
            if recipe_index >= len(best_recipes):
                break
            recipe = best_recipes[recipe_index]
            meal = Meal.objects.create(
                user=user,
                recipe=recipe.title,
                ingredients=recipe.ingredients,
                mealTime=meal_time,
                photo=recipe.thumbnail
            )

            MealPlanMeal.objects.create(
                meal_plan_day=plan_day,
                meal_time=meal_time,
                meal=meal
            )

            
            recipe_index += 1

    return meal_plan