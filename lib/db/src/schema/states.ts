import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const statesTable = pgTable("states", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStateSchema = createInsertSchema(statesTable).omit({ id: true, createdAt: true });
export type InsertState = z.infer<typeof insertStateSchema>;
export type State = typeof statesTable.$inferSelect;
