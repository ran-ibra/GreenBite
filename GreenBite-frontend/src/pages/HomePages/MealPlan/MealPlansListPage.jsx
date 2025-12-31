import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllMealPlans } from "@/api/mealplan.api";
import { useNavigate } from "react-router-dom";
import { PacmanLoader } from "react-spinners";
import MealPlanGenerator from "@/components/HomePage/MealPlan/mealPlan";
import { FaPlus, FaCalendarAlt, FaCheck } from "react-icons/fa";
import { Toaster } from "react-hot-toast";

export default function MealPlansListPage() {
  const [showGenerator, setShowGenerator] = useState(false);
  const navigate = useNavigate();

  const { data: mealPlans, isLoading, refetch } = useQuery({
    queryKey: ["mealPlans"],
    queryFn: getAllMealPlans,
  });

  const handleGenerateSuccess = (data) => {
    refetch();
    if (data.meal_plan_id) {
      navigate(`/home/mealplans/${data.meal_plan_id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PacmanLoader color="#7eb685" size={25} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Meal Plans
            </h1>
            <p className="text-gray-600">
              Generate and manage your weekly meal plans
            </p>
          </div>

          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#7eb685] hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            <FaPlus /> Generate New Plan
          </button>
        </div>
      </div>

      {/* Meal Plans Grid */}
      <div className="max-w-7xl mx-auto">
        {!mealPlans || mealPlans.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No meal plans yet
            </h3>
            <p className="text-gray-500 mb-6">
              Generate your first meal plan to get started!
            </p>
            <button
              onClick={() => setShowGenerator(true)}
              className="px-6 py-3 bg-[#7eb685] hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              Create Meal Plan
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => navigate(`/home/mealplans/${plan.id}`)}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {plan.days}-Day Plan
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(plan.start_date).toLocaleDateString()}
                    </p>
                  </div>

                  {plan.is_confirmed && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                      <FaCheck /> Confirmed
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>📅 {plan.days_plan?.length || 0} days planned</p>
                  <p>
                    🍽️{" "}
                    {plan.days_plan?.reduce(
                      (sum, day) => sum + day.meals.length,
                      0
                    ) || 0}{" "}
                    total meals
                  </p>
                  <p className="text-xs text-gray-400">
                    Created {new Date(plan.created_at).toLocaleDateString()}
                  </p>
                </div>

                <button className="mt-4 w-full py-2 bg-gray-100 hover:bg-[#7eb685] hover:text-white rounded-lg transition-colors text-sm font-medium">
                  View Plan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generator Modal */}
      <MealPlanGenerator
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onSuccess={handleGenerateSuccess}
      />
    </div>
  );
}