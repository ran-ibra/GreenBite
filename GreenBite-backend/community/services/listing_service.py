from community.models import ComMarket, CommunityParent
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import PermissionDenied, ValidationError

@transaction.atomic
def create_listing(user, validated_data):
    today = timezone.now().date()

    parent = CommunityParent.objects.create(
        creator=user,
        community_type="MARKET",
        status="ACTIVE",
        visibility="PUBLIC",
    )

    validated_data["available_from"] = today

    return ComMarket.objects.create(
        community_parent=parent,
        seller=user,
        status="ACTIVE",
        **validated_data
    )

@transaction.atomic
def update_listing(user, listing_id, validated_data):
    try:
        listing = ComMarket.objects.select_for_update().get(id=listing_id)
    except ComMarket.DoesNotExist:
        raise ValidationError("Listing not found.")

    # Permission check
    if not user.is_staff and listing.seller != user:
        raise PermissionDenied("You do not own this listing.")

    # Status check
    if not user.is_staff and listing.status != "ACTIVE":
        raise ValidationError("Only ACTIVE listings can be updated.")
    if user.is_staff and listing.status not in ["ACTIVE", "EXPIRED"]:
        raise ValidationError("Cannot edit this listing.")

    # Active orders check
    active_orders = listing.orders.filter(status__in=["PENDING", "ACCEPTED"]).exists()
    if active_orders:
        raise ValidationError("Cannot edit listing with active orders.")

    # Only allow update for certain fields
    allowed_fields = [
        "title", "description", "featured_image",
        "price", "quantity", "unit", "available_until"
    ]
    for field in allowed_fields:
        if field in validated_data:
            setattr(listing, field, validated_data[field])

    listing.save()
    return listing

@transaction.atomic
def delete_listing(user, listing_id):
    try:
        listing = ComMarket.objects.select_for_update().get(id=listing_id)
    except ComMarket.DoesNotExist:
        raise ValidationError("Listing not found.")

    # Permission check
    if not user.is_staff and listing.seller != user:
        raise PermissionDenied("You do not own this listing.")

    if listing.status == "DELETED":
        raise ValidationError("Listing already deleted.")

    # Status check
    if listing.status != "ACTIVE":
        raise ValidationError("Only ACTIVE listings can be deleted.")

    # Active orders check
    active_orders = listing.orders.filter(status__in=["PENDING", "ACCEPTED"]).exists()
    if active_orders:
        raise ValidationError("Cannot delete listing with active orders.")

    # Soft delete
    listing.status = "DELETED"
    listing.deleted_at = timezone.now()
    listing.save()