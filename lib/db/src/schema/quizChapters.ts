import { pgTable, serial, integer } from "drizzle-orm/pg-core";
import { quizzesTable } from "./quizzes";
import { chaptersTable } from "./chapters";

export const quizChaptersTable = pgTable("quiz_chapters", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull().references(() => quizzesTable.id),
  chapterId: integer("chapter_id").notNull().references(() => chaptersTable.id),
});
