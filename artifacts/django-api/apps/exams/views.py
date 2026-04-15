from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import ExamAttempt, ExamAnswer
from .serializers import ExamAttemptSerializer
from apps.quizzes.models import Question


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
    answers = data.get("answers", [])
    tab_switches = data.get("tabSwitches", 0)

    try:
        attempt = ExamAttempt.objects.get(id=attempt_id, user_id=request.user.id)
    except ExamAttempt.DoesNotExist:
        return Response({"error": "Attempt not found"}, status=404)

    correct_count = 0
    answer_records = []
    for ans in answers:
        question_id = ans.get("questionId")
        selected_option = ans.get("selectedOption")
        try:
            question = Question.objects.get(id=question_id)
            is_correct = question.correct_answer == selected_option
        except Question.DoesNotExist:
            is_correct = False

        if is_correct:
            correct_count += 1

        answer_records.append(ExamAnswer(
            attempt=attempt,
            question_id=question_id,
            selected_option=selected_option if selected_option is not None else -1,
            is_correct=is_correct,
        ))

    ExamAnswer.objects.bulk_create(answer_records)

    total = attempt.total_questions or len(answers)
    score = round((correct_count / total * 100)) if total > 0 else 0

    attempt.submitted_at = timezone.now()
    attempt.status = "SUBMITTED"
    attempt.correct_answers = correct_count
    attempt.score = score
    attempt.tab_switches = tab_switches
    attempt.save()

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

    qs = ExamAttempt.objects.filter(user_id=request.user.id)
    quiz_id = request.query_params.get("quizId")
    if quiz_id:
        qs = qs.filter(quiz_id=quiz_id)

    return Response(ExamAttemptSerializer(qs, many=True).data)
