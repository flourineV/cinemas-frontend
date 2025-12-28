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
    const res = await profileClient.post<UserProfileResponse>("/", data);
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

  // Upload avatar using presigned URL
  uploadAvatar: async (file: File): Promise<string> => {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const fileName = `avatar_${timestamp}.${fileExtension}`;

      console.log("🔄 Getting presigned URL for:", {
        fileName,
        contentType: file.type,
      });

      // 1. Get presigned URL
      const res = await profileClient.get<string>(`/s3/presigned-url`, {
        params: {
          fileName,
          contentType: file.type,
        },
      });

      const presignedUrl = res.data;
      console.log("✅ Got presigned URL:", presignedUrl);

      // 2. Upload file to S3 using presigned URL
      console.log("🔄 Uploading to S3...");

      // Try simple PUT without any headers to avoid CORS preflight
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
      });

      console.log("📤 Upload response:", {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        ok: uploadResponse.ok,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `Failed to upload avatar to S3: ${uploadResponse.status} ${errorText}`
        );
      }

      // 3. Return fileUrl (presigned URL without query params)
      const fileUrl = presignedUrl.split("?")[0];
      console.log("✅ Upload successful, fileUrl:", fileUrl);
      return fileUrl;
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
