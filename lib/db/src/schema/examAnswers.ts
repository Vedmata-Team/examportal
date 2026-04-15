import { pgTable, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { examAttemptsTable } from "./examAttempts";
import { questionsTable } from "./questions";

export const examAnswersTable = pgTable("exam_answers", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").notNull().references(() => examAttemptsTable.id),
  questionId: integer("question_id").notNull().references(() => questionsTable.id),
  selectedOption: integer("selected_option").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
});

export const insertExamAnswerSchema = createInsertSchema(examAnswersTable).omit({ id: true });
export type InsertExamAnswer = z.infer<typeof insertExamAnswerSchema>;
export type ExamAnswer = typeof examAnswersTable.$inferSelect;
