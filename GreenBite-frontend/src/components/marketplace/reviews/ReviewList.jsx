// src/components/marketplace/reviews/ReviewList.jsx
import { useListingReviews } from "@/hooks/marketplace/reviews/useListingReviews";
import ReviewItem from "./ReviewItem";

const ReviewList = ({ listingId }) => {
  const { data, isLoading, isError } = useListingReviews(listingId);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading reviews...</p>;
  }

  if (isError) {
    return <p className="text-destructive">Failed to load reviews</p>;
  }

  if (!data || data.count === 0) {
    return <p className="text-muted-foreground">No reviews yet</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg">
          ⭐ {data.average_rating.toFixed(1)}
        </span>
        <span className="text-muted-foreground">({data.count})</span>
      </div>

      {data.results.map((review, idx) => (
        <ReviewItem key={idx} review={review} />
      ))}
    </div>
  );
};

export default ReviewList;
