from rest_framework import serializers
from .models import Quiz, QuizSection, Question


class QuestionSerializer(serializers.ModelSerializer):
    sectionId = serializers.IntegerField(source="section_id")
    correctAnswer = serializers.IntegerField(source="correct_answer")
    orderIndex = serializers.IntegerField(source="order_index")

    class Meta:
        model = Question
        fields = ["id", "sectionId", "question", "options", "correctAnswer", "orderIndex"]


class QuizSectionSerializer(serializers.ModelSerializer):
    quizId = serializers.IntegerField(source="quiz_id")
    timeLimit = serializers.IntegerField(source="time_limit")
    orderIndex = serializers.IntegerField(source="order_index")

    class Meta:
        model = QuizSection
        fields = ["id", "quizId", "title", "timeLimit", "orderIndex"]


class QuizSectionWithQuestionsSerializer(serializers.ModelSerializer):
    quizId = serializers.IntegerField(source="quiz_id")
    timeLimit = serializers.IntegerField(source="time_limit")
    orderIndex = serializers.IntegerField(source="order_index")
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = QuizSection
        fields = ["id", "quizId", "title", "timeLimit", "orderIndex", "questions"]


class QuizSerializer(serializers.ModelSerializer):
    chapterId = serializers.IntegerField(source="chapter_id", allow_null=True)
    chapterTitle = serializers.SerializerMethodField()
    startTime = serializers.DateTimeField(source="start_time", allow_null=True)
    endTime = serializers.DateTimeField(source="end_time", allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Quiz
        fields = ["id", "title", "chapterId", "chapterTitle", "type", "startTime", "endTime", "createdAt"]

    def get_chapterTitle(self, obj):
        return None


class QuizWithDetailsSerializer(serializers.ModelSerializer):
    chapterId = serializers.IntegerField(source="chapter_id", allow_null=True)
    startTime = serializers.DateTimeField(source="start_time", allow_null=True)
    endTime = serializers.DateTimeField(source="end_time", allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    sections = QuizSectionWithQuestionsSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ["id", "title", "chapterId", "type", "startTime", "endTime", "createdAt", "sections"]
