import hashlib
import os
import hmac
import secrets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .auth import create_session_token


def _pbkdf2_hash(password: str, salt: str) -> str:
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 260000, dklen=32)
    return dk.hex()


def hash_password(password: str, salt: str = None) -> str:
    if salt is None:
        salt = secrets.token_hex(16)
    try:
        dk = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=64)
        return f"scrypt:{salt}:{dk.hex()}"
    except (OSError, ValueError, RuntimeError):
        # scrypt unavailable (no OpenSSL support) — fall back to PBKDF2
        return f"pbkdf2:{salt}:{_pbkdf2_hash(password, salt)}"


def verify_password(password: str, stored: str) -> bool:
    if not stored:
        return False
    parts = stored.split(":")
    if len(parts) == 3:
        algo, salt, expected = parts
        if algo == "scrypt":
            try:
                dk = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=64)
                return hmac.compare_digest(dk.hex(), expected)
            except (OSError, ValueError, RuntimeError):
                return False
        if algo == "pbkdf2":
            candidate = _pbkdf2_hash(password, salt)
            return hmac.compare_digest(candidate, expected)
        return False
    # legacy format: "salt:hash" (old scrypt without prefix)
    if len(parts) == 2:
        salt, expected = parts
        try:
            dk = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=64)
            return hmac.compare_digest(dk.hex(), expected)
        except (OSError, ValueError, RuntimeError):
            return False
    return False


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    from apps.users.models import User
    from apps.users.serializers import UserSerializer

    name = request.data.get("name", "").strip()
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")
    role = request.data.get("role", "STUDENT")

    if not name or not email or not password:
        return Response({"error": "name, email and password are required"}, status=400)

    valid_roles = ["CENTRAL", "STATE", "DISTRICT", "INSTITUTION", "STUDENT"]
    if role not in valid_roles:
        role = "STUDENT"

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already registered"}, status=409)

    password_hash = hash_password(password)
    user = User.objects.create(
        name=name,
        email=email,
        clerk_id=email,
        password_hash=password_hash,
        role=role,
        state_id=request.data.get("stateId"),
        district_id=request.data.get("districtId"),
        institution_id=request.data.get("institutionId"),
        class_id=request.data.get("classId"),
    )

    token = create_session_token(user.id, settings.SECRET_KEY)
    response = Response(UserSerializer(user).data, status=201)
    response.set_cookie(
        "exam_session",
        token,
        httponly=True,
        samesite="Lax",
        secure=not settings.DEBUG,
        max_age=60 * 60 * 24 * 7,
        path="/",
    )
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    from apps.users.models import User
    from apps.users.serializers import UserSerializer

    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")

    if not email or not password:
        return Response({"error": "email and password are required"}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Invalid email or password"}, status=401)

    if not verify_password(password, user.password_hash):
        return Response({"error": "Invalid email or password"}, status=401)

    token = create_session_token(user.id, settings.SECRET_KEY)
    response = Response(UserSerializer(user).data)
    response.set_cookie(
        "exam_session",
        token,
        httponly=True,
        samesite="Lax",
        secure=not settings.DEBUG,
        max_age=60 * 60 * 24 * 7,
        path="/",
    )
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def logout(request):
    response = Response({"message": "Logged out"})
    response.delete_cookie("exam_session", path="/")
    return response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok"})
