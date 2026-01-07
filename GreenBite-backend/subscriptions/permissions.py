from rest_framework.permissions import BasePermission


class IsSubscribed(BasePermission):
    message = "Active subscription required"

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        subscription = getattr(user, "subscription", None)
        return subscription and subscription.is_active
