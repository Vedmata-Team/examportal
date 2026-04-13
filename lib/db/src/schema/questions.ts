import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { quizSectionsTable } from "./quizSections";

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").notNull().references(() => quizSectionsTable.id),
  question: text("question").notNull(),
  options: jsonb("options").notNull().$type<string[]>(),
  correctAnswer: integer("correct_answer").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
});

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({ id: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsTable.$inferSelect;
