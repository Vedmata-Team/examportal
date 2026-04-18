from django.apps import AppConfig


class UsersConfig(AppConfig):
    name = "apps.users"
    label = "exam_users"

    def ready(self):
        from django.conf import settings
        from django.apps import apps
        
        # Force 'managed = True' for all models if using SQLite
        # This allows migrations to create tables for testing
        db_engine = settings.DATABASES['default']['ENGINE']
        if db_engine == 'django.db.backends.sqlite3':
            for model in apps.get_models():
                model._meta.managed = True
