export interface FavoriteMovieRequest {
  userId: string;
  tmdbId: number;
}

export interface FavoriteMovieResponse {
  movieId: string;
  tmdbId: number;
  addedAt: string;
}
