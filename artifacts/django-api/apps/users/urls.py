from django.urls import path
from . import views

urlpatterns = [
    path("me/", views.me),
    path("users/", views.users_list),
    path("users/<int:pk>/", views.user_detail),
]
