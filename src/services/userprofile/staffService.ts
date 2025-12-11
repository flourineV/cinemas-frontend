import { profileClient } from "../apiClient";
import type {
  StaffProfileRequest,
  StaffProfileResponse,
} from "@/types/userprofile/staff.type";

export const staffService = {
  // Create a new staff profile
  createStaff: async (
    data: StaffProfileRequest
  ): Promise<StaffProfileResponse> => {
    const res = await profileClient.post<StaffProfileResponse>("/staff", data);
    return res.data;
  },

  // Get staff by user profile ID
  getStaffByUserProfile: async (
    userProfileId: string
  ): Promise<StaffProfileResponse> => {
    const res = await profileClient.get<StaffProfileResponse>(
      `/staff/user/${userProfileId}`
    );
    return res.data;
  },

  // Get all staff
  getAllStaff: async (): Promise<StaffProfileResponse[]> => {
    const res = await profileClient.get<StaffProfileResponse[]>("/staff");
    return res.data;
  },

  // Get staff by cinema name
  getStaffByCinemaName: async (
    cinemaName: string
  ): Promise<StaffProfileResponse[]> => {
    const res = await profileClient.get<StaffProfileResponse[]>(
      `/staff/cinema/${encodeURIComponent(cinemaName)}`
    );
    return res.data;
  },

  // Delete staff
  deleteStaff: async (staffId: string): Promise<void> => {
    await profileClient.delete(`/staff/${staffId}`);
  },
};
