import {
  MEAL_TIME_COLORS,
  getCuisineVisuals,
} from "@/utils/constants";
import { Clock, Utensils, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { normalizeIngredients } from "@/utils/ingredients";

export default function MealDetailsDialog({ dialog }) {
  const navigate = useNavigate();
  const meal = dialog?.data?.meal;

  // ✅ If no meal data yet, render nothing (or a skeleton)
  if (!meal) {
    return null;
  }

  const ingredients = normalizeIngredients(meal.ingredients);
  const mealTimeKey =
    meal.mealTime ||
    meal.meal_time ||
    "Breakfast";

  const cuisineVisuals = getCuisineVisuals(meal.cuisine);

  const handleClose = () => dialog?.onClose?.();

  const handleViewRecipe = () => {
    if (meal?.id) {
      navigate(`/recipes/${meal.id}`);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              MEAL_TIME_COLORS[mealTimeKey] || "bg-gray-100 text-gray-700"
            }`}
          >
            {mealTimeKey}
          </span>

          <h2 className="text-lg font-semibold truncate flex-1">
            {meal.title || meal.recipe || "Meal details"}
          </h2>
        </div>

        {/* Cuisine + calories */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Utensils size={16} />
            <span>{meal.cuisine || "Unknown cuisine"}</span>
          </div>
          {meal.calories && (
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{meal.calories} kcal</span>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="w-full h-40 rounded-xl overflow-hidden mb 4 bg-gray-100">
          <img
            src={meal.photo || cuisineVisuals.image}
            alt={meal.title || meal.recipe}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Ingredients */}
        <h3 className="font-semibold mb-2">Ingredients</h3>
        <ul className="list-disc pl-6 mb-6 text-sm">
          {ingredients.map((ing, idx) => (
            <li key={idx}>{ing}</li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handleViewRecipe}
            className="px-4 py-2 text-sm rounded-lg bg-[#7eb685] text-white hover:bg-[#6aa56f]"
          >
            View full recipe
          </button>
        </div>
      </div>
    </div>
  );
}
