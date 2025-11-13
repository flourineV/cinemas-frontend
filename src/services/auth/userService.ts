// src/services/userAdminService.ts
import { authClient } from "@/services/apiClient";
import type {
  UserListResponse,
  StatsOverviewResponse,
  UserRegistrationStatsResponse,
} from "@/types/auth/stats.type";
import type { GetUsersParams } from "@/types/auth/stats.type";
import type { PageResponse } from "@/types/PageResponse";

export const userAdminService = {
  getAllUsers: (params: GetUsersParams = { page: 1, size: 10 }) =>
    authClient.get<PageResponse<UserListResponse>>("/users", {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 10,
        keyword: params.keyword,
        role: params.role,
        status: params.status,
        sortBy: params.sortBy,
        sortType: params.sortType,
      },
    }),

  getUserById: (id: string) => authClient.get<UserListResponse>(`/users/${id}`),

  updateUserStatus: (id: string, newStatus: string) =>
    authClient.patch<string>(`/users/${id}/status`, null, {
      params: { newStatus },
    }),

  updateUserRole: (id: string, newRole: string) =>
    authClient.patch<string>(`/users/${id}/role`, null, {
      params: { newRole },
    }),

  deleteUser: (id: string) => authClient.delete<string>(`/users/${id}`),

  getStatsOverview: () =>
    authClient.get<StatsOverviewResponse>("/stats/overview"),

  getUserRegistrationsByMonth: () =>
    authClient.get<UserRegistrationStatsResponse[]>("/stats/users/monthly"),
};
