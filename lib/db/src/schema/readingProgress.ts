import { pgTable, serial, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { contentTable } from "./content";

export const readingProgressTable = pgTable("reading_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  contentId: integer("content_id").notNull().references(() => contentTable.id),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  elapsedSeconds: integer("elapsed_seconds").notNull().default(0),
}, (table) => ({
  userContentIdx: uniqueIndex("reading_progress_user_content_idx").on(table.userId, table.contentId),
}));

export const insertReadingProgressSchema = createInsertSchema(readingProgressTable).omit({ id: true, startedAt: true });
export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;
export type ReadingProgress = typeof readingProgressTable.$inferSelect;