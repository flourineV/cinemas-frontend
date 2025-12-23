import { Link, useNavigate } from "react-router-dom";
import { Clock, Calendar } from "lucide-react";
import { getPosterUrl } from "@/utils/getPosterUrl";
import { formatAgeRating } from "@/utils/formatAgeRating";
import type { MovieDetail } from "@/types/movie/movie.type";
import type { MovieShowtimesResponse } from "@/types/showtime/theater.type";
import { useLanguage } from "@/contexts/LanguageContext";

interface MovieShowtimeCardProps {
  movie: MovieDetail;
  showtimes: MovieShowtimesResponse;
  theaterName?: string;
  theaterNameEn?: string;
  theaterId?: string;
}

const MovieShowtimeCard: React.FC<MovieShowtimeCardProps> = ({
  movie,
  showtimes,
  theaterName = "",
  theaterNameEn = "",
  theaterId = "",
}) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // Group showtimes by date
  const showtimesByDate = showtimes.showtimes.reduce(
    (acc, showtime) => {
      const locale = language === "en" ? "en-US" : "vi-VN";
      const date = new Date(showtime.startTime).toLocaleDateString(locale);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(showtime);
      return acc;
    },
    {} as Record<string, typeof showtimes.showtimes>
  );

  const dates = Object.keys(showtimesByDate);
  const maxShowtimesToShow = 6; // Show max 6 showtimes initially

  return (
    <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 rounded-xl overflow-hidden shadow-2xl h-full flex flex-col">
      <div className="flex gap-4 p-6 flex-1">
        {/* Movie Poster - Fixed size */}
        <Link to={`/movies/${movie.id}`} className="flex-shrink-0">
          <img
            src={getPosterUrl(movie.posterUrl)}
            alt={movie.title}
            className="w-40 h-56 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform"
          />
        </Link>

        {/* Movie Info & Showtimes */}
        <div className="flex-1 flex flex-col min-w-0">
          <Link to={`/movies/${movie.id}`}>
            <h3 className="text-xl font-extrabold text-yellow-400 mb-2 uppercase hover:text-yellow-300 transition-colors line-clamp-2">
              {movie.title}
            </h3>
          </Link>

          <div className="text-gray-300 text-sm space-y-1 mb-4">
            <p>
              {movie.time} {language === "en" ? "min" : "phút"}
            </p>
            <p>{movie.genres?.join(", ") || "N/A"}</p>
            <p>{formatAgeRating(movie.age, language)}</p>
          </div>

          {/* Showtimes by date */}
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            {dates.slice(0, 2).map((date) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={14} className="text-yellow-400" />
                  <span className="text-sm font-semibold text-white">
                    {date}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {showtimesByDate[date]
                    .slice(0, maxShowtimesToShow)
                    .map((showtime) => (
                      <button
                        key={showtime.showtimeId}
                        onClick={() =>
                          navigate(
                            `/movies/${movie.id}?showtimeId=${showtime.showtimeId}`,
                            {
                              state: {
                                preselectedShowtime: {
                                  id: showtime.showtimeId,
                                  movieId: movie.id,
                                  theaterId: theaterId,
                                  theaterName: theaterName,
                                  theaterNameEn: theaterNameEn,
                                  roomId: showtime.roomId,
                                  roomName: showtime.roomName || "",
                                  roomNameEn: "",
                                  startTime: showtime.startTime,
                                  endTime: showtime.endTime,
                                },
                              },
                            }
                          )
                        }
                        className="border border-purple-400/50 rounded-lg px-3 py-2 hover:border-yellow-400 hover:bg-purple-800/30 transition-all text-center"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <Clock size={14} className="text-yellow-400" />
                          <span className="font-bold text-white text-sm">
                            {new Date(showtime.startTime).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }
                            )}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View More Button */}
      <div className="px-6 pb-6">
        <Link
          to={`/movies/${movie.id}`}
          className="block w-full text-center py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-colors"
        >
          {t("theater.viewMoreShowtimes")}
        </Link>
      </div>
    </div>
  );
};

export default MovieShowtimeCard;
