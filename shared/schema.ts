import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const pdfFiles = pgTable("pdf_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull().default("application/pdf"),
  filePath: text("file_path").notNull(),
  isPasswordProtected: boolean("is_password_protected").default(false),
  pageCount: integer("page_count"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pdfOperations = pgTable("pdf_operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  operationType: text("operation_type").notNull(), // merge, split, rotate, compress, ocr, etc.
  inputFileIds: text("input_file_ids").array().notNull(),
  outputFileId: varchar("output_file_id").references(() => pdfFiles.id),
  operationData: jsonb("operation_data"), // store operation-specific data
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertPdfFileSchema = createInsertSchema(pdfFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPdfOperationSchema = createInsertSchema(pdfOperations).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertPdfFile = z.infer<typeof insertPdfFileSchema>;
export type PdfFile = typeof pdfFiles.$inferSelect;
export type InsertPdfOperation = z.infer<typeof insertPdfOperationSchema>;
export type PdfOperation = typeof pdfOperations.$inferSelect;
