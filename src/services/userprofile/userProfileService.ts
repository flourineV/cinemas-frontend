import { profileClient } from "../apiClient";
import type {
  UserProfileRequest,
  UserProfileUpdateRequest,
  UserProfileResponse,
} from "@/types/userprofile/userprofile.type";

export const userProfileService = {
  createProfile: async (
    data: UserProfileRequest
  ): Promise<UserProfileResponse> => {
    const res = await profileClient.post<UserProfileResponse>(
      "/profiles",
      data
    );
    return res.data;
  },

  getProfileByUserId: async (userId: string): Promise<UserProfileResponse> => {
    const res = await profileClient.get<UserProfileResponse>(
      `/profiles/${userId}`
    );
    return res.data;
  },

  updateProfile: async (
    userId: string,
    data: UserProfileUpdateRequest
  ): Promise<UserProfileResponse> => {
    const res = await profileClient.put<UserProfileResponse>(
      `/profiles/${userId}`,
      data
    );
    return res.data;
  },

  updateLoyalty: async (
    userId: string,
    loyaltyPoint: number
  ): Promise<UserProfileResponse> => {
    const res = await profileClient.patch<UserProfileResponse>(
      `/profiles/${userId}/loyalty`,
      loyaltyPoint
    );
    return res.data;
  },
};
