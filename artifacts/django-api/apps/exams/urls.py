from django.urls import path
from . import views

urlpatterns = [
    path("exams/start", views.start_exam),
    path("exams/submit", views.submit_exam),
    path("exams/attempts", views.list_attempts),
]
