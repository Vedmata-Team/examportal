from rest_framework import serializers
from .models import State, District, Institution


class StateSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = State
        fields = ["id", "name", "code", "createdAt"]


class DistrictSerializer(serializers.ModelSerializer):
    stateId = serializers.IntegerField(source="state_id")
    stateName = serializers.CharField(source="state.name", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = District
        fields = ["id", "name", "stateId", "stateName", "createdAt"]


class InstitutionSerializer(serializers.ModelSerializer):
    districtId = serializers.IntegerField(source="district_id")
    districtName = serializers.CharField(source="district.name", read_only=True)
    stateName = serializers.CharField(source="district.state.name", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Institution
        fields = ["id", "name", "districtId", "districtName", "stateName", "createdAt"]
