export function instructionsToSteps(instructions) {
  return (instructions || "")
    .split(/\r?\n/)          // split on new lines
    .map(s => s.trim())
    .filter(Boolean);
}

export function formatIngredient(i) {
  const measure = (i?.measure || "").trim();
  const name = (i?.name || "").trim();
  return [measure, name].filter(Boolean).join(" ");
}

export function buildSavePayloadFromMealDb(meal){
  const steps = (meal.instructions || "")
  .split(/\r?\n/)
  .map(s => s.trim())
  .filter(Boolean);

  return {
    recipe: meal.title,
    title: meal.title,
    cuisine: meal.cuisine,
    mealTime: "Dinner",
    ingredients: (meal.ingredients || []). map(i => 
    [i.measure, i.name].filter(Boolean).join(" ").trim()
    ), steps,
  };
}
export function mapMealDbFromBackend(meal) {
  if (!meal) return null;

  return {
    mealdb_id: meal.mealdb_id,
    title: meal.title,
    thumbnail: meal.thumbnail,
    category: meal.category,
    cuisine: meal.cuisine,
    instructions: meal.instructions,
    tags: meal.tags || [],
    ingredients: meal.ingredients || [], // includes {text}
  };
}