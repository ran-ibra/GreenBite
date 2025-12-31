import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmMealPlanDay } from "@/api/mealplan.api";
import MealCard from "./MealCard";
import { FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function DayCard({ day, planId }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: () => confirmMealPlanDay(day.id),
    onSuccess: () => {
      toast.success("Day confirmed! Food logged.");
      queryClient.invalidateQueries(["mealPlan", planId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to confirm day");
    },
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
      {/* Day Header */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            <div>
              <h3 className="font-semibold text-gray-900">
                {formatDate(day.date)}
              </h3>
              <p className="text-sm text-gray-500">{day.meals.length} meals</p>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="flex items-center gap-2">
            {day.is_confirmed ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <FaCheck /> Confirmed
              </span>
            ) : (
              <button
                onClick={() => confirmMutation.mutate()}
                disabled={confirmMutation.isPending}
                className="px-4 py-2 bg-[#7eb685] hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:bg-gray-400"
              >
                {confirmMutation.isPending ? "Confirming..." : "Confirm Day"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Meals Grid */}
      {isExpanded && (
        <div className="p-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {day.meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              dayId={day.id}
              isConfirmed={day.is_confirmed}
            />
          ))}
        </div>
      )}
    </div>
  );
}