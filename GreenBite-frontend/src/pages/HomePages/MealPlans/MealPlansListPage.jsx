import { Link } from "react-router-dom";
import { useMealPlansList, useDeleteMealPlan } from "@/hooks/useMealPlans";

export default function MealPlansListPage() {
  const { data, isLoading, isError } = useMealPlansList();
  const deleteMutation = useDeleteMealPlan();

  if (isLoading) return <p className="p-4">Loading meal plans...</p>;
  if (isError) return <p className="p-4 text-red-500">Failed to load meal plans.</p>;

  const plans = data || [];

  if (!plans.length) {
    return (
      <div className="p-6">
        <p className="mb-4">You don’t have any meal plans yet.</p>
        <Link
          to="/home/mealplans/generate"
          className="inline-block bg-[#7eb685] text-white px-4 py-2 rounded-lg"
        >
          Generate a meal plan
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">My Meal Plans</h1>
        <Link
          to="/home/mealplans/generate"
          className="bg-[#7eb685] text-white px-4 py-2 rounded-lg"
        >
          New plan
        </Link>
      </div>

      {plans.map((plan) => (
        <div
          key={plan.id}
          className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div>
            <p className="font-medium">
              Plan #{plan.id} · {plan.start_date} · {plan.days} days
            </p>
            <p className="text-sm text-gray-600">
              Status: {plan.is_confirmed ? "Confirmed" : "Draft"}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/home/mealplans/${plan.id}`}
              className="px-3 py-1 text-sm border rounded-lg"
            >
              View
            </Link>

            {!plan.is_confirmed && (
              <button
                onClick={() => deleteMutation.mutate(plan.id)}
                disabled={deleteMutation.isLoading}
                className="px-3 py-1 text-sm border rounded-lg text-red-600"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}