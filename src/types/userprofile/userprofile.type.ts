export type Gender = "MALE" | "FEMALE" | "OTHER";
export type UserStatus = "ACTIVE" | "BANNED";

export interface UserProfileRequest {
  userId: string;
  email: string;
  username: string;
  fullName?: string;
  gender?: Gender;
  dateOfBirth?: string;
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
