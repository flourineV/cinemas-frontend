import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { theaterService } from "@/services/showtime/theaterService";
import { movieService } from "@/services/movie/movieService";
import { CustomSelect } from "@/components/ui/CustomSelect";
import type {
  TheaterResponse,
  MoviesWithTheatersResponse,
} from "@/types/showtime/theater.type";
import type { MovieSummary } from "@/types/movie/movie.type";
import { Calendar, Film, MapPin } from "lucide-react";
import { getPosterUrl } from "@/utils/getPosterUrl";
import { useNavigate } from "react-router-dom";

interface MovieWithShowtimes {
  movie: MovieSummary;
  theaters: Array<{
    theaterId: string;
    theaterName: string;
    theaterAddress: string;
    showtimes: Array<{
      showtimeId: string;
      startTime: string;
      endTime: string;
    }>;
  }>;
}

const ShowtimePage = () => {
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [movieShowtimes, setMovieShowtimes] = useState<MovieWithShowtimes[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filter states
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedTheater, setSelectedTheater] = useState("");

  // Generate date options (next 7 days)
  const generateDateOptions = () => {
    const options = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const value = date.toISOString().split("T")[0];
      const label =
        i === 0
          ? `Hôm Nay ${date.getDate()}/${date.getMonth() + 1}`
          : i === 1
            ? `Ngày Mai ${date.getDate()}/${date.getMonth() + 1}`
            : `${date.getDate()}/${date.getMonth() + 1}`;

      options.push({ value, label });
    }
    return options;
  };

  const dateOptions = generateDateOptions();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [theaterList, nowPlayingRes] = await Promise.all([
          theaterService.getAllTheaters(),
          movieService.getNowPlaying(0, 50),
        ]);

        setTheaters(theaterList);
        setMovies(nowPlayingRes.content);

        // Set default date to today
        const today = dateOptions[0].value;
        setSelectedDate(today);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    loadInitialData();
  }, []);

  // Load showtimes when filters change
  useEffect(() => {
    if (!selectedDate) return;

    const loadShowtimes = async () => {
      try {
        setLoading(true);

        // Call API with filters
        const showtimeData = await theaterService.getMoviesWithTheaters(
          selectedDate,
          selectedMovie || undefined,
          selectedTheater || undefined
        );

        // Combine with movie details
        const movieShowtimeResults: MovieWithShowtimes[] = [];

        for (const item of showtimeData) {
          // Find movie details
          const movie = movies.find((m) => m.id === item.movieId);
          if (movie) {
            movieShowtimeResults.push({
              movie,
              theaters: item.theaters,
            });
          }
        }

        setMovieShowtimes(movieShowtimeResults);
      } catch (error) {
        console.error("Error loading showtimes:", error);
        setMovieShowtimes([]);
      } finally {
        setLoading(false);
      }
    };

    loadShowtimes();
  }, [selectedDate, selectedMovie, selectedTheater, movies]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && movieShowtimes.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 text-gray-900 pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-yellow-500 mb-4">
              LỊCH CHIẾU PHIM
            </h1>
            <p className="text-gray-600 text-lg">
              Tìm suất chiếu phù hợp với bạn
            </p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Date Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-yellow-400 font-semibold">
                <Calendar className="w-5 h-5" />
                <span>1. Ngày</span>
              </div>
              <CustomSelect
                variant="light"
                options={dateOptions}
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Chọn ngày"
              />
            </div>

            {/* Movie Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-yellow-400 font-semibold">
                <Film className="w-5 h-5" />
                <span>2. Phim</span>
              </div>
              <CustomSelect
                variant="light"
                options={[
                  { value: "", label: "Chọn Phim" },
                  ...movies.map((movie) => ({
                    value: movie.id,
                    label: movie.title,
                  })),
                ]}
                value={selectedMovie}
                onChange={setSelectedMovie}
                placeholder="Chọn phim"
              />
            </div>

            {/* Theater Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-yellow-400 font-semibold">
                <MapPin className="w-5 h-5" />
                <span>3. Rạp</span>
              </div>
              <CustomSelect
                variant="light"
                options={[
                  { value: "", label: "Chọn Rạp" },
                  ...theaters.map((theater) => ({
                    value: theater.id,
                    label: theater.name,
                  })),
                ]}
                value={selectedTheater}
                onChange={setSelectedTheater}
                placeholder="Chọn rạp"
              />
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-500"></div>
            </div>
          ) : movieShowtimes.length > 0 ? (
            <div className="space-y-8">
              {movieShowtimes.map((movieShowtime) => (
                <div
                  key={movieShowtime.movie.id}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                >
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Movie Info */}
                    <div className="lg:w-80 flex-shrink-0">
                      {/* Movie Poster */}
                      <div className="mb-4">
                        <img
                          src={getPosterUrl(movieShowtime.movie.posterUrl)}
                          alt={movieShowtime.movie.title}
                          className="w-full h-96 object-cover rounded-lg"
                        />
                      </div>

                      {/* Movie Details */}
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-900 uppercase">
                          {movieShowtime.movie.title}
                        </h2>

                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                            <span>Kinh Dị</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                            <span>T{movieShowtime.movie.age}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                            <span>Việt Nam</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                            <span>Phụ Đề</span>
                          </div>
                          <div className="flex items-center gap-2 text-yellow-600">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                            <span>
                              T13. Phim dành cho khán giả từ đủ 13 tuổi trở lên
                              (13+)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Theater Showtimes */}
                    <div className="flex-1">
                      <div className="space-y-6">
                        {movieShowtime.theaters.map((theaterData) => (
                          <div
                            key={theaterData.theaterId}
                            className="border-b border-gray-300 pb-6 last:border-b-0"
                          >
                            {/* Theater Info */}
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                Cinestar
                              </h3>
                              <h4 className="text-xl font-bold text-gray-900 mb-2">
                                {theaterData.theaterName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {theaterData.theaterAddress}
                              </p>
                            </div>

                            {/* Showtimes */}
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600 uppercase">
                                STANDARD
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {theaterData.showtimes.map((showtime) => (
                                  <button
                                    key={showtime.showtimeId}
                                    onClick={() =>
                                      navigate(
                                        `/booking/${showtime.showtimeId}`
                                      )
                                    }
                                    className="px-4 py-2 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-semibold rounded transition-colors"
                                  >
                                    {formatTime(showtime.startTime)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-gray-600 text-xl mb-2">Chưa có suất chiếu</p>
              <p className="text-gray-500">
                Vui lòng thử chọn ngày hoặc rạp khác
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ShowtimePage;
