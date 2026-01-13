import { useQuery } from "@tanstack/react-query";
import { getListingReviews } from "@/api/marketplace/reviews.api";

export const useListingReviews = (listingId) => {
  return useQuery({
    queryKey: ["listing-reviews", listingId],
    queryFn: () => getListingReviews(listingId).then((res) => res.data),
    enabled: !!listingId,
  });
};
