from django.contrib import admin
from .models import State, District, Institution


@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "code", "created_at"]
    search_fields = ["name", "code"]
    ordering = ["name"]
    readonly_fields = ["created_at"]


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "state", "created_at"]
    list_filter = ["state"]
    search_fields = ["name"]
    ordering = ["state__name", "name"]
    readonly_fields = ["created_at"]
    raw_id_fields = ["state"]


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "district", "created_at"]
    list_filter = ["district__state"]
    search_fields = ["name"]
    ordering = ["name"]
    readonly_fields = ["created_at"]
    raw_id_fields = ["district"]
