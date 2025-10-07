import { apiRequest } from "./queryClient";
import type { InsertFeedback, InsertToolUsage } from "../../../shared/schema";

// Feedback API
export const feedbackApi = {
  submit: async (data: InsertFeedback) => {
    return apiRequest("POST", "/api/feedback", data);
  },
  getAll: async () => {
    return apiRequest("GET", "/api/feedback");
  },
};

// Tool usage tracking API
export const toolUsageApi = {
  track: async (data: InsertToolUsage) => {
    return apiRequest("POST", "/api/tool-usage", data);
  },
  getStats: async () => {
    return apiRequest("GET", "/api/tool-usage/stats");
  },
};
