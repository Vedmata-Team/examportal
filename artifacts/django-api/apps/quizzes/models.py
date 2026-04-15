from django.db import models


class Quiz(models.Model):
    QUIZ_TYPE_CHOICES = [
        ("CHAPTER", "Chapter"),
        ("MOCK", "Mock"),
        ("NATIONAL", "National"),
    ]

    id = models.AutoField(primary_key=True)
    title = models.TextField()
    chapter_id = models.IntegerField(null=True, blank=True)
    type = models.TextField(choices=QUIZ_TYPE_CHOICES, default="CHAPTER")
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "quizzes"
        managed = False

    def __str__(self):
        return self.title


class QuizSection(models.Model):
    id = models.AutoField(primary_key=True)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, db_column="quiz_id", related_name="sections")
    title = models.TextField()
    time_limit = models.IntegerField(default=300)
    order_index = models.IntegerField(default=0)

    class Meta:
        db_table = "quiz_sections"
        managed = False

    def __str__(self):
        return self.title


class Question(models.Model):
    id = models.AutoField(primary_key=True)
    section = models.ForeignKey(QuizSection, on_delete=models.CASCADE, db_column="section_id", related_name="questions")
    question = models.TextField()
    options = models.JSONField()
    correct_answer = models.IntegerField()
    order_index = models.IntegerField(default=0)

    class Meta:
        db_table = "questions"
        managed = False

    def __str__(self):
        return self.question[:60]
