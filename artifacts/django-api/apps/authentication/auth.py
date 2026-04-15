import hmac
import hashlib
import base64
import json
import time
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings


def _b64_decode(s):
    padding = 4 - len(s) % 4
    if padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s)


def _b64_encode(b):
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def sign(payload: str, secret: str) -> str:
    return hmac.new(
        secret.encode(), payload.encode(), hashlib.sha256
    ).digest()


def create_session_token(user_id: int, secret: str) -> str:
    exp = int(time.time()) + 60 * 60 * 24 * 7
    payload_bytes = json.dumps({"userId": user_id, "exp": exp}).encode()
    payload_b64 = _b64_encode(payload_bytes)
    sig = hmac.new(secret.encode(), payload_b64.encode(), hashlib.sha256).digest()
    sig_b64 = _b64_encode(sig)
    return f"{payload_b64}.{sig_b64}"


def verify_session_token(token: str, secret: str):
    if not token:
        return None
    parts = token.split(".")
    if len(parts) != 2:
        return None
    payload_b64, sig_b64 = parts
    expected_sig = _b64_encode(
        hmac.new(secret.encode(), payload_b64.encode(), hashlib.sha256).digest()
    )
    if not hmac.compare_digest(expected_sig, sig_b64):
        return None
    try:
        data = json.loads(_b64_decode(payload_b64))
        user_id = data.get("userId")
        exp = data.get("exp")
        if not isinstance(user_id, int) or not isinstance(exp, int):
            return None
        if exp < int(time.time()):
            return None
        return user_id
    except Exception:
        return None


class CookieJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get("exam_session")
        if not token:
            return None

        secret = settings.SECRET_KEY
        user_id = verify_session_token(token, secret)
        if user_id is None:
            return None

        from apps.users.models import User
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found")

        return (user, token)

    def authenticate_header(self, request):
        return "Cookie realm=\"api\""
