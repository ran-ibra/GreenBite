import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { replaceMealInPlan, skipMeal } from "@/api/mealplan.api";
import { GiHotMeal } from "react-icons/gi";
import { FaExchangeAlt, FaBan, FaUndo } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function MealCard({ meal, dayId, isConfirmed }) {
  const [isReplacing, setIsReplacing] = useState(false);
  const queryClient = useQueryClient();

  const replaceMutation = useMutation({
    mutationFn: () => replaceMealInPlan(meal.id, true),
    onSuccess: () => {
      toast.success("Meal replaced successfully!");
      queryClient.invalidateQueries(["mealPlan"]);
      setIsReplacing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to replace meal");
      setIsReplacing(false);
    },
  });

  const skipMutation = useMutation({
    mutationFn: () => skipMeal(meal.id),
    onSuccess: () => {
      toast.success("Meal skipped");
      queryClient.invalidateQueries(["mealPlan"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to skip meal");
    },
  });

  const handleReplace = () => {
    setIsReplacing(true);
    replaceMutation.mutate();
  };

  const getMealTimeColor = (mealTime) => {
    const colors = {
      breakfast: "bg-yellow-100 text-yellow-800",
      lunch: "bg-blue-100 text-blue-800",
      dinner: "bg-purple-100 text-purple-800",
      snack: "bg-green-100 text-green-800",
    };
    return colors[mealTime] || "bg-gray-100 text-gray-800";
  };

  return (
    <div
      className={`bg-white rounded-xl p-4 shadow-sm border ${
        meal.is_skipped ? "opacity-50 border-red-300" : "border-gray-200"
      } ${meal.is_replaced ? "border-[#7eb685] border-2" : ""}`}
    >
      {/* Meal Time Badge */}
      <div className="flex justify-between items-start mb-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getMealTimeColor(
            meal.meal_time
          )}`}
        >
          {meal.meal_time}
        </span>

        {/* Actions */}
        {!isConfirmed && (
          <div className="flex gap-2">
            <button
              onClick={handleReplace}
              disabled={isReplacing}
              className="p-2 hover:bg-[#7eb685] hover:text-white rounded-full transition-colors text-gray-600"
              title="Replace meal"
            >
              {isReplacing ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#7eb685] rounded-full animate-spin" />
              ) : (
                <FaExchangeAlt />
              )}
            </button>
            <button
              onClick={() => skipMutation.mutate()}
              className="p-2 hover:bg-red-500 hover:text-white rounded-full transition-colors text-gray-600"
              title="Skip meal"
            >
              <FaBan />
            </button>
          </div>
        )}
      </div>

      {/* Recipe Info */}
      <div className="flex gap-3">
        <div className="w-16 h-16 bg-lime-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
          {meal.photo ? (
            <img
              src={meal.photo}
              alt={meal.recipe}
              className="w-full h-full object-cover"
            />
          ) : (
            <GiHotMeal className="text-3xl text-[#7eb685]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 mb-1 truncate">
            {meal.recipe || "No recipe"}
          </h4>

          {meal.is_replaced && (
            <div className="flex items-center gap-1 text-xs text-[#7eb685] mb-1">
              <FaUndo className="text-xs" />
              <span>Replaced</span>
            </div>
          )}

          {meal.is_skipped && (
            <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
              Skipped
            </span>
          )}
        </div>
      </div>

      {/* Original Recipe (if replaced) */}
      {meal.is_replaced && meal.original_recipe && (
        <div className="mt-2 text-xs text-gray-500 border-t pt-2">
          <span className="font-medium">Originally:</span> {meal.original_recipe}
        </div>
      )}
    </div>
  );
}