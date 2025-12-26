import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  shareId: text("share_id").notNull().unique(),
  name: text("name").notNull(),
  toolIds: text("tool_ids").array().notNull(),
});

// Using standard Zod for the insert schema due to a version mismatch or environment issue with createInsertSchema
export const insertCollectionSchema = z.object({
  shareId: z.string(),
  name: z.string(),
  toolIds: z.array(z.string()),
});

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;
