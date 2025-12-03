import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Film,
  Clock,
  Languages,
  Globe,
  ShieldCheck,
  Calendar,
  MonitorPlay,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import { getPosterUrl } from "../../utils/getPosterUrl";
import { formatAgeRating } from "@/utils/formatAgeRating";
import { movieService } from "@/services/movie/movieService";
import type { MovieDetail } from "@/types/movie/movie.type";
import TrailerModalForDetail from "@/components/movie/TrailerModalForDetail";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import MovieShowtime from "../Showtime/MovieShowtime";
dayjs.locale("vi");

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const res = await movieService.getMovieDetail(id);
        setMovie(res);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin phim.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  // Loading state
  if (loading)
    return (
      <Layout>
        <div className="relative min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950"></div>
          <div className="relative z-10 text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-lg">Đang tải...</p>
          </div>
        </div>
      </Layout>
    );

  // Error state
  if (error)
    return (
      <Layout>
        <div className="relative min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950"></div>
          <div className="relative z-10 text-center text-red-400 text-xl">
            {error}
          </div>
        </div>
      </Layout>
    );

  // Not found state
  if (!movie)
    return (
      <Layout>
        <div className="relative min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950"></div>
          <div className="relative z-10 text-center text-gray-400 text-xl">
            Không tìm thấy phim.
          </div>
        </div>
      </Layout>
    );

  // Main content
  return (
    <Layout>
      <div className="relative min-h-screen bg-zinc-950 py-20">
        {/* Background with movie poster - Fixed */}
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${getPosterUrl(movie.posterUrl)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        </div>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 max-w-6xl mx-auto px-4 min-h-screen"
        >
          {/* Main Content Card */}
          <div className="bg-zinc-900/90 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800 mb-8">
            <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8">
              {/* Poster */}
              <div className="w-full md:w-[300px] lg:w-[350px] flex-shrink-0 mx-auto md:mx-0">
                <img
                  src={getPosterUrl(movie.posterUrl)}
                  alt={movie.title}
                  className="w-full h-auto object-cover rounded-xl shadow-2xl border-2 border-yellow-400/30 transition-all"
                />
              </div>

              {/* Movie Info */}
              <div className="flex-1 flex flex-col text-white">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-yellow-400">
                  {movie.title}
                </h1>

                <div className="space-y-3 text-sm md:text-base">
                  <div className="flex items-center gap-3">
                    <Film className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-gray-300">
                      {movie.genres.join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-gray-300">{movie.time} phút</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Languages className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-gray-300">
                      {movie.spokenLanguages.join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-gray-300">{movie.country}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-gray-300">
                      {formatAgeRating(movie.age)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-gray-300">{movie.releaseDate}</span>
                  </div>
                </div>

                {(movie.crew?.length > 0 || movie.cast?.length > 0) && (
                  <div className="mt-6 pt-6 border-t border-zinc-700">
                    <h2 className="text-xl font-bold mb-3 text-yellow-400">
                      Thông tin
                    </h2>

                    {movie.crew?.length > 0 && (
                      <p className="text-gray-300 mb-2">
                        <strong className="text-white">Đạo diễn:</strong>{" "}
                        {movie.crew.join(", ")}
                      </p>
                    )}

                    {movie.cast?.length > 0 && (
                      <p className="text-gray-300">
                        <strong className="text-white">Diễn viên:</strong>{" "}
                        {movie.cast.join(", ")}
                      </p>
                    )}
                  </div>
                )}

                {/* Overview */}
                <div className="mt-6 pt-6 border-t border-zinc-700">
                  <h2 className="text-xl font-bold mb-3 text-yellow-400">
                    Nội dung phim
                  </h2>
                  <p className="text-gray-300 text-justify leading-relaxed">
                    {movie.overview}
                  </p>
                </div>

                {/* Trailer */}
                {movie.trailer && (
                  <div className="mt-4">
                    <TrailerModalForDetail
                      trailerUrl={movie.trailer}
                      icon={
                        <span className="flex items-center gap-2 group cursor-pointer -ml-3">
                          <MonitorPlay className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                          <span className="text-yellow-400 group-hover:text-yellow-300 group-hover:underline text-lg font-semibold transition-colors">
                            Xem Trailer
                          </span>
                        </span>
                      }
                      buttonLabel=""
                      className="bg-transparent p-0 hover:bg-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Showtimes */}
          <div className="bg-zinc-900/90 rounded-2xl shadow-2xl border border-zinc-800 p-6">
            <MovieShowtime
              movieId={movie.id}
              movieTitle={movie.title}
              movieStatus={movie.status}
              onSelectShowtime={() => {}}
            />
          </div>
        </motion.main>
      </div>
    </Layout>
  );
}
