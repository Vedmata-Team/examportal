from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Class, Chapter, Content
from .serializers import ClassSerializer, ChapterSerializer, ChapterWithContentSerializer, ContentSerializer


def require_auth(request):
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=401)
    return None


@api_view(["GET", "POST"])
def classes_list(request):
    err = require_auth(request)
    if err:
        return err

    if request.method == "GET":
        classes = Class.objects.all().order_by("name")
        return Response(ClassSerializer(classes, many=True).data)

    data = request.data
    cls = Class.objects.create(
        name=data["name"],
        description=data.get("description"),
    )
    return Response(ClassSerializer(cls).data, status=201)


@api_view(["GET", "POST"])
def chapters_list(request):
    err = require_auth(request)
    if err:
        return err

    if request.method == "GET":
        qs = Chapter.objects.select_related("class_ref").all()
        class_id = request.query_params.get("classId")
        if class_id:
            qs = qs.filter(class_ref_id=class_id)
        return Response(ChapterSerializer(qs, many=True).data)

    data = request.data
    chapter = Chapter.objects.create(
        title=data["title"],
        class_ref_id=data["classId"],
        order_index=data.get("orderIndex", 0),
    )
    chapter = Chapter.objects.select_related("class_ref").get(id=chapter.id)
    return Response(ChapterSerializer(chapter).data, status=201)


@api_view(["GET"])
def chapter_detail(request, pk):
    err = require_auth(request)
    if err:
        return err

    try:
        chapter = Chapter.objects.prefetch_related("content_set").select_related("class_ref").get(id=pk)
    except Chapter.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    return Response(ChapterWithContentSerializer(chapter).data)


@api_view(["POST"])
def content_create(request):
    err = require_auth(request)
    if err:
        return err

    data = request.data
    content = Content.objects.create(
        chapter_id=data["chapterId"],
        html_content=data["htmlContent"],
        min_read_time=data.get("minReadTime", 60),
        order_index=data.get("orderIndex", 0),
    )
    return Response(ContentSerializer(content).data, status=201)


@api_view(["PATCH"])
def content_detail(request, pk):
    err = require_auth(request)
    if err:
        return err

    try:
        content = Content.objects.get(id=pk)
    except Content.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    data = request.data
    if "htmlContent" in data:
        content.html_content = data["htmlContent"]
    if "minReadTime" in data:
        content.min_read_time = data["minReadTime"]
    if "orderIndex" in data:
        content.order_index = data["orderIndex"]
    content.save()
    return Response(ContentSerializer(content).data)
