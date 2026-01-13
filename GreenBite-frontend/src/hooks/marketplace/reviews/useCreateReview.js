// src/hooks/marketplace/reviews/useCreateReview.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview } from "@/api/marketplace/reviews.api";

export const useCreateReview = (listingId, onSuccessClose) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listing-reviews", listingId],
      });
      onSuccessClose?.();
    },
  });
};
