from rest_framework import serializers
from .models import ExamAttempt, ExamAnswer


class ExamAttemptSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source="user_id")
    quizId = serializers.IntegerField(source="quiz_id")
    startedAt = serializers.DateTimeField(source="started_at", read_only=True)
    submittedAt = serializers.DateTimeField(source="submitted_at", allow_null=True)
    totalQuestions = serializers.IntegerField(source="total_questions")
    correctAnswers = serializers.IntegerField(source="correct_answers", allow_null=True)
    tabSwitches = serializers.IntegerField(source="tab_switches")

    class Meta:
        model = ExamAttempt
        fields = [
            "id", "userId", "quizId", "status",
            "startedAt", "submittedAt",
            "score", "totalQuestions", "correctAnswers", "tabSwitches",
        ]


class ExamAnswerSerializer(serializers.ModelSerializer):
    attemptId = serializers.IntegerField(source="attempt_id")
    questionId = serializers.IntegerField(source="question_id")
    selectedOption = serializers.IntegerField(source="selected_option")
    isCorrect = serializers.BooleanField(source="is_correct")

    class Meta:
        model = ExamAnswer
        fields = ["id", "attemptId", "questionId", "selectedOption", "isCorrect"]
