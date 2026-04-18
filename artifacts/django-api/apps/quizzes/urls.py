from django.urls import path
from . import views

urlpatterns = [
    path("quizzes/", views.quizzes_list),
    path("quizzes/<int:pk>/", views.quiz_detail),
    path("quiz-sections/", views.quiz_sections_create),
    path("questions/", views.questions_create),
]
