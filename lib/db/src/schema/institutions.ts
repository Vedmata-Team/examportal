import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { districtsTable } from "./districts";

export const institutionsTable = pgTable("institutions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  districtId: integer("district_id").notNull().references(() => districtsTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInstitutionSchema = createInsertSchema(institutionsTable).omit({ id: true, createdAt: true });
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type Institution = typeof institutionsTable.$inferSelect;
