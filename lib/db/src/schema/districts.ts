import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { statesTable } from "./states";

export const districtsTable = pgTable("districts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  stateId: integer("state_id").notNull().references(() => statesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDistrictSchema = createInsertSchema(districtsTable).omit({ id: true, createdAt: true });
export type InsertDistrict = z.infer<typeof insertDistrictSchema>;
export type District = typeof districtsTable.$inferSelect;
