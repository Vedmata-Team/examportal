import os
from django.db import models


class Quiz(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.TextField()
    description = models.TextField(null=True, blank=True)
    time_limit_minutes = models.IntegerField(default=60)
    passing_percentage = models.FloatField(default=40.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "quizzes"
        managed = os.environ.get("USE_SQLITE", "false").lower() == "true" or not os.environ.get("DATABASE_URL")

    def __str__(self):
        return self.title


class QuizSection(models.Model):
    id = models.AutoField(primary_key=True)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, db_column="quiz_id")
    title = models.TextField()
    order_index = models.IntegerField(default=0)

    class Meta:
        db_table = "quiz_sections"
        managed = os.environ.get("USE_SQLITE", "false").lower() == "true" or not os.environ.get("DATABASE_URL")

    def __str__(self):
        return self.title


class Question(models.Model):
    id = models.AutoField(primary_key=True)
    section = models.ForeignKey(QuizSection, on_delete=models.CASCADE, db_column="section_id")
    text = models.TextField()
    options = models.JSONField()
    correct_option = models.IntegerField()
    explanation = models.TextField(null=True, blank=True)
    order_index = models.IntegerField(default=0)

    class Meta:
        db_table = "questions"
        managed = os.environ.get("USE_SQLITE", "false").lower() == "true" or not os.environ.get("DATABASE_URL")

    def __str__(self):
        return self.text[:60]
