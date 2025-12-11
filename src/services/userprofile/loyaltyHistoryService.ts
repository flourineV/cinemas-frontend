import { profileClient } from "../apiClient";
import type { PagedLoyaltyHistoryResponse } from "@/types/userprofile/loyalty.type";

export const loyaltyHistoryService = {
  // Get user loyalty history with pagination
  getUserLoyaltyHistory: async (
    userId: string,
    page: number = 1,
    size: number = 10
  ): Promise<PagedLoyaltyHistoryResponse> => {
    const res = await profileClient.get<PagedLoyaltyHistoryResponse>(
      `/loyalty-history/${userId}`,
      {
        params: {
          page,
          size,
        },
      }
    );
    return res.data;
  },
};
