import { useParams } from "react-router-dom";
import {
  useMealPlanDetail,
  useConfirmPlan,
  useConfirmDay,
  useReplacePlanMeal,
  useSkipPlanMeal,
} from "@/hooks/useMealPlans";
import MealDetailsDialog from "@/components/HomePage/Dialogs/DialogMeals";
import useDialog from "@/hooks/useDialog";
import { toast } from "react-hot-toast";
import MealThumbnail from "@/components/HomePage/Meals/MealThumbnail";
import { getMealById } from "@/api/mealplan.api";

export default function MealPlanDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useMealPlanDetail(id);
  const confirmPlanMutation = useConfirmPlan();
  const confirmDayMutation = useConfirmDay();
  const replaceMutation = useReplacePlanMeal();
  const skipMutation = useSkipPlanMeal();

  const mealDialog = useDialog(); // ✅ define first

  const handleViewDetails = (mealId) => {
    mealDialog.open(() => getMealById(mealId)); // ✅ loader function
  };

  if (isLoading) return <p className="p-4">Loading meal plan...</p>;
  if (isError || !data) return <p className="p-4 text-red-500">Failed to load meal plan.</p>;

  const plan = data;

  const handleConfirmPlan = async () => {
    try {
      await confirmPlanMutation.mutateAsync(plan.id);
      toast.success("Meal plan confirmed.");
    } catch {
      toast.error("Failed to confirm meal plan.");
    }
  };

  const handleConfirmDay = async (dayId) => {
    try {
      await confirmDayMutation.mutateAsync(dayId);
      toast.success("Day confirmed.");
    } catch {
      toast.error("Failed to confirm day.");
    }
  };

  const handleReplace = async (mealId) => {
    try {
      await replaceMutation.mutateAsync({ mealId, useAi: true });
      toast.success("Meal replaced.");
    } catch {
      toast.error("Failed to replace meal.");
    }
  };

  const handleSkip = async (mealId) => {
    try {
      await skipMutation.mutateAsync(mealId);
      toast.success("Meal skipped.");
    } catch {
      toast.error("Failed to skip meal.");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Meal Plan #{plan.id}</h1>
          <p className="text-sm text-gray-600">
            Start: {plan.start_date} · {plan.days} days
          </p>
          <p className="text-sm text-gray-600">
            Status: {plan.is_confirmed ? "Confirmed" : "Draft"}
          </p>
        </div>

        {!plan.is_confirmed && (
          <button
            onClick={handleConfirmPlan}
            disabled={confirmPlanMutation.isLoading}
            className="bg-[#7eb685] text-white px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {confirmPlanMutation.isLoading ? "Confirming..." : "Confirm plan"}
          </button>
        )}
      </header>

      <div className="space-y-4">
        {plan.days_plan.map((day) => (
          <div key={day.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-medium">{day.date}</p>
                <p className="text-xs text-gray-500">
                  {day.is_confirmed
                    ? `Confirmed at ${day.confirmed_at || ""}`
                    : "Not confirmed"}
                </p>
              </div>

              {!day.is_confirmed && (
                <button
                  onClick={() => handleConfirmDay(day.id)}
                  disabled={confirmDayMutation.isLoading}
                  className="px-3 py-1 text-sm border rounded-lg"
                >
                  {confirmDayMutation.isLoading ? "Confirming..." : "Confirm day"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {day.meals.map((m) => (
                <div
                  key={m.id}
                  className={`border rounded-lg p-3 flex gap-3 ${
                    m.is_skipped ? "opacity-50 border-red-300" : "border-gray-200"
                  }`}
                >
                  <MealThumbnail
                    photo={m.photo}
                    mealTime={m.meal_time}
                    alt={m.recipe}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                        {m.meal_time}
                      </span>

                      <div className="flex gap-2">
                        {!day.is_confirmed && !m.is_skipped && (
                          <>
                            <button
                              onClick={() => handleReplace(m.id)}
                              disabled={replaceMutation.isLoading}
                              className="px-2 py-1 text-xs border rounded-lg"
                            >
                              Replace
                            </button>
                            <button
                              onClick={() => handleSkip(m.id)}
                              disabled={skipMutation.isLoading}
                              className="px-2 py-1 text-xs border rounded-lg text-red-600"
                            >
                              Skip
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-medium mb-1 truncate">
                      {m.recipe || "No recipe yet"}
                    </p>

                    {m.meal && (
                      <button
                        className="text-xs text-[#7eb685] underline"
                        onClick={() => handleViewDetails(m.meal)} // ✅ open dialog
                      >
                        View details
                      </button>
                    )}

                    {m.original_recipe && (
                      <p className="mt-1 text-xs text-gray-500">
                        Originally: {m.original_recipe}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ pass dialog object */}
      <MealDetailsDialog dialog={mealDialog} />
  
    </div>
  );
}