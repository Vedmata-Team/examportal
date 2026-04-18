from django.urls import path
from . import views

urlpatterns = [
    path("healthz/", views.health_check),
    path("auth/register/", views.register),
    path("auth/login/", views.login),
    path("auth/logout/", views.logout),
]
