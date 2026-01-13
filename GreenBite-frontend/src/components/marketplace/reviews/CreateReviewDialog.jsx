// src/components/marketplace/reviews/CreateReviewDialog.jsx
import { useState } from "react";
import RatingStars from "./RatingStars";
import { useCreateReview } from "@/hooks/marketplace/reviews/useCreateReview";

const CreateReviewDialog = ({ listingId, open, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const mutation = useCreateReview(listingId, onClose);

  if (!open) return null;

  const submit = () => {
    mutation.mutate({
      market_id: listingId,
      rating,
      comment,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">Write a Review</h3>

        <RatingStars value={rating} onChange={setRating} />

        <textarea
          className="w-full border rounded px-3 py-2"
          placeholder="Your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {mutation.isError && (
          <p className="text-red-500 text-sm">
            {mutation.error?.response?.data?.detail ||
              "You are not allowed to review this item"}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={mutation.isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateReviewDialog;
