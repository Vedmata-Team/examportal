from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import State, District, Institution
from .serializers import StateSerializer, DistrictSerializer, InstitutionSerializer
from config.pagination import StandardPagination


def require_auth(request):
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=401)
    return None


@api_view(["GET", "POST"])
def states_list(request):
    err = require_auth(request)
    if err:
        return err

    if request.method == "GET":
        qs = State.objects.only("id", "name", "code", "created_at").order_by("name")
        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        if page is not None:
            return paginator.get_paginated_response(StateSerializer(page, many=True).data)
        return Response(StateSerializer(qs, many=True).data)

    data = request.data
    state = State.objects.create(name=data["name"], code=data["code"])
    return Response(StateSerializer(state).data, status=201)


@api_view(["GET", "POST"])
def districts_list(request):
    err = require_auth(request)
    if err:
        return err

    if request.method == "GET":
        qs = District.objects.select_related("state").only(
            "id", "name", "created_at", "state__id", "state__name"
        )
        state_id = request.query_params.get("stateId")
        search = request.query_params.get("search", "").strip()
        if state_id:
            qs = qs.filter(state_id=state_id)
        if search:
            qs = qs.filter(name__icontains=search)
        qs = qs.order_by("state__name", "name")

        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        if page is not None:
            return paginator.get_paginated_response(DistrictSerializer(page, many=True).data)
        return Response(DistrictSerializer(qs, many=True).data)

    data = request.data
    district = District.objects.select_related("state").get(
        id=District.objects.create(name=data["name"], state_id=data["stateId"]).id
    )
    return Response(DistrictSerializer(district).data, status=201)


@api_view(["GET", "POST"])
def institutions_list(request):
    err = require_auth(request)
    if err:
        return err

    if request.method == "GET":
        qs = Institution.objects.select_related("district__state").only(
            "id", "name", "created_at",
            "district__id", "district__name",
            "district__state__id", "district__state__name",
        )
        district_id = request.query_params.get("districtId")
        state_id = request.query_params.get("stateId")
        search = request.query_params.get("search", "").strip()
        if district_id:
            qs = qs.filter(district_id=district_id)
        if state_id:
            qs = qs.filter(district__state_id=state_id)
        if search:
            qs = qs.filter(name__icontains=search)
        qs = qs.order_by("name")

        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        if page is not None:
            return paginator.get_paginated_response(InstitutionSerializer(page, many=True).data)
        return Response(InstitutionSerializer(qs, many=True).data)

    data = request.data
    institution = Institution.objects.select_related("district__state").get(
        id=Institution.objects.create(name=data["name"], district_id=data["districtId"]).id
    )
    return Response(InstitutionSerializer(institution).data, status=201)
