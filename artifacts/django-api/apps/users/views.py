from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer
from config.pagination import StandardPagination
from apps.authentication.views import hash_password


def require_auth(request):
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=401)
    return None


@api_view(["GET"])
def me(request):
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=401)
    return Response(UserSerializer(request.user).data)


@api_view(["GET", "POST"])
def users_list(request):
    err = require_auth(request)
    if err:
        return err

    if request.method == "GET":
        qs = User.objects.only(
            "id", "name", "email", "role",
            "state_id", "district_id", "institution_id", "class_id", "created_at"
        )
        role = request.query_params.get("role")
        institution_id = request.query_params.get("institutionId")
        search = request.query_params.get("search", "").strip()

        if role:
            qs = qs.filter(role=role)
        if institution_id:
            qs = qs.filter(institution_id=institution_id)
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(email__icontains=search)

        qs = qs.order_by("id")

        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        if page is not None:
            return paginator.get_paginated_response(UserSerializer(page, many=True).data)

        return Response(UserSerializer(qs, many=True).data)

    data = request.data
    email = data.get("email", "").strip().lower()

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=409)

    password = data.get("password", "")
    password_hash = hash_password(password) if password else None

    user = User.objects.create(
        name=data.get("name", ""),
        email=email,
        clerk_id=email,
        password_hash=password_hash,
        role=data.get("role", "STUDENT"),
        state_id=data.get("stateId"),
        district_id=data.get("districtId"),
        institution_id=data.get("institutionId"),
        class_id=data.get("classId"),
    )
    return Response(UserSerializer(user).data, status=201)


@api_view(["PATCH"])
def user_detail(request, pk):
    err = require_auth(request)
    if err:
        return err

    update_fields = []
    try:
        user = User.objects.get(id=pk)
    except User.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    data = request.data
    field_map = {
        "name": "name",
        "role": "role",
        "stateId": "state_id",
        "districtId": "district_id",
        "institutionId": "institution_id",
        "classId": "class_id",
    }
    for key, attr in field_map.items():
        if key in data:
            setattr(user, attr, data[key])
            update_fields.append(attr)

    if update_fields:
        user.save(update_fields=update_fields)
    return Response(UserSerializer(user).data)
