from django.contrib import admin
from .models import Class, Chapter, Content


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "description", "created_at"]
    search_fields = ["name"]
    ordering = ["name"]
    readonly_fields = ["created_at"]


class ContentInline(admin.TabularInline):
    model = Content
    extra = 1
    fields = ["html_content", "min_read_time", "order_index"]


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "class_ref", "order_index", "created_at"]
    list_filter = ["class_ref"]
    search_fields = ["title"]
    ordering = ["class_ref__name", "order_index"]
    readonly_fields = ["created_at"]
    raw_id_fields = ["class_ref"]
    inlines = [ContentInline]


@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
    list_display = ["id", "chapter", "min_read_time", "order_index", "created_at"]
    list_filter = ["chapter__class_ref"]
    search_fields = ["chapter__title"]
    ordering = ["chapter", "order_index"]
    readonly_fields = ["created_at"]
    raw_id_fields = ["chapter"]
