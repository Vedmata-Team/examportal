from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count
from .models import Quiz, QuizSection, Question
from .serializers import (
    QuizSerializer, QuizWithDetailsSerializer,
    QuizSectionSerializer, QuestionSerializer
)
from config.pagination import StandardPagination


def require_auth(request):
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=401)
    return None


@api_view(["GET", "POST"])
def quizzes_list(request):
    err = require_auth(request)
    if err:
        return err

    if request.method == "GET":
        qs = Quiz.objects.select_related("chapter").annotate(
            total_questions_count=Count("sections__questions")
        ).only(
            "id", "title", "chapter_id", "type", "start_time", "end_time", "created_at"
        )
        chapter_id = request.query_params.get("chapterId")
        quiz_type = request.query_params.get("type")
        search = request.query_params.get("search", "").strip()
        if chapter_id:
            qs = qs.filter(chapter_id=chapter_id)
        if quiz_type:
            qs = qs.filter(type=quiz_type)
        if search:
            qs = qs.filter(title__icontains=search)
        qs = qs.order_by("-created_at")

        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        if page is not None:
            return paginator.get_paginated_response(QuizSerializer(page, many=True).data)
        return Response(QuizSerializer(qs, many=True).data)

    data = request.data
    quiz = Quiz.objects.create(
        title=data["title"],
        chapter_id=data.get("chapterId"),
        type=data.get("type", "CHAPTER"),
        start_time=data.get("startTime"),
        end_time=data.get("endTime"),
    )
    return Response(QuizSerializer(quiz).data, status=201)


@api_view(["GET"])
def quiz_detail(request, pk):
    err = require_auth(request)
    if err:
        return err

    try:
        quiz = (
            Quiz.objects
            .prefetch_related(
                "sections",
                "sections__questions",
            )
            .get(id=pk)
        )
    except Quiz.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    return Response(QuizWithDetailsSerializer(quiz).data)


@api_view(["POST"])
def quiz_sections_create(request):
    err = require_auth(request)
    if err:
        return err

    data = request.data
    section = QuizSection.objects.create(
        quiz_id=data["quizId"],
        title=data["title"],
        time_limit=data.get("timeLimit", 300),
        order_index=data.get("orderIndex", 0),
    )
    return Response(QuizSectionSerializer(section).data, status=201)


@api_view(["POST"])
def questions_create(request):
    err = require_auth(request)
    if err:
        return err

    data = request.data

    if isinstance(data, list):
        questions = [
            Question(
                section_id=q["sectionId"],
                text=q["question"],
                options=q["options"],
                correct_option=q["correctAnswer"],
                order_index=q.get("orderIndex", i),
            )
            for i, q in enumerate(data)
        ]
        Question.objects.bulk_create(questions)
        return Response(QuestionSerializer(questions, many=True).data, status=201)

    question = Question.objects.create(
        section_id=data["sectionId"],
        text=data["question"],
        options=data["options"],
        correct_option=data["correctAnswer"],
        order_index=data.get("orderIndex", 0),
    )
    return Response(QuestionSerializer(question).data, status=201)
