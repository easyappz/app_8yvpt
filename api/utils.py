from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Union

import jwt
from django.conf import settings


def create_jwt(member_id: int, username: str, exp: Union[int, datetime]) -> str:
    """
    Create a signed JWT token for a member.

    exp: either seconds from now (int) or an absolute datetime (timezone-aware preferred).
    """
    now = datetime.now(tz=timezone.utc)

    if isinstance(exp, int):
        exp_dt = now + timedelta(seconds=exp)
    elif isinstance(exp, datetime):
        exp_dt = exp
        if exp_dt.tzinfo is None:
            # Ensure timezone-aware
            exp_dt = exp_dt.replace(tzinfo=timezone.utc)
    else:
        raise TypeError("exp must be int (seconds) or datetime")

    payload: Dict[str, Any] = {
        "member_id": member_id,
        "username": username,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": exp_dt,
    }

    token = jwt.encode(
        payload,
        settings.APP_JWT_SECRET,
        algorithm=settings.APP_JWT_ALGORITHM,
    )
    # PyJWT>=2 returns str
    return token


def decode_jwt(token: str) -> Dict[str, Any]:
    """
    Decode and validate JWT token. Raises jwt exceptions if invalid/expired.
    Returns decoded payload dict.
    """
    payload = jwt.decode(
        token,
        settings.APP_JWT_SECRET,
        algorithms=[settings.APP_JWT_ALGORITHM],
    )
    return payload
