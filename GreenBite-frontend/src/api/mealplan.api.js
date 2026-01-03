import api from "./axios";

export const generateMealPlan = async (data) => {
    const response = await api.post("api/meal_plans/generate/", data);
    return response.data;
};

export const getMealPlanById = async (id) => {
    const response = await api.get(`api/meal_plans/${id}/`);
    return response.data;
};
export const getAllMealPlans = async () => {
    const response = await api.get("api/meal_plans/");
    return response.data;
};
export const confirmMealPlanDay = async (id) => {
    const response = await api.post(`api/meal_plans/days/${id}/confirm/`);
    return response.data;
};
export const confirmMealPlan = async (id) => {
    const response = await api.post(`api/meal_plans/${id}/confirm/`);
    return response.data;
};
export const replaceMeal = async (mealId, useAi=true) => {
    const response = await api.post(`api/meal_plans/meals/${mealId}/replace/`, { use_ai_fallback: useAi });
    return response.data;
};
export const skipMeal = async (mealId) => {
    const response = await api.post(`api/meal_plans/meals/${mealId}/skip/`);
    return response.data;
};

export const deleteMealPlan = async (id) => {
    const response = await api.delete(`api/meal_plans/${id}/delete/`);
    return response.data;
};

export const getMealById = async (id) => {
    const response = await api.get(`api/meals/${id}/`);
    return response.data;
};

