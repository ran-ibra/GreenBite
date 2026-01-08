from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.core.exceptions import ValidationError, PermissionDenied
from community.models import ComMarket
from community.serializers.market import MarketCreateUpdateSerializer, MarketListSerializer, MarketDetailSerializer
from community.permissions import IsActiveSeller, IsOwnerOrAdmin
from community.services.listing_service import create_listing, update_listing, delete_listing
from community.filters.market_filters import MarketListingFilter
from django.shortcuts import get_object_or_404


class MarketListingPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class MarketListingView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MarketListingPagination

    def get_queryset(self):
        queryset = ComMarket.objects.all()
        return MarketListingFilter(queryset, self.request.query_params, self.request.user).filter()

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        serializer = MarketListSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    def post(self, request, *args, **kwargs):
        # Only active sellers can create
        if not IsActiveSeller().has_permission(request, self):
            return Response({"detail": "You are not allowed to create listings."}, status=403)

        serializer = MarketCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        listing = create_listing(request.user, serializer.validated_data)
        return Response({
            "id": listing.id,
            "title": listing.title,
            "status": listing.status,
            "created_at": listing.created_at
        }, status=status.HTTP_201_CREATED)


class MarketListingDetailView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        # Use different serializer depending on method
        if self.request.method == "GET":
            return MarketDetailSerializer
        return MarketCreateUpdateSerializer

    def get_object(self, listing_id):
        # Fetch listing or 404
        listing = get_object_or_404(ComMarket, id=listing_id)
        # Object-level permission
        self.check_object_permissions(self.request, listing)
        return listing

    def get_permissions(self):
        """
        Apply IsOwnerOrAdmin for PATCH and DELETE
        IsAuthenticated for GET
        """
        if self.request.method in ["PATCH", "DELETE"]:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get(self, request, listing_id):
        listing = self.get_object(listing_id)
        serializer = self.get_serializer(listing)
        return Response(serializer.data, status=200)

    def patch(self, request, listing_id):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            listing = update_listing(request.user, listing_id, serializer.validated_data)
        except PermissionDenied as e:
            return Response({"detail": str(e)}, status=403)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=400)
        except Exception as e:
            return Response({"detail": str(e)}, status=500)

        return Response({
            "id": listing.id,
            "title": listing.title,
            "status": listing.status,
            "updated_at": listing.updated_at
        }, status=200)

    def delete(self, request, listing_id):
        try:
            delete_listing(request.user, listing_id)
        except PermissionDenied as e:
            return Response({"detail": str(e)}, status=403)
        except ValidationError as e:
            msg = str(e)
            if msg == "Listing not found.":
                return Response({"detail": msg}, status=404)
            elif msg == "Cannot delete listing with active orders.":
                return Response({"detail": msg}, status=409)
            elif msg == "Listing already deleted.":
                return Response({"detail": msg}, status=410)
            return Response({"detail": msg}, status=400)
        except Exception as e:
            return Response({"detail": str(e)}, status=500)

        return Response(status=204)