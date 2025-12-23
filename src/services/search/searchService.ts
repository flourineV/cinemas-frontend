import { apiClient } from "../apiClient";
import type { MovieSummary } from "@/types/movie/movie.type";
import type { TheaterResponse } from "@/types/showtime/theater.type";

export interface SearchResponse {
  movies: MovieSummary[];
  theaters: TheaterResponse[];
  partial: boolean;
  errors: string[];
}

export const searchService = {
  search: async (
    keyword: string,
    language: string = "vi"
  ): Promise<SearchResponse> => {
    const res = await apiClient.get<SearchResponse>("/search", {
      params: { keyword },
      headers: { "Accept-Language": language },
    });
    return res.data;
  },
};
