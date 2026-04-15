from django.db import models


class ExamAttempt(models.Model):
    STATUS_CHOICES = [
        ("IN_PROGRESS", "In Progress"),
        ("SUBMITTED", "Submitted"),
        ("TIMED_OUT", "Timed Out"),
    ]

    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    quiz_id = models.IntegerField()
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score = models.IntegerField(null=True, blank=True)
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(null=True, blank=True)
    tab_switches = models.IntegerField(default=0)
    status = models.TextField(choices=STATUS_CHOICES, default="IN_PROGRESS")

    class Meta:
        db_table = "exam_attempts"
        managed = False


class ExamAnswer(models.Model):
    id = models.AutoField(primary_key=True)
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, db_column="attempt_id", related_name="answers")
    question_id = models.IntegerField()
    selected_option = models.IntegerField()
    is_correct = models.BooleanField(default=False)

    class Meta:
        db_table = "exam_answers"
        managed = False
