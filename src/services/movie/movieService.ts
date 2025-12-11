// src/services/movieService.ts
import { movieClient } from "../apiClient";

import type { MovieDetail, MovieSummary } from "@/types/movie/movie.type";

export const movieService = {
  syncMovies: async (): Promise<void> => {
    // Thêm async và await
    await movieClient.post("/sync");
  },

  getNowPlaying: async (
    page: number = 0,
    size: number = 10
  ): Promise<{ content: MovieSummary[] }> => {
    const res = await movieClient.get<{ content: MovieSummary[] }>(
      "/now-playing",
      { params: { page, size } }
    );
    return res.data;
  },

  getUpcoming: async (
    page: number = 0,
    size: number = 10
  ): Promise<{ content: MovieSummary[] }> => {
    const res = await movieClient.get<{ content: MovieSummary[] }>(
      "/upcoming",
      { params: { page, size } }
    );
    return res.data;
  },

  searchMovies: async (
    title: string,
    page: number = 0,
    size: number = 10
  ): Promise<{ content: MovieSummary[] }> => {
    const res = await movieClient.get<{ content: MovieSummary[] }>("/search", {
      params: { title, page, size },
    });
    return res.data;
  },

  getMovieDetail: async (id: string): Promise<MovieDetail> => {
    const res = await movieClient.get<MovieDetail>(`/${id}`);
    return res.data;
  },

  // Get movie stats overview
  getStatsOverview: async (): Promise<{
    totalMovies: number;
    nowPlaying: number;
    upcoming: number;
    archived: number;
  }> => {
    const res = await movieClient.get<{
      totalMovies: number;
      nowPlaying: number;
      upcoming: number;
      archived: number;
    }>("/stats/overview");
    return res.data;
  },
};
