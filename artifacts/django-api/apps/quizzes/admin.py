from django.contrib import admin
from .models import Quiz, QuizSection, Question


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = ["question", "options", "correct_answer", "order_index"]


class QuizSectionInline(admin.StackedInline):
    model = QuizSection
    extra = 1
    fields = ["title", "time_limit", "order_index"]
    show_change_link = True


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "type", "chapter_id", "start_time", "end_time", "created_at"]
    list_filter = ["type"]
    search_fields = ["title"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at"]
    inlines = [QuizSectionInline]


@admin.register(QuizSection)
class QuizSectionAdmin(admin.ModelAdmin):
    list_display = ["id", "quiz", "title", "time_limit", "order_index"]
    list_filter = ["quiz"]
    search_fields = ["title", "quiz__title"]
    ordering = ["quiz", "order_index"]
    raw_id_fields = ["quiz"]
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["id", "section", "question_preview", "correct_answer", "order_index"]
    list_filter = ["section__quiz"]
    search_fields = ["question"]
    ordering = ["section", "order_index"]
    raw_id_fields = ["section"]

    def question_preview(self, obj):
        return obj.question[:80] + "..." if len(obj.question) > 80 else obj.question
    question_preview.short_description = "Question"
