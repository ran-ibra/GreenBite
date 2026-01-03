import { normalizeIngredients } from "@/utils/ingredients";
import {
  MEAL_TIME_COLORS,
  getCuisineVisuals
} from "@/utils/constants";
import { Clock, Utensils, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MealDetailsDialog({ dialog }) {
  const { isOpen, data, activeIndex, loading, close } = dialog;

  if (!isOpen) return null;

  // data is always an array per useDialog
  const meal = data[activeIndex];

  if (loading || !meal) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 w-full max-w-md">
          <p className="text-sm">Loading meal details...</p>
        </div>
      </div>
    );
  }
  const navigate = useNavigate();

  const ingredients = normalizeIngredients(meal.ingredients || []);
  const mealTimeKey =
    meal.mealTime ||
    meal.meal_time ||
    "Breakfast";

  const handleClose = () => dialog?.onClose?.();

  const handleViewRecipe = () => {
    if (meal?.id) {
      navigate(`/recipes/${meal.id}`);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-lg p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
        >
          <X size={18} />
        </button>
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
        {meal.photo && (
          <img
            src={meal.photo}
            alt={meal.recipe}
            className="w-full h-48 object-cover rounded mb-3"
          />
        )}

        

        <h3 className="font-semibold mb-1 text-sm">Ingredients</h3>
        <ul className="list-disc list-inside mb-3 text-sm space-y-0.5">
          {ingredients.map((ing, idx) => (
            <li key={idx}>{ing}</li>
          ))}
        </ul>

        {/* You can add steps/instructions later if you store them */}

        <div className="mt-4 flex justify-end">
          <button
            onClick={close}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}