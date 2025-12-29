// src/services/theaterService.ts
import { showtimeClient } from "../apiClient";

import type {
  TheaterRequest,
  TheaterResponse,
  MovieShowtimesResponse,
  MoviesWithTheatersResponse,
} from "@/types/showtime/theater.type";

export const theaterService = {
  createTheater: async (data: TheaterRequest): Promise<TheaterResponse> => {
    const res = await showtimeClient.post<TheaterResponse>("/theaters", data);
    return res.data;
  },

  getTheaterById: async (id: string): Promise<TheaterResponse> => {
    const res = await showtimeClient.get<TheaterResponse>(`/theaters/${id}`);
    return res.data;
  },

  getAllTheaters: async (): Promise<TheaterResponse[]> => {
    const res = await showtimeClient.get<TheaterResponse[]>("/theaters");
    return res.data;
  },

  getTheatersByProvince: async (
    provinceId: string
  ): Promise<TheaterResponse[]> => {
    const res = await showtimeClient.get<TheaterResponse[]>(
      "/theaters/search",
      {
        params: {
          provinceId: provinceId,
        },
      }
    );
    return res.data;
  },

  updateTheater: async (
    id: string,
    data: TheaterRequest
  ): Promise<TheaterResponse> => {
    const res = await showtimeClient.put<TheaterResponse>(
      `/theaters/${id}`,
      data
    );
    return res.data;
  },

  deleteTheater: async (id: string): Promise<void> => {
    await showtimeClient.delete(`/theaters/${id}`);
  },

  getMoviesByTheater: async (
    theaterId: string
  ): Promise<MovieShowtimesResponse[]> => {
    const res = await showtimeClient.get<MovieShowtimesResponse[]>(
      `/theaters/${theaterId}/movies`
    );
    return res.data;
  },

  getMoviesWithTheaters: async (
    date: string,
    movieId?: string,
    theaterId?: string
  ): Promise<MoviesWithTheatersResponse[]> => {
    const params: any = { date };
    if (movieId) params.movieId = movieId;
    if (theaterId) params.theaterId = theaterId;

    const res = await showtimeClient.get<MoviesWithTheatersResponse[]>(
      "/showtimes/movies-with-theaters",
      { params }
    );
    return res.data;
  },
};
