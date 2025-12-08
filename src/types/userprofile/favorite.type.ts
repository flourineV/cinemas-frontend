export interface FavoriteMovieRequest {
  userId: string;
  tmdbId: number;
}

export interface FavoriteMovieResponse {
  tmdbId: number;
  addedAt: string;
}
