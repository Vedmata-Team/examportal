from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "email", "role", "state_id", "district_id", "institution_id", "class_id", "created_at"]
    list_filter = ["role"]
    search_fields = ["name", "email"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "clerk_id"]
    fieldsets = [
        ("Personal Info", {
            "fields": ["name", "email", "clerk_id", "password_hash"]
        }),
        ("Role & Assignment", {
            "fields": ["role", "state_id", "district_id", "institution_id", "class_id"]
        }),
        ("Metadata", {
            "fields": ["created_at"],
            "classes": ["collapse"],
        }),
    ]

    def save_model(self, request, obj, form, change):
        if not obj.clerk_id:
            obj.clerk_id = obj.email
        super().save_model(request, obj, form, change)
