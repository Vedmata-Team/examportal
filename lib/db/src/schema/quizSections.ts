import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { quizzesTable } from "./quizzes";

export const quizSectionsTable = pgTable("quiz_sections", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull().references(() => quizzesTable.id),
  title: text("title").notNull(),
  timeLimit: integer("time_limit").notNull().default(300),
  orderIndex: integer("order_index").notNull().default(0),
});

export const insertQuizSectionSchema = createInsertSchema(quizSectionsTable).omit({ id: true });
export type InsertQuizSection = z.infer<typeof insertQuizSectionSchema>;
export type QuizSection = typeof quizSectionsTable.$inferSelect;
