import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateMealPlan } from "@/api/mealplan.api";
import { GrFormClose } from "react-icons/gr";
import { toast } from "react-hot-toast";

export default function MealPlanGenerator({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    days: 7,
    meals_per_day: 3,
    start_date: new Date().toISOString().split("T")[0],
    use_ai_fallback: true,
  });

  const mutation = useMutation({
    mutationFn: generateMealPlan,
    onSuccess: (data) => {
      toast.success("Meal plan generated successfully!");
      onSuccess?.(data);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to generate meal plan");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Generate Meal Plan
          </h2>
          <GrFormClose
            onClick={onClose}
            className="text-gray-600 hover:text-red-600 text-3xl cursor-pointer"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7eb685] focus:border-transparent"
              required
            />
          </div>

          {/* Number of Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Days (1-30)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={formData.days}
              onChange={(e) =>
                setFormData({ ...formData, days: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7eb685] focus:border-transparent"
              required
            />
          </div>

          {/* Meals Per Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meals Per Day
            </label>
            <select
              value={formData.meals_per_day}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  meals_per_day: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7eb685] focus:border-transparent"
            >
              <option value={1}>1 Meal</option>
              <option value={2}>2 Meals</option>
              <option value={3}>3 Meals</option>
              <option value={4}>4 Meals (+ Snack)</option>
            </select>
          </div>

          {/* AI Fallback Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Use AI for more recipes
            </label>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  use_ai_fallback: !formData.use_ai_fallback,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.use_ai_fallback ? "bg-[#7eb685]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.use_ai_fallback ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-[#7eb685] hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors disabled:bg-gray-400"
          >
            {mutation.isPending ? "Generating..." : "Generate Meal Plan"}
          </button>
        </form>
      </div>
    </div>
  );
}