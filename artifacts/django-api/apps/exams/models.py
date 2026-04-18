import os
from django.db import models


class ExamAttempt(models.Model):
    STATUS_CHOICES = [
        ("IN_PROGRESS", "In Progress"),
        ("SUBMITTED", "Submitted"),
        ("TIMED_OUT", "Timed Out"),
    ]

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey("exam_users.User", on_delete=models.CASCADE, db_column="user_id")
    quiz = models.ForeignKey("exam_quizzes.Quiz", on_delete=models.CASCADE, db_column="quiz_id")
    score = models.FloatField(null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    status = models.TextField(choices=STATUS_CHOICES, default="IN_PROGRESS")

    class Meta:
        db_table = "exam_attempts"
        managed = os.environ.get("USE_SQLITE", "false").lower() == "true" or not os.environ.get("DATABASE_URL")


class ExamAnswer(models.Model):
    id = models.AutoField(primary_key=True)
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, db_column="attempt_id")
    question = models.ForeignKey("exam_quizzes.Question", on_delete=models.CASCADE, db_column="question_id")
    selected_option = models.IntegerField()
    is_correct = models.BooleanField()
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "exam_answers"
        managed = os.environ.get("USE_SQLITE", "false").lower() == "true" or not os.environ.get("DATABASE_URL")
