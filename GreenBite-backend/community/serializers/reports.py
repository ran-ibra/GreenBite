from rest_framework import serializers
from community.models import CommunityReport, ComMarket
from accounts.models import User


class CommunityReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityReport
        fields = [
            'id',
            'target_type',
            'target_id',
            'reason',
            'details',
        ]
        read_only_fields = ['id']

    def validate_target_type(self, value):
        allowed_types = ['MARKET', 'USER']
        if value not in allowed_types:
            raise serializers.ValidationError(
                "target_type must be either 'MARKET' or 'USER'."
            )
        return value

    def validate(self, attrs):
        target_type = attrs.get('target_type')
        target_id = attrs.get('target_id')
        reporter = self.context['request'].user

        # Validate target existence
        if target_type == 'MARKET':
            if not ComMarket.objects.filter(id=target_id).exists():
                raise serializers.ValidationError(
                    "The marketplace listing you are reporting does not exist."
                )

        elif target_type == 'USER':
            if not User.objects.filter(id=target_id).exists():
                raise serializers.ValidationError(
                    "The user you are reporting does not exist."
                )

        # Self-report check (only relevant for USER reports)
        if target_type == 'USER' and target_id == reporter.id:
            raise serializers.ValidationError("You cannot report yourself.")

        # Prevent duplicate reports by same user on same target
        duplicate_exists = CommunityReport.objects.filter(
            reporter=reporter,
            target_type=target_type,
            target_id=target_id,
        ).exists()

        if duplicate_exists:
            raise serializers.ValidationError(
                "You have already reported this target."
            )

        return attrs

    def create(self, validated_data):
        reporter = self.context['request'].user
        return CommunityReport.objects.create(
            reporter=reporter,  # <-- use 'reporter', not 'reporter_id'
            **validated_data
        )
