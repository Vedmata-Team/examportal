from django.urls import path
from . import views

urlpatterns = [
    path("classes/", views.classes_list),
    path("chapters/", views.chapters_list),
    path("chapters/<int:pk>/", views.chapter_detail),
    path("content/", views.content_create),
    path("content/<int:pk>/", views.content_detail),
]
