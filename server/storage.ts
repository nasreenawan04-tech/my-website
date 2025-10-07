import type { Feedback, InsertFeedback, ToolUsage, InsertToolUsage } from "../shared/schema";

export interface IStorage {
  // Feedback operations
  createFeedback(data: InsertFeedback): Promise<Feedback>;
  getAllFeedback(): Promise<Feedback[]>;
  
  // Tool usage tracking
  trackToolUsage(data: InsertToolUsage): Promise<ToolUsage>;
  getToolUsageStats(): Promise<{ toolName: string; count: number }[]>;
}

export class MemStorage implements IStorage {
  private feedback: Feedback[] = [];
  private toolUsage: ToolUsage[] = [];
  private feedbackIdCounter = 1;
  private toolUsageIdCounter = 1;

  async createFeedback(data: InsertFeedback): Promise<Feedback> {
    const newFeedback: Feedback = {
      id: this.feedbackIdCounter++,
      ...data,
      createdAt: new Date(),
    };
    this.feedback.push(newFeedback);
    return newFeedback;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return this.feedback;
  }

  async trackToolUsage(data: InsertToolUsage): Promise<ToolUsage> {
    const newUsage: ToolUsage = {
      id: this.toolUsageIdCounter++,
      ...data,
      timestamp: new Date(),
    };
    this.toolUsage.push(newUsage);
    return newUsage;
  }

  async getToolUsageStats(): Promise<{ toolName: string; count: number }[]> {
    const stats = new Map<string, number>();
    
    for (const usage of this.toolUsage) {
      const current = stats.get(usage.toolName) || 0;
      stats.set(usage.toolName, current + 1);
    }
    
    return Array.from(stats.entries())
      .map(([toolName, count]) => ({ toolName, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export const storage = new MemStorage();
