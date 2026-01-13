import api from "@/api/axios";

export const createReview = (data) => {
  return api.post("/api/community/reviews/", data);
};

export const getListingReviews = (listingId, params) =>
  api.get(`/api/community/market/listings/${listingId}/reviews/`, { params });
