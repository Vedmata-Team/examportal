from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    clerkId = serializers.CharField(source="clerk_id", read_only=True)
    stateId = serializers.IntegerField(source="state_id", allow_null=True, required=False)
    districtId = serializers.IntegerField(source="district_id", allow_null=True, required=False)
    institutionId = serializers.IntegerField(source="institution_id", allow_null=True, required=False)
    classId = serializers.IntegerField(source="class_id", allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "clerkId", "name", "email", "role",
            "stateId", "districtId", "institutionId", "classId",
            "createdAt",
        ]
