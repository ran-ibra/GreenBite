import { normalizeIngredients } from "@/utils/ingredients";
import {
  MEAL_TIME_COLORS,
  getCuisineVisuals
} from "@/utils/constants";
import { Clock, Utensils, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MealDbDetailsCard from "@/components/HomePage/Recipes/MealdbDetailsCard";

export default function DialogMeals({ dialog }) {
  const { isOpen, data, activeIndex, loading, close } = dialog;

  if (!isOpen) return null;
  const list = Array.isArray(data) ? data : data ? [data] : [];
  const recipe = list[activeIndex ?? 0];


  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-3xl">
        <button
          onClick={close}
          className="absolute right-3 top-3 z-10 bg-white/90 hover:bg-white border rounded-full p-2"
        >
          <X size={18} />
        </button>

        {loading ? (
          <div className="bg-white rounded-2xl p-6">
            <p className="text-sm">Loading recipe details...</p>
          </div>
        ) : (
          <MealDbDetailsCard recipe={recipe} />
        )}
      </div>
    </div>
  );
}