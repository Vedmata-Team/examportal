from django.contrib import admin
from .models import Quiz, QuizSection, Question


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = ["text", "options", "correct_option", "order_index"]


class QuizSectionInline(admin.StackedInline):
    model = QuizSection
    extra = 1
    fields = ["title", "order_index"]
    show_change_link = True


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "time_limit_minutes", "passing_percentage", "created_at"]
    search_fields = ["title"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at"]
    inlines = [QuizSectionInline]


@admin.register(QuizSection)
class QuizSectionAdmin(admin.ModelAdmin):
    list_display = ["id", "quiz", "title", "order_index"]
    list_filter = ["quiz"]
    search_fields = ["title", "quiz__title"]
    ordering = ["quiz", "order_index"]
    raw_id_fields = ["quiz"]
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["id", "section", "text_preview", "correct_option", "order_index"]
    list_filter = ["section__quiz"]
    search_fields = ["text"]
    ordering = ["section", "order_index"]
    raw_id_fields = ["section"]

    def text_preview(self, obj):
        return obj.text[:80] + "..." if len(obj.text) > 80 else obj.text
    text_preview.short_description = "Question Text"
