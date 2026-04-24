from rest_framework import serializers
from .models import ExamAttempt, ExamAnswer
from apps.quizzes.models import Question


class ExamAttemptSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source="user_id")
    quizId = serializers.IntegerField(source="quiz_id")
    quizTitle = serializers.SerializerMethodField()
    startedAt = serializers.DateTimeField(source="started_at", read_only=True)
    submittedAt = serializers.DateTimeField(source="submitted_at", allow_null=True)
    totalQuestions = serializers.IntegerField(source="total_questions")
    correctAnswers = serializers.IntegerField(source="correct_answers", allow_null=True)
    tabSwitches = serializers.IntegerField(source="tab_switches")

    class Meta:
        model = ExamAttempt
        fields = [
            "id", "userId", "quizId", "quizTitle", "status",
            "startedAt", "submittedAt",
            "score", "totalQuestions", "correctAnswers", "tabSwitches",
        ]

    def get_quizTitle(self, obj):
        return getattr(obj, "_quiz_title", None)


class AnswerWithQuestionSerializer(serializers.ModelSerializer):
    selectedOption = serializers.IntegerField(source="selected_option")
    isCorrect = serializers.BooleanField(source="is_correct")
    question = serializers.SerializerMethodField()

    class Meta:
        model = ExamAnswer
        fields = ["id", "selectedOption", "isCorrect", "question"]

    def get_question(self, obj):
        q = obj.question
        return {
            "question": q.text,
            "options": q.options,
            "correctAnswer": q.correct_option,
        }


class ExamAttemptDetailSerializer(ExamAttemptSerializer):
    answers = AnswerWithQuestionSerializer(many=True, read_only=True, source="examanswer_set")

    class Meta(ExamAttemptSerializer.Meta):
        fields = ExamAttemptSerializer.Meta.fields + ["answers"]


class ExamAnswerSerializer(serializers.ModelSerializer):
    attemptId = serializers.IntegerField(source="attempt_id")
    questionId = serializers.IntegerField(source="question_id")
    selectedOption = serializers.IntegerField(source="selected_option")
    isCorrect = serializers.BooleanField(source="is_correct")

    class Meta:
        model = ExamAnswer
        fields = ["id", "attemptId", "questionId", "selectedOption", "isCorrect"]
