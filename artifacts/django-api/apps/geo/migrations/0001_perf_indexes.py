from django.db import migrations


FORWARD_SQL = """
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'districts') THEN
    CREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts (state_id);
    CREATE INDEX IF NOT EXISTS idx_districts_name ON districts (name);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'institutions') THEN
    CREATE INDEX IF NOT EXISTS idx_institutions_district_id ON institutions (district_id);
    CREATE INDEX IF NOT EXISTS idx_institutions_name ON institutions (name);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'states') THEN
    CREATE INDEX IF NOT EXISTS idx_states_code ON states (code);
  END IF;
END $$;
"""

REVERSE_SQL = """
DROP INDEX IF EXISTS idx_districts_state_id;
DROP INDEX IF EXISTS idx_districts_name;
DROP INDEX IF EXISTS idx_institutions_district_id;
DROP INDEX IF EXISTS idx_institutions_name;
DROP INDEX IF EXISTS idx_states_code;
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
