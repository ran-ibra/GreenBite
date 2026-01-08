from rest_framework import serializers
from community.models import MarketReview, MarketOrder, ComMarket


class MarketReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketReview
        fields = [
            'id',
            'market_id',
            'rating',
            'comment',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        request = self.context['request']
        user = request.user
        market = attrs.get('market_id')
        rating = attrs.get('rating')

        # Seller cannot review own listing
        if market.seller_id == user:
            raise serializers.ValidationError(
                "You cannot review your own listing."
            )

        # Rating bounds
        if rating < 1 or rating > 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )

        # User must have a DELIVERED order for this listing
        has_delivered_order = MarketOrder.objects.filter(
            market_id=market,
            buyer_id=user,
            status='DELIVERED',
        ).exists()

        if not has_delivered_order:
            raise serializers.ValidationError(
                "You can only review listings you have received."
            )

        # User can review a listing only once
        already_reviewed = MarketReview.objects.filter(
            market_id=market,
            reviewer=user,  # <-- use 'reviewer', not 'reviewer_id'
        ).exists()

        if already_reviewed:
            raise serializers.ValidationError(
                "You have already reviewed this listing."
            )

        return attrs

    def create(self, validated_data):
        request = self.context['request']
        return MarketReview.objects.create(
            reviewer=request.user,  # <-- use 'reviewer'
            **validated_data
        )


class MarketReviewListSerializer(serializers.ModelSerializer):
    reviewer = serializers.CharField(source='reviewer.username', read_only=True)

    class Meta:
        model = MarketReview
        fields = [
            'id',
            'reviewer',
            'rating',
            'comment',
            'created_at',
        ]
