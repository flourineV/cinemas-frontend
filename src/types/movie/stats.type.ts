export interface MovieMonthlyStatsResponse {
  year: number;
  month: number;
  addedMovies: number;
}

export interface MovieStatsResponse {
  totalMovies: number;
  nowPlaying: number;
  upcoming: number;
  archived: number;
}

export interface GetMoviesParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
  genres?: string;
  sortBy?: string;
  sortType?: "ASC" | "DESC";
}
