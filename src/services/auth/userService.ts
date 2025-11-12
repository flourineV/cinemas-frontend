// src/services/userAdminService.ts
import { authClient } from "@/services/apiClient";
import type {
  UserListResponse,
  StatsOverviewResponse,
} from "@/types/auth/auth.type";
import type { PageResponse } from "@/types/PageResponse";

export const userAdminService = {
  getAllUsers: (page = 0, size = 10, role?: string, status?: string) =>
    authClient.get<PageResponse<UserListResponse>>("/users", {
      params: { page, size, role, status },
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
};
