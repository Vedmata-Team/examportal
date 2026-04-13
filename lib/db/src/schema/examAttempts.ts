import { pgTable, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { quizzesTable } from "./quizzes";

export const attemptStatusEnum = pgEnum("attempt_status", ["IN_PROGRESS", "SUBMITTED", "TIMED_OUT"]);

export const examAttemptsTable = pgTable("exam_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  quizId: integer("quiz_id").notNull().references(() => quizzesTable.id),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  score: integer("score"),
  totalQuestions: integer("total_questions").notNull().default(0),
  correctAnswers: integer("correct_answers"),
  status: attemptStatusEnum("status").notNull().default("IN_PROGRESS"),
});

export const insertExamAttemptSchema = createInsertSchema(examAttemptsTable).omit({ id: true, startedAt: true });
export type InsertExamAttempt = z.infer<typeof insertExamAttemptSchema>;
export type ExamAttempt = typeof examAttemptsTable.$inferSelect;
