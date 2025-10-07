import { profileClient } from "../apiClients/userProfileClient";

export interface FavoriteMovieRequest {
  userId: string;
  tmdbId: number;
}

export interface FavoriteMovieResponse {
  tmdbId: number;
  addedAt: string; // LocalDateTime → string (ISO)
}

export const favoriteMovieService = {
  addFavorite: (data: FavoriteMovieRequest) =>
    profileClient.post<FavoriteMovieResponse>("/favorites", data),

  getFavorites: (userId: string) =>
    profileClient.get<FavoriteMovieResponse[]>(`/favorites/${userId}`),

  removeFavorite: (userId: string, tmdbId: number) =>
    profileClient.delete(`/favorites/${userId}/${tmdbId}`),
};
