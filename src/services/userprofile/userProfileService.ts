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

  getRankAndDiscount: async (
    userId: string
  ): Promise<{ rankName: string; discountRate: number }> => {
    const res = await profileClient.get<{
      rankName: string;
      discountRate: number;
    }>(`/profiles/${userId}/rank`);
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

  removeFavorite: async (userId: string, tmdbId: number): Promise<void> => {
    await profileClient.delete(`/favorites/${userId}/${tmdbId}`);
  },

  isFavorite: async (userId: string, tmdbId: number): Promise<boolean> => {
    const res = await profileClient.get<boolean>(
      `/favorites/check/${userId}/${tmdbId}`
    );
    return res.data;
  },
};
