// services/searchService.ts
import type { MovieSummary } from "@/types/movie/movie.type";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import type { SearchResponse } from "@/types/search/search.type";

const API_BASE = "/api/search";
const DEFAULT_TIMEOUT = 4000;

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit = {},
  timeout = DEFAULT_TIMEOUT
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const searchService = {
  // gọi aggregator 1 lần — lấy movies + theaters cùng lúc
  searchAll: async (
    keyword: string,
    {
      timeout = DEFAULT_TIMEOUT,
      headers,
    }: { timeout?: number; headers?: Record<string, string> } = {}
  ): Promise<SearchResponse> => {
    const url = `${API_BASE}?keyword=${encodeURIComponent(keyword)}`;
    const init: RequestInit = {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(headers ?? {}),
      },
    };

    const res = await fetchWithTimeout(url, init, timeout);
    if (!res.ok) {
      // optional: try to parse error body
      const txt = await res.text().catch(() => "");
      throw new Error(`Search failed: ${res.status} ${res.statusText} ${txt}`);
    }

    const data = (await res.json()) as SearchResponse;
    // defensive defaults
    return {
      movies: data.movies ?? [],
      theaters: data.theaters ?? [],
      partial: Boolean(data.partial),
      errors: Array.isArray(data.errors) ? data.errors : [],
    };
  },

  // helpers that use aggregator result
  searchMovies: async (
    keyword: string,
    opts?: { timeout?: number; headers?: Record<string, string> }
  ): Promise<MovieSummary[]> => {
    const all = await searchService.searchAll(keyword, opts);
    return all.movies;
  },

  searchTheaters: async (
    keyword: string,
    opts?: { timeout?: number; headers?: Record<string, string> }
  ): Promise<TheaterResponse[]> => {
    const all = await searchService.searchAll(keyword, opts);
    return all.theaters;
  },
};
