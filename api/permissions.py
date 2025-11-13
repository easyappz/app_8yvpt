from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Member


class IsAuthenticatedMember(BasePermission):
    message = "Authentication credentials were not provided or invalid."

    def has_permission(self, request, view) -> bool:
        return isinstance(getattr(request, "user", None), Member)


class IsOwnerOrReadOnly(BasePermission):
    message = "You do not have permission to modify this object."

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        user = getattr(request, "user", None)
        if not isinstance(user, Member):
            return False
        # Expecting obj to have 'author' attribute
        author_id = getattr(getattr(obj, "author", None), "id", None)
        return author_id == getattr(user, "id", None)
