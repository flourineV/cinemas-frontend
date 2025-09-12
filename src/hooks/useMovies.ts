import { useState, useEffect } from 'react';
import type { Movie, MovieFilters } from '../types';
import { movieService } from '../services/api';

export const useMovies = (filters?: MovieFilters) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchMovies = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await movieService.getMovies({ ...filters, page });
      setMovies(response.items);
      setPagination({
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        hasNextPage: response.hasNextPage,
        hasPrevPage: response.hasPrevPage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [filters]);

  return {
    movies,
    loading,
    error,
    pagination,
    refetch: fetchMovies,
  };
};

export const useMovie = (id: string) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchMovie = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const movieData = await movieService.getMovieById(id);
        setMovie(movieData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch movie');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  return { movie, loading, error };
};
