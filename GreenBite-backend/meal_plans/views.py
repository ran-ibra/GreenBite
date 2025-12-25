from multiprocessing import context
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from meal_plans.services.meal_plan_generator import generate_meal_plan
from meal_plans.services.confirmeal import confirm_meal_plan_day
from .models import  MealPlanMeal, MealPlanDay

class MealPlanGeneratorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        days = int(request.data.get("days", 3))
        meals_per_day = int(request.data.get("meals_per_day", 3))

        start_date_raw = request.data.get("start_date")
        if start_date_raw:
            start_date = parse_date(str(start_date_raw))
            if not start_date:
                return Response({"error": "Invalid start_date. Use YYYY-MM-DD."}, status=400)
        else:
            start_date = timezone.now().date()

        try:
            meal_plan = generate_meal_plan(request.user, start_date, days, meals_per_day)

            if not meal_plan:
                return Response({"error": "Failed to generate meal plan."}, status=500)

            days_qs = getattr(meal_plan, "days_plan", None)
            if days_qs is None:
                return Response(
                    {"error": "MealPlan model has no related 'days_plan'. Check MealPlanDay.related_name."},
                    status=500,
                )

            meals_payload = []
            for day in days_qs.all():
                for plan_meal in day.meals.all():  # Assumes related_name="meals"
                    meals_payload.append(
                        {
                            "date": day.date,
                            "meal_time": plan_meal.meal_time,
                            "photo": (plan_meal.meal.photo if plan_meal.meal else None),
                            "recipe": (plan_meal.meal.recipe if plan_meal.meal else None),
                            "meal_id": (plan_meal.meal_id if plan_meal.meal else None),
                            "is_skipped": plan_meal.is_skipped,
                        }
                    )

            return Response(
                {
                    "meal_plan_id": meal_plan.id,
                    "start_date": meal_plan.start_date,
                    "days": meal_plan.days,  # int
                    "is_confirmed": meal_plan.is_confirmed,
                    "meals": meals_payload,
                },
                status=201,
            )

        except ValueError as e:
            return Response({"error": str(e)}, status=400)
from meal_plans.models import MealPlan
from .serializers import MealPlanDetailSerializer

class MealPlanDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            plan = MealPlan.objects.prefetch_related(
                "days_plan__meals__meal",
                "days_plan__meals__planned_usages__food_log",
            ).get(id=pk, user=request.user)
        except MealPlan.DoesNotExist:
            return Response({"error": "Meal plan not found"}, status=404)

        serializer = MealPlanDetailSerializer(plan, context={"request": request})
        return Response(serializer.data)


class MealPlanDayConfirmAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            day = MealPlanDay.objects.select_related(
                "meal_plan"
            ).get(
                id=pk,
                meal_plan__user=request.user
            )
        except MealPlanDay.DoesNotExist:
            return Response({"error": "Day not found"}, status=404)

        try:
            confirm_meal_plan_day(day, request.user)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        return Response({"status": "Day confirmed"})
class MealPlanMealSkipAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            meal = MealPlanMeal.objects.get(
                id=pk,
                meal_plan_day__meal_plan__user=request.user
            )
        except MealPlanMeal.DoesNotExist:
            return Response({"error": "Meal not found"}, status=404)

        meal.is_skipped = True
        meal.save(update_fields=["is_skipped"])

        return Response({"status": "Meal skipped"})
class MealPlanDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            plan = MealPlan.objects.get(id=pk, user=request.user)
        except MealPlan.DoesNotExist:
            return Response({"error": "Meal plan not found"}, status=404)

        if plan.is_confirmed:
            return Response(
                {"error": "Cannot delete confirmed plan"},
                status=400
            )

        plan.delete()
        return Response(status=204)
