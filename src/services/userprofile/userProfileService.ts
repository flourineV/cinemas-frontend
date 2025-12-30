import { profileClient } from "../apiClient";
import type {
  UserProfileRequest,
  UserProfileUpdateRequest,
  UserProfileResponse,
} from "@/types/userprofile/userprofile.type";
import type {
  FavoriteMovieRequest,
  FavoriteMovieResponse,
} from "@/types/userprofile/favorite.type";

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

  // Upload avatar to Cloudinary
  uploadAvatar: async (file: File): Promise<string> => {
    try {
      console.log("🔄 Uploading avatar to Cloudinary...", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "up_load_avatar"); // preset đã tạo

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dqes1ugpb/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to upload avatar to Cloudinary: ${res.status} ${errorText}`
        );
      }

      const data = await res.json();
      console.log("✅ Upload successful, secure_url:", data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error("❌ Avatar upload error:", error);
      throw new Error(
        `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  updateLoyalty: async (
    userId: string,
    loyaltyPoint: number
  ): Promise<UserProfileResponse> => {
    const res = await profileClient.patch<UserProfileResponse>(
      `/${userId}/loyalty`,
      loyaltyPoint
    );
    return res.data;
  },

  getRankAndDiscount: async (
    userId: string
  ): Promise<{ rankName: string; discountRate: number }> => {
    const res = await profileClient.get<{
      rankName: string;
      discountRate: number;
    }>(`profiles/${userId}/rank`);
    return res.data;
  },

  // Favorite Movies
  addFavorite: async (
    data: FavoriteMovieRequest
  ): Promise<FavoriteMovieResponse> => {
    const res = await profileClient.post<FavoriteMovieResponse>(
      "/favorites",
      data
    );
    return res.data;
  },

  getFavorites: async (userId: string): Promise<FavoriteMovieResponse[]> => {
    const res = await profileClient.get<FavoriteMovieResponse[]>(
      `/favorites/${userId}`
    );
    return res.data;
  },

  removeFavorite: async (userId: string, movieId: string): Promise<void> => {
    await profileClient.delete(`/favorites/${userId}/${movieId}`);
  },

  isFavorite: async (userId: string, movieId: string): Promise<boolean> => {
    const res = await profileClient.get<boolean>(
      `/favorites/check/${userId}/${movieId}`
    );
    return res.data;
  },

  // Loyalty History
  getLoyaltyHistory: async (
    userId: string,
    page: number = 1,
    size: number = 10
  ) => {
    const res = await profileClient.get(`/loyalty-history/${userId}`, {
      params: { page, size },
    });
    return res.data;
  },

  // User Stats
  getUserStats: async (
    userId: string
  ): Promise<{
    totalBookings: number;
    totalFavoriteMovies: number;
    totalLoyaltyPoints: number;
  }> => {
    const res = await profileClient.get(`/stats/user/${userId}`);
    return res.data;
  },

  // Search profiles (for admin/manager)
  searchProfiles: async (keyword?: string): Promise<UserProfileResponse[]> => {
    const res = await profileClient.get<UserProfileResponse[]>(
      "profiles/search",
      {
        params: keyword ? { keyword } : {},
      }
    );
    return res.data;
  },
};
