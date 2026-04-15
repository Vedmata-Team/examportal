from django.contrib import admin
from django.urls import path, include

admin.site.site_header = "Exam Platform Admin"
admin.site.site_title = "Exam Platform"
admin.site.index_title = "Administration Dashboard"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.authentication.urls")),
    path("api/", include("apps.users.urls")),
    path("api/", include("apps.geo.urls")),
    path("api/", include("apps.academics.urls")),
    path("api/", include("apps.quizzes.urls")),
    path("api/", include("apps.exams.urls")),
    path("api/", include("apps.dashboard.urls")),
]
