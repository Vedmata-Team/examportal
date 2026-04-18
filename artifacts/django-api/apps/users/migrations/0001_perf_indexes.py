from django.db import migrations


FORWARD_SQL = """
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
    CREATE INDEX IF NOT EXISTS idx_users_state_id ON users (state_id) WHERE state_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_users_district_id ON users (district_id) WHERE district_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_users_institution_id ON users (institution_id) WHERE institution_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_users_class_id ON users (class_id) WHERE class_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_users_role_institution ON users (role, institution_id);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);
  END IF;
END $$;
"""

REVERSE_SQL = """
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_state_id;
DROP INDEX IF EXISTS idx_users_district_id;
DROP INDEX IF EXISTS idx_users_institution_id;
DROP INDEX IF EXISTS idx_users_class_id;
DROP INDEX IF EXISTS idx_users_role_institution;
DROP INDEX IF EXISTS idx_users_created_at;
"""


def apply_indexes(apps, schema_editor):
    if schema_editor.connection.vendor == 'postgresql':
        schema_editor.execute(FORWARD_SQL)

def remove_indexes(apps, schema_editor):
    if schema_editor.connection.vendor == 'postgresql':
        schema_editor.execute(REVERSE_SQL)


class Migration(migrations.Migration):
    dependencies = []

    operations = [
        migrations.RunPython(apply_indexes, remove_indexes),
    ]
