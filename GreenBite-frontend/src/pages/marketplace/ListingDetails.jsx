// src/pages/marketplace/ListingDetails.jsx
import { useState } from "react";
import ReviewList from "@/components/marketplace/reviews/ReviewList";
import CreateReviewDialog from "@/components/marketplace/reviews/CreateReviewDialog";

const ListingDetails = ({ listing }) => {
  const [openReview, setOpenReview] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Reviews</h2>

        <button
          onClick={() => setOpenReview(true)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Write Review
        </button>
      </div>

      <ReviewList listingId={listing.id} />

      <CreateReviewDialog
        listingId={listing.id}
        open={openReview}
        onClose={() => setOpenReview(false)}
      />
    </div>
  );
};

export default ListingDetails;
