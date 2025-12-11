export interface StaffProfileRequest {
  userProfileId: string;
  cinemaName: string;
  hireDate: string; // ISO date string
}

export interface StaffProfileResponse {
  id: string;
  userProfileId: string;
  cinemaName: string;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
  // User profile info if populated
  userProfile?: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    avatarUrl?: string;
  };
}
