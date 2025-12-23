export type MovieStatus = "NOW_PLAYING" | "UPCOMING" | "ARCHIVED";

export interface MovieSummary {
  id: string;
  tmdbId: number;
  title: string;
  titleEn?: string;
  posterUrl: string;
  age: string;
  status: MovieStatus;
  time: number;
  spokenLanguages: string[];
  country?: string;
  genres: string[];
  trailer: string;
  startDate: string;
  endDate?: string;
  popularity?: number;
  voteAverage?: number;
}

export interface MovieDetail {
  id: string;
  tmdbId: number;
  title: string;
  titleEn?: string;
  age: string;
  status: MovieStatus;
  genres: string[];
  time: number;
  country: string;
  spokenLanguages: string[];
  crew: string[];
  cast: string[];
  releaseDate: string;
  overview: string;
  overviewEn?: string;
  trailer: string;
  posterUrl: string;
  startDate?: string;
  endDate?: string;
  popularity?: number;
  voteAverage?: number;
}
