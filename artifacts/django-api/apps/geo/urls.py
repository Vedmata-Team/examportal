from django.urls import path
from . import views

urlpatterns = [
    path("states/", views.states_list),
    path("districts/", views.districts_list),
    path("institutions/", views.institutions_list),
]
