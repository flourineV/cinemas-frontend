import { profileClient } from "../apiClient";
import type { UserStatsResponse } from "@/types/userprofile/stats.type";

export const userStatsService = {
  // Get overview statistics for admin dashboard
  getOverviewStats: async (): Promise<UserStatsResponse> => {
    const res = await profileClient.get<UserStatsResponse>("/stats/overview");
    return res.data;
  },
};
