from django.urls import path
from community.views.market.listings import MarketListingView, MarketListingDetailView

urlpatterns = [
    path("listings/", MarketListingView.as_view(), name="market-listings"),
    path("listings/<uuid:listing_id>/", MarketListingDetailView.as_view(), name="market-listing-detail")
]
