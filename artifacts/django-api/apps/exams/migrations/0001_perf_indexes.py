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


class Migration(migrations.Migration):
    dependencies = []

    operations = [
        migrations.RunSQL(sql=FORWARD_SQL, reverse_sql=REVERSE_SQL),
    ]
