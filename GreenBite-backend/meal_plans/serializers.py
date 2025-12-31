from rest_framework import serializers

from meal_plans.models import MealPlan, MealPlanDay, MealPlanMeal, MealPlanFoodUsage


class MealPlanFoodUsageNestedSerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(source="food_log.name", read_only=True)

    class Meta:
        model = MealPlanFoodUsage
        fields = ["id", "food_log", "food_name", "planned_quantity"]


class MealPlanMealNestedSerializer(serializers.ModelSerializer):
    recipe = serializers.CharField(source="meal.recipe", read_only=True)
    photo = serializers.SerializerMethodField()
    planned_usages = MealPlanFoodUsageNestedSerializer(many=True, read_only=True)
    is_replaced = serializers.BooleanField(read_only=True)
    replaced_at = serializers.DateTimeField(read_only=True)
    original_recipe = serializers.CharField(
        source="original_meal.recipe", read_only=True, allow_null=True
    )

    class Meta:
        model = MealPlanMeal
        fields = [
            "id",
            "meal_time",
            "is_skipped",
            "meal",
            "recipe",
            "photo",
            "planned_usages",
            "is_replaced",
            "replaced_at",
            "original_recipe",
        ]

    def get_photo(self, obj):
        meal = getattr(obj, "meal", None)
        if not meal or not getattr(meal, "photo", None):
            return None
        value = meal.photo
        try:
            url = value.url
        except Exception:
            url = str(value)
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request and url.startswith("/") else url


class MealPlanDayNestedSerializer(serializers.ModelSerializer):
    meals = MealPlanMealNestedSerializer(many=True, read_only=True)

    class Meta:
        model = MealPlanDay
        fields = ["id", "date", "is_confirmed", "confirmed_at", "meals"]


class MealPlanDetailSerializer(serializers.ModelSerializer):
    days_plan = MealPlanDayNestedSerializer(many=True, read_only=True)

    class Meta:
        model = MealPlan
        fields = ["id", "start_date", "days", "is_confirmed", "created_at", "days_plan"]