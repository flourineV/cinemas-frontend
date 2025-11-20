import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Film,
  Clock,
  Languages,
  Globe,
  Shield,
  Calendar,
  MonitorPlay,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import { getPosterUrl } from "../../utils/getPosterUrl";
import { movieService } from "@/services/movie/movieService";
import type { MovieDetail } from "@/types/movie/movie.type";
import type { ShowtimeResponse } from "@/types/showtime/showtime.type";
import TrailerModal from "@/components/movie/TrailerModal";
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
  const [showBookingBar, setShowBookingBar] = useState(false);
  const [selectedShowtime, setSelectedShowtime] =
    useState<ShowtimeResponse | null>(null);

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

  // --- Trạng thái tải ---
  if (loading)
    return (
      <Layout>
        <div className="text-center text-white mt-20">Đang tải...</div>
      </Layout>
    );

  if (error)
    return (
      <Layout>
        <div className="text-center text-red-400 mt-20">{error}</div>
      </Layout>
    );

  if (!movie)
    return (
      <Layout>
        <div className="text-center text-gray-400 mt-20">
          Không tìm thấy phim.
        </div>
      </Layout>
    );

  // --- Giao diện chính ---
  return (
    <Layout>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto text-white pt-10 pb-10"
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster phim */}
          <div className="w-full md:w-[350px] lg:w-[400px] flex-shrink-0 mx-auto md:mx-0">
            <img
              src={getPosterUrl(movie.posterUrl)}
              alt={movie.title}
              className="w-full h-auto object-cover rounded-xl shadow-lg border border-gray-400"
            />
          </div>

          {/* Thông tin phim */}
          <div className="flex-1 flex flex-col ml-5">
            <h1 className="text-2xl md:text-4xl font-extrabold mb-4 text-center md:text-left text-yellow-300">
              {movie.title}
            </h1>
            <div className="space-y-2 text-sm md:text-base">
              <p className="flex items-center gap-2 mt-4">
                <Film className="w-4 h-4 text-yellow-300" />
                <span className="font-bold"></span>
                {movie.genres.join(", ")}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-300" />
                <span className="font-bold"></span> {movie.time}’
              </p>
              <p className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-yellow-300" />
                <span className="font-bold"></span>
                {movie.spokenLanguages.join(", ")}
              </p>
              <p className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-yellow-300" />
                <span className="font-bold ml-2">Quốc gia:</span>{" "}
                {movie.country}
              </p>
              <p className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-yellow-300" />
                <span className="font-bold ml-2">Độ tuổi:</span> {movie.age}
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-300" />
                <span className="font-bold ml-2">Ngày phát hành:</span>{" "}
                {movie.releaseDate}
              </p>
            </div>

            {(movie.crew?.length > 0 || movie.cast?.length > 0) && (
              <div className="mt-8">
                <h2 className="text-lg md:text-2xl font-bold mb-2 flex items-center gap-2 text-yellow-300">
                  Mô tả
                </h2>

                {/* Đạo diễn / Crew */}
                {movie.crew?.length > 0 && (
                  <p>
                    <strong>Đạo diễn:</strong> {movie.crew.join(", ")}
                  </p>
                )}

                {/* Diễn viên / Cast */}
                {movie.cast?.length > 0 && (
                  <p className="mt-2">
                    <strong>Diễn viên:</strong> {movie.cast.join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Nội dung phim */}
            <div className="mt-6">
              <h2 className="text-lg md:text-2xl font-bold mb-2 flex items-center gap-2 text-yellow-300">
                Nội dung phim
              </h2>
              <p className="text-justify leading-relaxed">{movie.overview}</p>
            </div>

            {movie.trailer && (
              <div className="mt-3 -ml-3">
                <TrailerModalForDetail
                  trailerUrl={movie.trailer}
                  icon={
                    <span className="flex items-center gap-2 group cursor-pointer">
                      <MonitorPlay className="w-5 h-5 text-yellow-400 group-hover:text-yellow-600 transition-colors" />
                      <span className="text-yellow-400 group-hover:text-yellow-600 group-hover:underline -mt-1 text-lg md:text-xl font-semibold transition-colors">
                        Trailer
                      </span>
                    </span>
                  }
                  buttonLabel="" // chỉ hiện icon + chữ qua icon prop
                  className="bg-transparent p-0 hover:bg-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* --- Lịch chiếu của phim --- */}
        <div className="mt-12">
          <MovieShowtime
            movieId={movie.id}
            onSelectShowtime={(st) => {
              setShowBookingBar(true);
              setSelectedShowtime(st);
            }}
          />
        </div>
      </motion.main>
    </Layout>
  );
}
