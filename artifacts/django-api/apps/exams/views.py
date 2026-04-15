from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from .models import ExamAttempt, ExamAnswer
from .serializers import ExamAttemptSerializer
from apps.quizzes.models import Question
from config.pagination import StandardPagination


def require_auth(request):
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=401)
    return None


@api_view(["POST"])
def start_exam(request):
    err = require_auth(request)
    if err:
        return err

    data = request.data
    quiz_id = data.get("quizId")
    if not quiz_id:
        return Response({"error": "quizId is required"}, status=400)

    total_questions = Question.objects.filter(section__quiz_id=quiz_id).count()

    attempt = ExamAttempt.objects.create(
        user_id=request.user.id,
        quiz_id=quiz_id,
        total_questions=total_questions,
        status="IN_PROGRESS",
    )
    return Response(ExamAttemptSerializer(attempt).data, status=201)


@api_view(["POST"])
def submit_exam(request):
    err = require_auth(request)
    if err:
        return err

    data = request.data
    attempt_id = data.get("attemptId")
    answers_data = data.get("answers", [])
    tab_switches = data.get("tabSwitches", 0)

    try:
        attempt = ExamAttempt.objects.get(id=attempt_id, user_id=request.user.id)
    except ExamAttempt.DoesNotExist:
        return Response({"error": "Attempt not found"}, status=404)

    if attempt.status != "IN_PROGRESS":
        return Response({"error": "Exam already submitted"}, status=400)

    question_ids = [a.get("questionId") for a in answers_data if a.get("questionId")]
    questions_map = {
        q.id: q.correct_answer
        for q in Question.objects.filter(id__in=question_ids).only("id", "correct_answer")
    }

    correct_count = 0
    answer_records = []
    for ans in answers_data:
        q_id = ans.get("questionId")
        selected = ans.get("selectedOption")
        if selected is None:
            selected = -1
        is_correct = questions_map.get(q_id) == selected
        if is_correct:
            correct_count += 1
        answer_records.append(ExamAnswer(
            attempt=attempt,
            question_id=q_id,
            selected_option=selected,
            is_correct=is_correct,
        ))

    total = attempt.total_questions or len(answers_data)
    score = round(correct_count / total * 100) if total > 0 else 0

    with transaction.atomic():
        ExamAnswer.objects.bulk_create(answer_records, batch_size=500)
        ExamAttempt.objects.filter(id=attempt.id).update(
            submitted_at=timezone.now(),
            status="SUBMITTED",
            correct_answers=correct_count,
            score=score,
            tab_switches=tab_switches,
        )

    return Response({
        "attemptId": attempt.id,
        "score": score,
        "correctAnswers": correct_count,
        "totalQuestions": total,
        "status": "SUBMITTED",
    })


@api_view(["GET"])
def list_attempts(request):
    err = require_auth(request)
    if err:
        return err

    qs = ExamAttempt.objects.filter(user_id=request.user.id).only(
        "id", "user_id", "quiz_id", "status", "score",
        "total_questions", "correct_answers", "tab_switches",
        "started_at", "submitted_at",
    ).order_by("-started_at")

    quiz_id = request.query_params.get("quizId")
    if quiz_id:
        qs = qs.filter(quiz_id=quiz_id)

    paginator = StandardPagination()
    page = paginator.paginate_queryset(qs, request)
    if page is not None:
        return paginator.get_paginated_response(ExamAttemptSerializer(page, many=True).data)
    return Response(ExamAttemptSerializer(qs, many=True).data)


@api_view(["GET"])
def attempt_detail(request, pk):
    err = require_auth(request)
    if err:
        return err

    try:
        attempt = ExamAttempt.objects.get(id=pk, user_id=request.user.id)
    except ExamAttempt.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    return Response(ExamAttemptSerializer(attempt).data)
