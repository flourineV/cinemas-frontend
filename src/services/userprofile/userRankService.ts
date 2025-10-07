import { profileClient } from "../apiClients/userProfileClient";

export interface RankRequest {
  name: string;
  minPoints: number;
  maxPoints?: number;
  discountRate?: number; // BigDecimal -> number
}

export interface RankResponse {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  discountRate: number;
  createdAt: string;
  updatedAt: string;
}

export const userRankService = {
  createRank: (data: RankRequest) =>
    profileClient.post<RankResponse>("/ranks", data),

  getAllRanks: () => profileClient.get<RankResponse[]>("/ranks"),

  getRankById: (rankId: string) =>
    profileClient.get<RankResponse>(`/ranks/${rankId}`),

  deleteRank: (rankId: string) =>
    profileClient.delete(`/ranks/${rankId}`),
};
