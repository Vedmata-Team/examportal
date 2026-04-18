import os
from django.db import models


class User(models.Model):
    ROLE_CHOICES = [
        ("CENTRAL", "Central"),
        ("STATE", "State"),
        ("DISTRICT", "District"),
        ("INSTITUTION", "Institution"),
        ("STUDENT", "Student"),
    ]

    id = models.AutoField(primary_key=True)
    clerk_id = models.TextField(unique=True)
    name = models.TextField()
    email = models.TextField(unique=True)
    password_hash = models.TextField(null=True, blank=True)
    role = models.TextField(choices=ROLE_CHOICES, default="STUDENT")
    state_id = models.IntegerField(null=True, blank=True)
    district_id = models.IntegerField(null=True, blank=True)
    institution_id = models.IntegerField(null=True, blank=True)
    class_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users"
        managed = os.environ.get("USE_SQLITE", "false").lower() == "true" or not os.environ.get("DATABASE_URL")

    def __str__(self):
        return f"{self.name} ({self.email})"

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False
