import apiClient from "@/lib/apiClient";

export const movieService = {
  syncMovies: () => apiClient.post("api/movies/sync"),

  getNowPlaying: (page: number = 0, size: number = 10) =>
    apiClient.get("api/movies/now-playing", { params: { page, size } }),

  getUpcoming: (page: number = 0, size: number = 10) =>
    apiClient.get("api/movies/upcoming", { params: { page, size } }),

  searchMovies: (title: string, page: number = 0, size: number = 10) =>
    apiClient.get("api/movies/search", { params: { title, page, size } }),

  getMovieDetail: (tmdbId: number) =>
    apiClient.get(`api/movies/${tmdbId}`),
};