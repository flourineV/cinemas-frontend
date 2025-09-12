import type { Movie } from '../../types';
import MovieCard from './MovieCard';
import './MovieGrid.css';

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  onMovieClick?: (movie: Movie) => void;
}

const MovieGrid = ({ movies, loading, onMovieClick }: MovieGridProps) => {
  if (loading) {
    return (
      <div className="movie-grid-loading">
        <div className="loading-spinner">Đang tải...</div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="movie-grid-empty">
        <p>Không tìm thấy phim nào</p>
      </div>
    );
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onClick={() => onMovieClick?.(movie)}
        />
      ))}
    </div>
  );
};

export default MovieGrid;
