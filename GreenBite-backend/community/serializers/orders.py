from django.utils import timezone
from rest_framework import serializers

from community.models import (
    MarketOrder,
    MarketOrderAddress,
    ComMarket,
)


class MarketOrderAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketOrderAddress
        exclude = ['id', 'order', 'created_at']

    def validate_phone_number(self, value):
        if len(value) < 11:
            raise serializers.ValidationError("Invalid phone number.")
        return value


class MarketOrderCreateSerializer(serializers.ModelSerializer):
    address = MarketOrderAddressSerializer(write_only=True)

    class Meta:
        model = MarketOrder
        fields = [
            'id',
            'market',
            'quantity',
            'unit',
            'payment_method',
            'buyer_note',
            'address',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        request = self.context['request']
        user = request.user

        market = attrs.get('market')
        quantity = attrs.get('quantity')
        payment_method = attrs.get('payment_method')

        # Listing must be ACTIVE
        if market.status != 'ACTIVE':
            raise serializers.ValidationError("Listing is not active.")

        # Listing must not be expired
        if market.available_until and market.available_until < timezone.now().date():
            raise serializers.ValidationError("Listing has expired.")

        # Buyer cannot be seller
        if market.seller == user:
            raise serializers.ValidationError("You cannot buy your own listing.")

        # Quantity validation
        if quantity < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")

        if quantity > market.quantity:
            raise serializers.ValidationError(
                "Requested quantity exceeds available quantity."
            )

        # Payment method validation
        if payment_method != 'COD':
            raise serializers.ValidationError(
                "Only Cash on Delivery (COD) is supported."
            )

        return attrs

    def create(self, validated_data):
        address_data = validated_data.pop('address')
        request = self.context['request']
        market = validated_data['market']

        order = MarketOrder.objects.create(
            buyer=request.user,
            seller=market.seller,
            total_price=market.price * validated_data['quantity'],
            **validated_data
        )

        MarketOrderAddress.objects.create(
            order=order,
            **address_data
        )

        return order


class MarketOrderAcceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketOrder
        fields = ['id']
        read_only_fields = ['id']

    def validate(self, attrs):
        order = self.instance

        if order.status != 'PENDING':
            raise serializers.ValidationError(
                "Only pending orders can be accepted."
            )

        return attrs


class MarketOrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketOrder
        fields = ['status']

    def validate_status(self, value):
        order = self.instance

        if order.status == 'DELIVERED':
            raise serializers.ValidationError(
                "Delivered orders cannot be modified."
            )

        if order.status == 'CANCELLED':
            raise serializers.ValidationError(
                "Cancelled orders cannot be reactivated."
            )

        allowed_transitions = {
            'PENDING': ['CANCELLED', 'ACCEPTED'],
            'ACCEPTED': ['DELIVERED'],
        }

        if value not in allowed_transitions.get(order.status, []):
            raise serializers.ValidationError(
                f"Invalid status transition from {order.status} to {value}."
            )

        return value


class MarketOrderReadSerializer(serializers.ModelSerializer):
    address = MarketOrderAddressSerializer(read_only=True)
    market_title = serializers.CharField(
        source='market.title',
        read_only=True
    )

    class Meta:
        model = MarketOrder
        fields = [
            'id',
            'market_title',
            'quantity',
            'unit',
            'total_price',
            'status',
            'payment_method',
            'buyer_note',
            'created_at',
            'address',
        ]
