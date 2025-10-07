// src/services/movieService.ts
import { movieClient } from "../apiClients/movieClient";

// ================== Interfaces (Giữ nguyên) ==================
export interface MovieSummary {
  id: string;
  tmdbId: number;
  title: string;
  posterUrl: string;
  age: string;
  status: string;
  time: number;
  spokenLanguages: string[];
  genres: string[];
  trailer: string;
}

export interface MovieDetail {
  id: string;
  tmdbId: number;
  title: string;
  age: string;
  genres: string[];
  time: number;
  country: string;
  spokenLanguages: string[];
  crew: string[];
  cast: string[];
  releaseDate: string;
  overview: string;
  trailer: string;
  posterUrl: string;
}

// ================== Service (Đã sửa với async/await) ==================
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
};