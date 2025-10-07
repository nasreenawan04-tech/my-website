import { z } from "zod";

// Feedback schema
export const insertFeedbackSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  category: z.enum(["bug", "feature", "general", "question"]),
});

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export interface Feedback extends InsertFeedback {
  id: number;
  createdAt: Date;
}

// Tool usage schema
export const insertToolUsageSchema = z.object({
  toolName: z.string(),
  category: z.string(),
});

export type InsertToolUsage = z.infer<typeof insertToolUsageSchema>;

export interface ToolUsage extends InsertToolUsage {
  id: number;
  timestamp: Date;
}
