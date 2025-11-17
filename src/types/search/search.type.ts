import type { MovieSummary } from "@/types/movie/movie.type";
import type { TheaterResponse } from "@/types/showtime/theater.type";

export interface SearchResponse {
  movies: MovieSummary[];
  theaters: TheaterResponse[];
  partial: boolean;
  errors: string[];
}
