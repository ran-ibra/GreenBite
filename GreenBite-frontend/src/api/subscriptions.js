import api from "@/api/axios";

export const getSubscriptionPlans = async () => {
  const response = await api.get("/api/subscription-plans/");
  return response.data;
};

export const startSubscription = async (planId) => {
  const response = await api.post("/api/start-subscription/", {
    plan_id: planId,
  });
  return response.data;
};
