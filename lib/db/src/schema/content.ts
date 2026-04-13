import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { chaptersTable } from "./chapters";

export const contentTable = pgTable("content", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").notNull().references(() => chaptersTable.id),
  htmlContent: text("html_content").notNull(),
  minReadTime: integer("min_read_time").notNull().default(60),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertContentSchema = createInsertSchema(contentTable).omit({ id: true, createdAt: true });
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof contentTable.$inferSelect;
