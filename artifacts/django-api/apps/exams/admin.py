from django.contrib import admin
from .models import ExamAttempt, ExamAnswer


class ExamAnswerInline(admin.TabularInline):
    model = ExamAnswer
    extra = 0
    readonly_fields = ["question_id", "selected_option", "is_correct"]
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ["id", "user_id", "quiz_id", "status", "score", "correct_answers", "total_questions", "started_at", "submitted_at"]
    list_filter = ["status"]
    search_fields = ["user_id", "quiz_id"]
    ordering = ["-started_at"]
    readonly_fields = ["started_at", "submitted_at", "score", "correct_answers", "total_questions", "tab_switches"]
    inlines = [ExamAnswerInline]


@admin.register(ExamAnswer)
class ExamAnswerAdmin(admin.ModelAdmin):
    list_display = ["id", "attempt", "question_id", "selected_option", "is_correct"]
    list_filter = ["is_correct"]
    search_fields = ["attempt__id"]
    ordering = ["attempt", "question_id"]
    readonly_fields = ["attempt", "question_id", "selected_option", "is_correct"]
