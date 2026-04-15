from django.db import migrations


FORWARD_SQL = """
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes') THEN
    CREATE INDEX IF NOT EXISTS idx_quizzes_chapter_id ON quizzes (chapter_id) WHERE chapter_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_quizzes_type ON quizzes (type);
    CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes (created_at DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_sections') THEN
    CREATE INDEX IF NOT EXISTS idx_quiz_sections_quiz_id ON quiz_sections (quiz_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_sections_order ON quiz_sections (quiz_id, order_index);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions') THEN
    CREATE INDEX IF NOT EXISTS idx_questions_section_id ON questions (section_id);
    CREATE INDEX IF NOT EXISTS idx_questions_section_order ON questions (section_id, order_index);
  END IF;
END $$;
"""

REVERSE_SQL = """
DROP INDEX IF EXISTS idx_quizzes_chapter_id;
DROP INDEX IF EXISTS idx_quizzes_type;
DROP INDEX IF EXISTS idx_quizzes_created_at;
DROP INDEX IF EXISTS idx_quiz_sections_quiz_id;
DROP INDEX IF EXISTS idx_quiz_sections_order;
DROP INDEX IF EXISTS idx_questions_section_id;
DROP INDEX IF EXISTS idx_questions_section_order;
"""


class Migration(migrations.Migration):
    dependencies = []

    operations = [
        migrations.RunSQL(sql=FORWARD_SQL, reverse_sql=REVERSE_SQL),
    ]
