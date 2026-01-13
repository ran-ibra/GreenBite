// src/components/marketplace/reviews/ReviewItem.jsx
const ReviewItem = ({ review }) => {
  return (
    <div className="border rounded-lg p-4 space-y-1">
      <div className="flex justify-between items-center">
        <span className="font-semibold">{review.reviewer_email}</span>

        <span className="text-yellow-500">{"★".repeat(review.rating)}</span>
      </div>

      {review.comment && <p className="text-gray-700">{review.comment}</p>}

      <p className="text-xs text-gray-400">
        {new Date(review.created_at).toLocaleDateString()}
      </p>
    </div>
  );
};

export default ReviewItem;
