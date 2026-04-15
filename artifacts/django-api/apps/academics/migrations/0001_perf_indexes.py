from django.db import migrations


FORWARD_SQL = """
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chapters') THEN
    CREATE INDEX IF NOT EXISTS idx_chapters_class_id ON chapters (class_id);
    CREATE INDEX IF NOT EXISTS idx_chapters_class_order ON chapters (class_id, order_index);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content') THEN
    CREATE INDEX IF NOT EXISTS idx_content_chapter_id ON content (chapter_id);
    CREATE INDEX IF NOT EXISTS idx_content_chapter_order ON content (chapter_id, order_index);
  END IF;
END $$;
"""

REVERSE_SQL = """
DROP INDEX IF EXISTS idx_chapters_class_id;
DROP INDEX IF EXISTS idx_chapters_class_order;
DROP INDEX IF EXISTS idx_content_chapter_id;
DROP INDEX IF EXISTS idx_content_chapter_order;
"""


class Migration(migrations.Migration):
    dependencies = []

    operations = [
        migrations.RunSQL(sql=FORWARD_SQL, reverse_sql=REVERSE_SQL),
    ]
