import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  shareId: text("share_id").notNull().unique(),
  name: text("name").notNull(),
  toolIds: text("tool_ids").array().notNull(),
});

export const calculationHistory = pgTable("calculation_history", {
  id: serial("id").primaryKey(),
  toolId: text("tool_id").notNull(),
  input: text("input").notNull(), // JSON string
  result: text("result").notNull(), // JSON string
  timestamp: text("timestamp").notNull(),
});

// Explicitly defining the schema for better reliability and type inference
export const insertCollectionSchema = z.object({
  shareId: z.string().min(1, "Share ID is required"),
  name: z.string().min(1, "Name is required"),
  toolIds: z.array(z.string()).min(1, "At least one tool must be selected"),
});

export const insertCalculationHistorySchema = z.object({
  toolId: z.string(),
  input: z.string(),
  result: z.string(),
  timestamp: z.string(),
});

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

export type InsertCalculationHistory = z.infer<typeof insertCalculationHistorySchema>;
export type CalculationHistory = typeof calculationHistory.$inferSelect;
