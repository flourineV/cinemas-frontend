import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { theaterService } from "@/services/showtime/theaterService";
import { movieService } from "@/services/movie/movieService";
import type {
  TheaterResponse,
  MovieShowtimesResponse,
} from "@/types/showtime/theater.type";
import type { MovieDetail } from "@/types/movie/movie.type";
import { MapPin, Clock } from "lucide-react";
import { getPosterUrl } from "@/utils/getPosterUrl";

// Function to get theater image based on name
const getTheaterImage = (theaterName: string): string => {
  const name = theaterName.toLowerCase();

  if (name.includes("đà nẵng") || name.includes("da nang")) {
    return "/CineHubDaNang.png";
  }
  if (name.includes("nguyễn trãi") || name.includes("nguyen trai")) {
    return "/CineHubNguyenTrai.png";
  }
  if (name.includes("nguyễn văn cừ") || name.includes("nguyen van cu")) {
    return "/CineHubNguyenVanCu.png";
  }
  if (
    name.includes("quốc học") ||
    name.includes("quoc hoc") ||
    name.includes("huế") ||
    name.includes("hue")
  ) {
    return "/CineHubQuocHocHue.png";
  }
  if (name.includes("siêu nhân") || name.includes("sieu nhan")) {
    return "/CineHubSieuNhan.png";
  }

  return "/buvn.jpg";
};

const TheaterDetail = () => {
  const { theaterId } = useParams<{ theaterId: string }>();
  const [theater, setTheater] = useState<TheaterResponse | null>(null);
  const [moviesWithShowtimes, setMoviesWithShowtimes] = useState<
    Array<{ movie: MovieDetail; showtimes: MovieShowtimesResponse }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!theaterId) return;

    Promise.all([
      theaterService.getTheaterById(theaterId),
      theaterService.getMoviesByTheater(theaterId),
    ])
      .then(async ([theaterData, showtimesData]) => {
        setTheater(theaterData);

        // Fetch movie details for each movieId
        const moviePromises = showtimesData.map(
          (showtime: MovieShowtimesResponse) =>
            movieService.getMovieDetail(showtime.movieId)
        );

        const movieDetails = await Promise.all(moviePromises);

        // Combine movie details with showtimes
        const combined = movieDetails.map(
          (movie: MovieDetail, index: number) => ({
            movie,
            showtimes: showtimesData[index],
          })
        );

        setMoviesWithShowtimes(combined);
      })
      .catch((err) => console.error("Failed to load theater:", err))
      .finally(() => setLoading(false));
  }, [theaterId]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
        </div>
      </Layout>
    );
  }

  if (!theater) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p className="text-gray-700 text-xl">Không tìm thấy rạp</p>
        </div>
      </Layout>
    );
  }

  const theaterImage = getTheaterImage(theater.name);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100">
        {/* Hero Section */}
        <div className="relative w-full h-[60vh] overflow-hidden">
          <img
            src={theaterImage}
            alt={theater.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/60 to-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/40 to-gray-100"></div>

          <div className="absolute inset-0 flex items-center justify-center z-10 text-center px-4">
            <div>
              <h1
                className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-wider uppercase"
                style={{
                  textShadow:
                    "0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7), 4px 4px 8px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                }}
              >
                {theater.name}
              </h1>
              <div className="flex items-center justify-center gap-3 text-white text-lg md:text-xl">
                <MapPin size={24} className="text-yellow-400" />
                <p
                  style={{
                    textShadow:
                      "0 0 10px rgba(0,0,0,0.9), 2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                  }}
                >
                  {theater.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {theater.description && (
          <section className="w-full max-w-5xl mx-auto px-4 py-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Giới thiệu
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed text-justify">
              {theater.description}
            </p>
          </section>
        )}

        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-extrabold text-yellow-500 mb-8 text-center">
            PHIM ĐANG CHIẾU
          </h2>
          {moviesWithShowtimes.length === 0 ? (
            <p className="text-gray-600 text-center py-12">
              Hiện tại rạp chưa có suất chiếu nào
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {moviesWithShowtimes.map(({ movie, showtimes }) => (
                <div
                  key={movie.id}
                  className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 rounded-xl overflow-hidden shadow-2xl"
                >
                  <div className="flex gap-4 p-6">
                    <Link to={`/movies/${movie.id}`} className="flex-shrink-0">
                      <img
                        src={getPosterUrl(movie.posterUrl)}
                        alt={movie.title}
                        className="w-32 h-48 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform"
                      />
                    </Link>

                    <div className="flex-1">
                      <Link to={`/movies/${movie.id}`}>
                        <h3 className="text-xl font-extrabold text-yellow-400 mb-2 uppercase hover:text-yellow-300 transition-colors">
                          {movie.title}
                        </h3>
                      </Link>
                      <div className="text-gray-300 text-sm space-y-1 mb-4">
                        <p>Thời lượng: {movie.time} phút</p>
                        <p>Độ tuổi: {movie.age}</p>
                      </div>

                      <div className="space-y-3">
                        {showtimes.showtimes.map((showtime) => (
                          <Link
                            key={showtime.showtimeId}
                            to={`/showtime/${showtime.showtimeId}`}
                            className="block border border-purple-400/50 rounded-lg p-3 hover:border-purple-400 hover:bg-purple-800/30 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-yellow-400" />
                                <span className="font-bold text-white">
                                  {new Date(
                                    showtime.startTime
                                  ).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <span className="text-sm text-gray-300">
                                {showtime.roomName}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TheaterDetail;
