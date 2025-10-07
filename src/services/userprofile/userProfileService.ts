// src/services/userprofile/userProfileService.ts
import { profileClient } from "../apiClients/userProfileClient";

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type UserStatus = "ACTIVE" | "BANNED";

export interface UserProfileRequest {
  userId: string;
  email: string;
  username: string;
  fullName?: string;
  gender?: Gender;
  dateOfBirth?: string; // LocalDate => string (ISO)
  phoneNumber?: string;
  nationalId?: string;
  address?: string;
  avatarUrl?: string;
}

export interface UserProfileUpdateRequest {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  gender?: Gender;
}

export interface UserProfileResponse {
  id: string;
  userId: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  gender: Gender;
  dateOfBirth: string;
  phoneNumber: string;
  nationalId: string;
  address: string;
  loyaltyPoint: number;
  rankName: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export const userProfileService = {
  createProfile: async (data: UserProfileRequest): Promise<UserProfileResponse> => {
    const res = await profileClient.post<UserProfileResponse>("/profiles", data);
    return res.data;
  },

  getProfileByUserId: async (userId: string): Promise<UserProfileResponse> => {
    const res = await profileClient.get<UserProfileResponse>(`/profiles/${userId}`);
    return res.data;
  },

  updateProfile: async (
    userId: string,
    data: UserProfileUpdateRequest
  ): Promise<UserProfileResponse> => {
    const res = await profileClient.put<UserProfileResponse>(`/profiles/${userId}`, data);
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
