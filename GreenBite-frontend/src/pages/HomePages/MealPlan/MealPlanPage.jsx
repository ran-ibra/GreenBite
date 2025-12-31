import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMealPlanById,
  confirmMealPlan,
  deleteMealPlan,
} from "@/api/mealplan.api";
import { useParams, useNavigate } from "react-router-dom";
import { PacmanLoader } from "react-spinners";
import DayCard from "@/components/HomePage/MealPlan/DayCard";
import { FaArrowLeft, FaCheck, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function MealPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: mealPlan, isLoading } = useQuery({
    queryKey: ["mealPlan", id],
    queryFn: () => getMealPlanById(id),
    enabled: !!id,
  });

  const confirmAllMutation = useMutation({
    mutationFn: () => confirmMealPlan(id),
    onSuccess: () => {
      toast.success("Entire meal plan confirmed!");
      queryClient.invalidateQueries(["mealPlan", id]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || "Failed to confirm meal plan"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMealPlan(id),
    onSuccess: () => {
      toast.success("Meal plan deleted");
      navigate("/home/mealplans");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to delete meal plan");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PacmanLoader color="#7eb685" size={25} />
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Meal plan not found</p>
        <button
          onClick={() => navigate("/home/mealplans")}
          className="mt-4 px-4 py-2 bg-[#7eb685] text-white rounded-lg"
        >
          Back to Meal Plans
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => navigate("/home/mealplans")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#7eb685] mb-4"
        >
          <FaArrowLeft /> Back to Plans
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mealPlan.days}-Day Meal Plan
            </h1>
            <p className="text-gray-600">
              Starting {new Date(mealPlan.start_date).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-3">
            {!mealPlan.is_confirmed && (
              <button
                onClick={() => confirmAllMutation.mutate()}
                disabled={confirmAllMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-[#7eb685] hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400"
              >
                <FaCheck />
                {confirmAllMutation.isPending
                  ? "Confirming..."
                  : "Confirm All Days"}
              </button>
            )}

            {!mealPlan.is_confirmed && (
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                <FaTrash />
                Delete Plan
              </button>
            )}
          </div>
        </div>

        {mealPlan.is_confirmed && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">
              ✅ This meal plan is confirmed and logged
            </p>
          </div>
        )}
      </div>

      {/* Days */}
      <div className="max-w-7xl mx-auto space-y-4">
        {mealPlan.days_plan?.map((day) => (
          <DayCard key={day.id} day={day} planId={id} />
        ))}
      </div>
    </div>
  );
}