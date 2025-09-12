import type { Movie } from '../../types';
import { formatDuration } from '../../utils';
import './MovieCard.css';

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
}

const MovieCard = ({ movie, onClick }: MovieCardProps) => {
  return (
    <div className="movie-card" onClick={onClick}>
      <div className="movie-poster">
        <img src={movie.poster} alt={movie.title} />
        <div className="movie-rating">{movie.rating}</div>
      </div>
      
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-genre">{movie.genre.join(', ')}</p>
        <p className="movie-duration">{formatDuration(movie.duration)}</p>
        <p className="movie-language">{movie.language}</p>
      </div>
      
      <div className="movie-actions">
        <button className="btn-book">Đặt vé</button>
        <button className="btn-detail">Chi tiết</button>
      </div>
    </div>
  );
};

export default MovieCard;
