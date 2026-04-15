from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSerializer


@api_view(["GET"])
def me(request):
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=401)
    return Response(UserSerializer(request.user).data)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def users_list(request):
    if request.method == "GET":
        if not request.user or not request.user.is_authenticated:
            return Response({"error": "Unauthorized"}, status=401)

        qs = User.objects.all()
        role = request.query_params.get("role")
        institution_id = request.query_params.get("institutionId")

        if role:
            qs = qs.filter(role=role)
        if institution_id:
            qs = qs.filter(institution_id=institution_id)

        return Response(UserSerializer(qs, many=True).data)

    if request.method == "POST":
        if not request.user or not request.user.is_authenticated:
            return Response({"error": "Unauthorized"}, status=401)

        data = request.data
        email = data.get("email", "").strip().lower()

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=409)

        user = User.objects.create(
            name=data.get("name", ""),
            email=email,
            clerk_id=email,
            role=data.get("role", "STUDENT"),
            state_id=data.get("stateId"),
            district_id=data.get("districtId"),
            institution_id=data.get("institutionId"),
            class_id=data.get("classId"),
        )
        return Response(UserSerializer(user).data, status=201)


@api_view(["PATCH"])
def user_detail(request, pk):
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=401)

    try:
        user = User.objects.get(id=pk)
    except User.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    data = request.data
    if "name" in data:
        user.name = data["name"]
    if "role" in data:
        user.role = data["role"]
    if "stateId" in data:
        user.state_id = data["stateId"]
    if "districtId" in data:
        user.district_id = data["districtId"]
    if "institutionId" in data:
        user.institution_id = data["institutionId"]
    if "classId" in data:
        user.class_id = data["classId"]

    user.save()
    return Response(UserSerializer(user).data)
