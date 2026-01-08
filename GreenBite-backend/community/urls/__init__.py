from django.urls import path, include

urlpatterns = [
    path("market/", include("community.urls.market")),
    path("profile/", include("community.urls.community_profile")),
    # Add other routes here, e.g., reports, profiles
]
