from rest_framework import serializers
from .models import Class, Chapter, Content


class ClassSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Class
        fields = ["id", "name", "description", "createdAt"]


class ContentSerializer(serializers.ModelSerializer):
    chapterId = serializers.IntegerField(source="chapter_id")
    htmlContent = serializers.CharField(source="html_content")
    minReadTime = serializers.IntegerField(source="min_read_time")
    orderIndex = serializers.IntegerField(source="order_index")

    class Meta:
        model = Content
        fields = ["id", "chapterId", "htmlContent", "minReadTime", "orderIndex"]


class ChapterSerializer(serializers.ModelSerializer):
    classId = serializers.IntegerField(source="class_ref_id")
    className = serializers.CharField(source="class_ref.name", read_only=True)
    orderIndex = serializers.IntegerField(source="order_index")
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Chapter
        fields = ["id", "title", "classId", "className", "orderIndex", "createdAt"]


class ChapterWithContentSerializer(serializers.ModelSerializer):
    classId = serializers.IntegerField(source="class_ref_id")
    className = serializers.CharField(source="class_ref.name", read_only=True)
    orderIndex = serializers.IntegerField(source="order_index")
    content = ContentSerializer(many=True, read_only=True, source="content_set")

    class Meta:
        model = Chapter
        fields = ["id", "title", "classId", "className", "orderIndex", "content"]
