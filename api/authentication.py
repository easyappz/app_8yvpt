from typing import Optional, Tuple

from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from .models import Member
from .utils import decode_jwt


class JWTAuthentication(BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request) -> Optional[Tuple[Member, dict]]:
        auth_header = get_authorization_header(request)
        if not auth_header:
            return None

        try:
            parts = auth_header.decode("utf-8").split()
        except Exception as exc:  # noqa: BLE001
            raise AuthenticationFailed("Invalid authorization header format.") from exc

        if len(parts) == 0:
            return None

        if parts[0].lower() != self.keyword.lower():
            # Not a Bearer token header, ignore
            return None

        if len(parts) == 1:
            raise AuthenticationFailed("Invalid authorization header. No credentials provided.")
        if len(parts) > 2:
            raise AuthenticationFailed("Invalid authorization header. Token string should not contain spaces.")

        token = parts[1]
        try:
            payload = decode_jwt(token)
        except Exception as exc:  # noqa: BLE001
            raise AuthenticationFailed("Invalid or expired token.") from exc

        member_id = payload.get("member_id")
        if not member_id:
            raise AuthenticationFailed("Invalid token payload.")

        try:
            member = Member.objects.get(pk=member_id)
        except Member.DoesNotExist as exc:
            raise AuthenticationFailed("User not found.") from exc

        if not member.is_active:
            raise AuthenticationFailed("User inactive or deleted.")

        return member, payload
