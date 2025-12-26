import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  shareId: text("share_id").notNull().unique(),
  name: text("name").notNull(),
  toolIds: text("tool_ids").array().notNull(),
});

// Explicitly defining the schema for better reliability and type inference
export const insertCollectionSchema = z.object({
  shareId: z.string().min(1, "Share ID is required"),
  name: z.string().min(1, "Name is required"),
  toolIds: z.array(z.string()).min(1, "At least one tool must be selected"),
});

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;
