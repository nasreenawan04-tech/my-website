import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  shareId: text("share_id").notNull().unique(),
  name: text("name").notNull(),
  toolIds: text("tool_ids").array().notNull(),
});

export const insertCollectionSchema = createInsertSchema(collections).omit({ id: true });

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;
