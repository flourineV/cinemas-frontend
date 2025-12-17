export interface FavoriteMovieRequest {
  userId: string; // Auth user ID (not userProfileId)
  movieId: string;
}

export interface FavoriteMovieResponse {
  movieId: string;
  tmdbId: number;
  addedAt: string;
}
