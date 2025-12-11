import { profileClient } from "../apiClient";
import type {
  ManagerProfileRequest,
  ManagerProfileResponse,
} from "@/types/userprofile/manager.type";

export const managerService = {
  // Create a new manager profile
  createManager: async (
    data: ManagerProfileRequest
  ): Promise<ManagerProfileResponse> => {
    const res = await profileClient.post<ManagerProfileResponse>(
      "/manager",
      data
    );
    return res.data;
  },

  // Get manager by user profile ID
  getManagerByUser: async (
    userProfileId: string
  ): Promise<ManagerProfileResponse> => {
    const res = await profileClient.get<ManagerProfileResponse>(
      `/manager/user/${userProfileId}`
    );
    return res.data;
  },

  // Get all managers
  getAllManagers: async (): Promise<ManagerProfileResponse[]> => {
    const res = await profileClient.get<ManagerProfileResponse[]>("/manager");
    return res.data;
  },

  // Get managers by cinema name
  getManagersByCinemaName: async (
    cinemaName: string
  ): Promise<ManagerProfileResponse[]> => {
    const res = await profileClient.get<ManagerProfileResponse[]>(
      `/manager/cinema/${encodeURIComponent(cinemaName)}`
    );
    return res.data;
  },

  // Delete manager
  deleteManager: async (managerId: string): Promise<void> => {
    await profileClient.delete(`/manager/${managerId}`);
  },
};
