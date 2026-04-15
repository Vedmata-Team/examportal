from django.db import models


class State(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    code = models.TextField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "states"
        managed = False

    def __str__(self):
        return self.name


class District(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    state = models.ForeignKey(State, on_delete=models.CASCADE, db_column="state_id")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "districts"
        managed = False

    def __str__(self):
        return self.name


class Institution(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    district = models.ForeignKey(District, on_delete=models.CASCADE, db_column="district_id")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "institutions"
        managed = False

    def __str__(self):
        return self.name
