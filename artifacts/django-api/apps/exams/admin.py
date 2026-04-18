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
    list_display = ["id", "user", "quiz", "score", "started_at", "completed_at"]
    search_fields = ["user__email", "quiz__title"]
    ordering = ["-started_at"]
    readonly_fields = ["started_at", "completed_at", "score", "metadata"]
    inlines = [ExamAnswerInline]


@admin.register(ExamAnswer)
class ExamAnswerAdmin(admin.ModelAdmin):
    list_display = ["id", "attempt", "question", "selected_option", "is_correct"]
    list_filter = ["is_correct"]
    search_fields = ["attempt__id"]
    ordering = ["attempt", "question"]
    readonly_fields = ["attempt", "question", "selected_option", "is_correct"]
