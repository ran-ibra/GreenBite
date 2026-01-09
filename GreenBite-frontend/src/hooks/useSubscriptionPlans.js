import { useQuery, useMutation } from "@tanstack/react-query";
import { getSubscriptionPlans, startSubscription } from "@/api/subscriptions";

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: getSubscriptionPlans,
  });
};

export const useStartSubscription = () => {
  return useMutation({
    mutationFn: startSubscription,
    onSuccess: (data) => {
      window.location.href = data.checkout_url;
    },
  });
};
