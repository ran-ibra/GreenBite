import { MEAL_TIME_IMAGES, DEFAULT_MEAL_IMAGE } from "@/utils/constants";

function getFallbackImage(mealTime) {
  if (!mealTime) return DEFAULT_MEAL_IMAGE;

  const key =
    mealTime.charAt(0).toUpperCase() + mealTime.slice(1).toLowerCase();

  return MEAL_TIME_IMAGES[key] || DEFAULT_MEAL_IMAGE;
}

/**
 * Reusable meal thumbnail.
 * Props:
 * - photo: string | null
 * - mealTime: "breakfast" | "lunch" | ...
 * - alt: string
 * - className: extra tailwind classes for outer div
 */
export default function MealThumbnail({ photo, mealTime, alt, className = "" }) {
  const fallback = getFallbackImage(mealTime);
  const src = photo || fallback;

  return (
    <div
      className={`w-16 h-16 bg-lime-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
    >
      <img
        src={src}
        alt={alt || "Meal"}
        className="w-full h-full object-cover"
      />
    </div>
  );
}