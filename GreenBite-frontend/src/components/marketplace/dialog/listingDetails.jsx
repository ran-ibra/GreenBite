import React from 'react';
import { Trash2, Flag, Star, Clock, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthProvider';

const ListingDetailsDialog = ({ listing, open, onOpenChange, onOrder, onDelete, onReport, onEdit, onReview }) => {
  const { user, isSubscribed } = useAuth();
  const isAdmin = user?.role === "admin";
;

  if (!listing) return null;

  const {
    title,
    description,
    price,
    currency,
    quantity,
    unit,
    featured_image,
    available_until,
    seller,
    status,
    average_rating,
    review_count,
  } = listing;

  const daysLeft = Math.ceil((new Date(available_until) - new Date()) / (1000 * 60 * 60 * 24));
  const isOwner = Boolean(isSubscribed && seller?.id === user?.id);

  // ✅ owner must be subscribed; admin can always
  const canEditDelete = Boolean(isAdmin || (isOwner && isSubscribed));
  console.log({ isOwner, isAdmin, isSubscribed, canEditDelete });

  // ✅ buyer (authenticated but not subscribed seller/admin) can order/review/report
  const isBuyer = Boolean(user && !isAdmin && !isSubscribed); // your rule: not subscribed means buyer; role-based here
  const canOrder = Boolean(isBuyer && !isOwner);
  const canReport = Boolean(user && !isOwner && !isAdmin);

  // Review gating by "order.user_id == my id" can't be enforced without backend data.
  // For now: show review for authenticated buyers; backend should validate.
  const canReview = Boolean(isBuyer && !isOwner);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative h-48 bg-muted rounded-lg overflow-hidden">
            {featured_image ? (
              <img src={featured_image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            <Badge className={`absolute top-2 right-2 ${status === 'ACTIVE' ? 'bg-secondary' : 'bg-muted'}`}>
              {status}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {price} {currency}
            </span>
            <span className="text-muted-foreground">
              {quantity} {unit} available
            </span>
          </div>

          {(average_rating !== undefined || review_count !== undefined) && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-warning fill-warning" />
                <span className="font-semibold">{average_rating?.toFixed(1) || 'N/A'}</span>
              </div>
              <span className="text-muted-foreground">({review_count || 0} reviews)</span>
            </div>
          )}

          {description && <p className="text-muted-foreground">{description}</p>}

          <Separator />

          {seller && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Sold by <strong>{seller?.name ?? seller?.email ?? "Unknown"}</strong></span>
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {canOrder && (
              <Button
                className="flex-1"
                onClick={() => onOrder?.(listing)}
                disabled={status !== 'ACTIVE'}
              >
                Order Now
              </Button>
            )}

            {canReview && (
              <Button variant="outline" onClick={() => onReview?.(listing)}>
                Review
              </Button>
            )}

            {canEditDelete && (
              <Button variant="outline" onClick={() => onEdit?.(listing)}>
                Edit
              </Button>
            )}

            {canEditDelete && (
              <Button variant="destructive" onClick={() => onDelete?.(listing)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}

            {canReport && (
              <Button variant="outline" onClick={() => onReport?.(listing)}>
                <Flag className="h-4 w-4 mr-2" />
                Report
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {daysLeft > 0 ? `Available for ${daysLeft} more days` : 'Expired'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListingDetailsDialog;
