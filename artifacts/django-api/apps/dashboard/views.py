from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.users.models import User
from apps.geo.models import State, District, Institution
from apps.academics.models import Class, Chapter
from apps.quizzes.models import Quiz
from apps.exams.models import ExamAttempt


def require_auth(request):
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=401)
    return None


@api_view(["GET"])
def admin_dashboard(request):
    err = require_auth(request)
    if err:
        return err

    user = request.user
    role = user.role

    total_users = User.objects.count()
    total_students = User.objects.filter(role="STUDENT").count()
    total_quizzes = Quiz.objects.count()
    total_attempts = ExamAttempt.objects.count()

    if role == "STATE" and user.state_id:
        total_users = User.objects.filter(state_id=user.state_id).count()
        total_students = User.objects.filter(role="STUDENT", state_id=user.state_id).count()
    elif role == "DISTRICT" and user.district_id:
        total_users = User.objects.filter(district_id=user.district_id).count()
        total_students = User.objects.filter(role="STUDENT", district_id=user.district_id).count()
    elif role == "INSTITUTION" and user.institution_id:
        total_users = User.objects.filter(institution_id=user.institution_id).count()
        total_students = User.objects.filter(role="STUDENT", institution_id=user.institution_id).count()

    return Response({
        "totalUsers": total_users,
        "totalStudents": total_students,
        "totalQuizzes": total_quizzes,
        "totalAttempts": total_attempts,
        "totalStates": State.objects.count(),
        "totalDistricts": District.objects.count(),
        "totalInstitutions": Institution.objects.count(),
        "totalClasses": Class.objects.count(),
        "totalChapters": Chapter.objects.count(),
    })


@api_view(["GET"])
def student_dashboard(request):
    err = require_auth(request)
    if err:
        return err

    user = request.user
    attempts = ExamAttempt.objects.filter(user_id=user.id)
    total_attempts = attempts.count()
    submitted = attempts.filter(status="SUBMITTED")
    avg_score = 0
    if submitted.exists():
        scores = [a.score for a in submitted if a.score is not None]
        if scores:
            avg_score = round(sum(scores) / len(scores))

    recent_attempts = list(
        attempts.order_by("-started_at")[:5].values(
            "id", "quiz_id", "status", "score", "started_at", "submitted_at"
        )
    )

    return Response({
        "totalAttempts": total_attempts,
        "averageScore": avg_score,
        "recentAttempts": recent_attempts,
        "availableQuizzes": Quiz.objects.count(),
    })


@api_view(["GET"])
def recent_activity(request):
    err = require_auth(request)
    if err:
        return err

    user = request.user
    role = user.role

    if role in ["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"]:
        attempts = ExamAttempt.objects.order_by("-started_at")[:10]
    else:
        attempts = ExamAttempt.objects.filter(user_id=user.id).order_by("-started_at")[:10]

    activity = []
    for attempt in attempts:
        try:
            u = User.objects.get(id=attempt.user_id)
            user_name = u.name
        except User.DoesNotExist:
            user_name = "Unknown"

        try:
            quiz = Quiz.objects.get(id=attempt.quiz_id)
            quiz_title = quiz.title
        except Quiz.DoesNotExist:
            quiz_title = "Unknown Quiz"

        activity.append({
            "id": attempt.id,
            "type": "exam_attempt",
            "userId": attempt.user_id,
            "userName": user_name,
            "quizId": attempt.quiz_id,
            "quizTitle": quiz_title,
            "status": attempt.status,
            "score": attempt.score,
            "timestamp": attempt.started_at.isoformat() if attempt.started_at else None,
        })

    return Response(activity)
