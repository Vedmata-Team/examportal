from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
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

    user_filter = Q()
    if role == "STATE" and user.state_id:
        user_filter = Q(state_id=user.state_id)
    elif role == "DISTRICT" and user.district_id:
        user_filter = Q(district_id=user.district_id)
    elif role == "INSTITUTION" and user.institution_id:
        user_filter = Q(institution_id=user.institution_id)

    user_stats = User.objects.filter(user_filter).aggregate(
        total_users=Count("id"),
        total_students=Count("id", filter=Q(role="STUDENT")),
    )

    global_counts = {
        "totalStates": State.objects.count(),
        "totalDistricts": District.objects.count(),
        "totalInstitutions": Institution.objects.count(),
        "totalClasses": Class.objects.count(),
        "totalChapters": Chapter.objects.count(),
        "totalQuizzes": Quiz.objects.count(),
        "totalAttempts": ExamAttempt.objects.count(),
    }

    return Response({
        "totalUsers": user_stats["total_users"] or 0,
        "totalStudents": user_stats["total_students"] or 0,
        **global_counts,
    })


@api_view(["GET"])
def student_dashboard(request):
    err = require_auth(request)
    if err:
        return err

    user = request.user

    attempt_stats = ExamAttempt.objects.filter(user_id=user.id).aggregate(
        total_attempts=Count("id"),
        avg_score=Avg("score", filter=Q(status="SUBMITTED")),
    )

    recent_attempts = list(
        ExamAttempt.objects.filter(user_id=user.id)
        .only("id", "quiz_id", "status", "score", "started_at", "completed_at")
        .order_by("-started_at")[:10]
        .values("id", "quiz_id", "status", "score", "started_at", "completed_at")
    )

    available_quizzes = Quiz.objects.count()

    return Response({
        "totalAttempts": attempt_stats["total_attempts"] or 0,
        "averageScore": round(attempt_stats["avg_score"] or 0, 1),
        "recentAttempts": recent_attempts,
        "availableQuizzes": available_quizzes,
    })


@api_view(["GET"])
def recent_activity(request):
    err = require_auth(request)
    if err:
        return err

    user = request.user
    role = user.role
    limit = min(int(request.query_params.get("limit", 20)), 100)

    if role in ["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"]:
        attempts_qs = (
            ExamAttempt.objects
            .only("id", "user_id", "quiz_id", "status", "score", "started_at")
            .order_by("-started_at")[:limit]
        )
    else:
        attempts_qs = (
            ExamAttempt.objects
            .filter(user_id=user.id)
            .only("id", "user_id", "quiz_id", "status", "score", "started_at")
            .order_by("-started_at")[:limit]
        )

    attempt_list = list(attempts_qs)

    user_ids = list({a.user_id for a in attempt_list})
    quiz_ids = list({a.quiz_id for a in attempt_list})

    users_map = {
        u["id"]: u["name"]
        for u in User.objects.filter(id__in=user_ids).values("id", "name")
    }
    quizzes_map = {
        q["id"]: q["title"]
        for q in Quiz.objects.filter(id__in=quiz_ids).values("id", "title")
    }

    activity = [
        {
            "id": a.id,
            "type": "exam_attempt",
            "userId": a.user_id,
            "userName": users_map.get(a.user_id, "Unknown"),
            "quizId": a.quiz_id,
            "quizTitle": quizzes_map.get(a.quiz_id, "Unknown Quiz"),
            "status": a.status,
            "score": a.score,
            "timestamp": a.started_at.isoformat() if a.started_at else None,
        }
        for a in attempt_list
    ]

    return Response(activity)
