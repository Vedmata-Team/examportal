from django.db import migrations


FORWARD_SQL = """
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exam_attempts') THEN
    CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts (user_id);
    CREATE INDEX IF NOT EXISTS idx_exam_attempts_quiz_id ON exam_attempts (quiz_id);
    CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON exam_attempts (status);
    CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_quiz ON exam_attempts (user_id, quiz_id);
    CREATE INDEX IF NOT EXISTS idx_exam_attempts_started_at ON exam_attempts (started_at DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exam_answers') THEN
    CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt_id ON exam_answers (attempt_id);
    CREATE INDEX IF NOT EXISTS idx_exam_answers_question_id ON exam_answers (question_id);
  END IF;
END $$;
"""

REVERSE_SQL = """
DROP INDEX IF EXISTS idx_exam_attempts_user_id;
DROP INDEX IF EXISTS idx_exam_attempts_quiz_id;
DROP INDEX IF EXISTS idx_exam_attempts_status;
DROP INDEX IF EXISTS idx_exam_attempts_user_quiz;
DROP INDEX IF EXISTS idx_exam_attempts_started_at;
DROP INDEX IF EXISTS idx_exam_answers_attempt_id;
DROP INDEX IF EXISTS idx_exam_answers_question_id;
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
