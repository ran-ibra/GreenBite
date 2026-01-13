import ReviewList from "@/components/marketplace/reviews/ReviewList";
import CreateReviewDialog from "@/components/marketplace/reviews/CreateReviewDialog";
import Button from "@/components/ui/Button";

const ListingReviewsDialog = ({ open, onOpenChange, listing }) => {
  if (!open || !listing?.id) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg w-full max-w-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Reviews – {listing.title}</h2>

            <button onClick={() => onOpenChange(false)}>✕</button>
          </div>

          {/* LIST REVIEWS */}
          <ReviewList listingId={listing.id} />
        </div>
      </div>
    </>
  );
};

export default ListingReviewsDialog;
