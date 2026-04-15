import hashlib
import os
import hmac
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .auth import create_session_token


def hash_password(password: str, salt: str = None) -> str:
    if salt is None:
        salt = os.urandom(16).hex()
    import hashlib
    dk = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=64)
    return f"{salt}:{dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    if not stored:
        return False
    parts = stored.split(":")
    if len(parts) != 2:
        return False
    salt, expected_hash = parts
    try:
        dk = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=64)
        candidate = dk.hex()
        return hmac.compare_digest(candidate, expected_hash)
    except Exception:
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
