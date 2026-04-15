from django.db import models


class Class(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "classes"
        managed = False

    def __str__(self):
        return self.name


class Chapter(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.TextField()
    class_ref = models.ForeignKey(Class, on_delete=models.CASCADE, db_column="class_id")
    order_index = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chapters"
        managed = False

    def __str__(self):
        return self.title


class Content(models.Model):
    id = models.AutoField(primary_key=True)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, db_column="chapter_id")
    html_content = models.TextField()
    min_read_time = models.IntegerField(default=60)
    order_index = models.IntegerField(default=0)

    class Meta:
        db_table = "content"
        managed = False
