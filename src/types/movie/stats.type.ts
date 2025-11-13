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
