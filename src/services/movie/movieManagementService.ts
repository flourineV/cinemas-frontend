// src/services/auth/movieManagementService.ts
import { movieClient } from "@/services/apiClient";
import type { MovieDetail, MovieSummary } from "@/types/movie/movie.type";
import type { PageResponse } from "@/types/PageResponse";

export const movieManagementService = {
  adminList: async ({
    keyword,
    status,
    page = 1,
    size = 10,
    sortBy,
    sortType,
  }: {
    keyword?: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortType?: string;
  }): Promise<PageResponse<MovieSummary>> => {
    const res = await movieClient.get("/advanced-search", {
      params: {
        keyword,
        status,
        page,
        size,
        sortBy,
        sortType,
      },
    });
    return res.data;
  },

  getByUuid: async (id: string): Promise<MovieDetail> => {
    const res = await movieClient.get<MovieDetail>(`/${id}`);
    return res.data;
  },

  updateMovie: async (
    id: string,
    payload: MovieDetail
  ): Promise<MovieDetail> => {
    const res = await movieClient.put<MovieDetail>(`/${id}`, payload);
    return res.data;
  },

  deleteMovie: async (id: string): Promise<void> => {
    await movieClient.delete(`/${id}`);
  },

  changeStatus: async (id: string, status: string): Promise<void> => {
    await movieClient.put(`/status/${id}`, { status });
  },

  suspendShowtimes: async (movieId: string, reason = "Movie archived") => {
    await movieClient.post(`/suspend-by-movie/${movieId}`, null, {
      params: { reason },
    });
  },

  // Bulk add movies from TMDB
  bulkFromTmdb: async (payload: {
    tmdbIds: number[];
    startDate: string;
    endDate: string;
  }): Promise<{
    totalRequests: number;
    successCount: number;
    failedCount: number;
    results: Array<{
      tmdbId: number;
      success: boolean;
      message?: string;
    }>;
  }> => {
    const res = await movieClient.post("/bulk-from-tmdb", payload);
    return res.data;
  },
};
