from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import State, District, Institution
from .serializers import StateSerializer, DistrictSerializer, InstitutionSerializer


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
        states = State.objects.all().order_by("name")
        return Response(StateSerializer(states, many=True).data)

    data = request.data
    state = State.objects.create(name=data["name"], code=data["code"])
    return Response(StateSerializer(state).data, status=201)


@api_view(["GET", "POST"])
def districts_list(request):
    err = require_auth(request)
    if err:
        return err

    if request.method == "GET":
        qs = District.objects.select_related("state").all()
        state_id = request.query_params.get("stateId")
        if state_id:
            qs = qs.filter(state_id=state_id)
        return Response(DistrictSerializer(qs, many=True).data)

    data = request.data
    district = District.objects.create(
        name=data["name"],
        state_id=data["stateId"],
    )
    district = District.objects.select_related("state").get(id=district.id)
    return Response(DistrictSerializer(district).data, status=201)


@api_view(["GET", "POST"])
def institutions_list(request):
    err = require_auth(request)
    if err:
        return err

    if request.method == "GET":
        qs = Institution.objects.select_related("district__state").all()
        district_id = request.query_params.get("districtId")
        if district_id:
            qs = qs.filter(district_id=district_id)
        return Response(InstitutionSerializer(qs, many=True).data)

    data = request.data
    institution = Institution.objects.create(
        name=data["name"],
        district_id=data["districtId"],
    )
    institution = Institution.objects.select_related("district__state").get(id=institution.id)
    return Response(InstitutionSerializer(institution).data, status=201)
