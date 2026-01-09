import api from "./axios";

export const getMealdbRecipeById = async (mealdbId) => {
  const res = await api.get(`/api/mealdb/${mealdbId}/`);
  return res.data;
};
