import { normalizeIngredients } from "@/utils/ingredients";
import { getCuisineVisuals, MEAL_TIME_COLORS } from "@/utils/constants";

export default function MealDbDetailsCard({ recipe }) {
  if (!recipe) return null;

  const cuisineVisuals = getCuisineVisuals(recipe.cuisine || "");
  const ingredients = normalizeIngredients(recipe.ingredients || []);

  const mealTimeKey =
    recipe.mealTime
      ? recipe.mealTime.charAt(0).toUpperCase() + recipe.mealTime.slice(1)
      : null;

  const tags =
    typeof recipe.tags === "string"
      ? recipe.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : Array.isArray(recipe.tags)
        ? recipe.tags
        : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Image */}
      <div className="w-full h-56 bg-gray-100">
        <img
          src={recipe.thumbnail || cuisineVisuals.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title + badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">{recipe.title}</h2>
            <p className="text-xs text-gray-500">
              {recipe.category || "Unknown category"}
              {recipe.cuisine ? ` · ${recipe.cuisine}` : ""}
            </p>
          </div>

          {mealTimeKey && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                MEAL_TIME_COLORS[mealTimeKey] || "bg-gray-100 text-gray-700"
              }`}
            >
              {mealTimeKey}
            </span>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 6).map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Ingredients */}
        <div>
          <h3 className="font-semibold text-sm mb-2">Ingredients</h3>
          {ingredients.length ? (
            <ul className="list-disc pl-5 text-sm space-y-1">
              {ingredients.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No ingredients data.</p>
          )}
        </div>

        {/* Instructions */}
        {recipe.instructions && (
          <div>
            <h3 className="font-semibold text-sm mb-2">Instructions</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {recipe.instructions}
            </p>
          </div>
        )}

        {/* Meta */}
        <div className="pt-3 border-t text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
          <span>MealDB: {recipe.mealdb_id}</span>
          <span>Recipe ID: {recipe.recipe_id}</span>
          {recipe.difficulty && <span>Difficulty: {recipe.difficulty}</span>}
        </div>
      </div>
    </div>
  );
}