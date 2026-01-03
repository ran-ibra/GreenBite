import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGenerateMealPlan } from "@/hooks/useMealPlans";

export default function GenerateMealPlanPage() {
  const [days, setDays] = useState(3);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [useAi, setUseAi] = useState(false);
  const [startDate, setStartDate] = useState("");
  const generateMutation = useGenerateMealPlan();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        days,
        meals_per_day: mealsPerDay,
        use_ai_fallback: useAi,
      };
      if (startDate) payload.start_date = startDate;
      const res = await generateMutation.mutateAsync(payload);
      if (res.meal_plan_id) {
        navigate(`/home/mealplans/${res.meal_plan_id}`);
      }
    } catch {
      // error is already reflected by mutation state or toast
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Generate Meal Plan</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span>Start Date (optional)</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span>Days</span>
          <input
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span>Meals per day</span>
          <input
            type="number"
            min={1}
            max={4}
            value={mealsPerDay}
            onChange={(e) => setMealsPerDay(Number(e.target.value))}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useAi}
            onChange={(e) => setUseAi(e.target.checked)}
          />
          <span>Use AI fallback when recipes are missing</span>
        </label>

        <button
          type="submit"
          disabled={generateMutation.isLoading}
          className="bg-[#7eb685] text-white px-4 py-2 rounded-lg disabled:opacity-60"
        >
          {generateMutation.isLoading ? "Generating..." : "Generate"}
        </button>

        {generateMutation.isError && (
          <p className="text-red-500 text-sm mt-2">
            Failed to generate meal plan. Please try again.
          </p>
        )}
      </form>
    </div>
  );
}