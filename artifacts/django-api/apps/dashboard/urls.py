from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/admin/", views.admin_dashboard),
    path("dashboard/student/", views.student_dashboard),
    path("dashboard/recent-activity/", views.recent_activity),
]
