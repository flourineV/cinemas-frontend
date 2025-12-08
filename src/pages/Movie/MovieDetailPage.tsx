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
  Heart,
  MessageCircle,
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
import { userProfileService } from "@/services/userprofile/userProfileService";
import { useAuthStore } from "@/stores/authStore";
dayjs.locale("vi");

type TabType = "info" | "comments";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

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

  // Check if movie is in favorites
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user?.id || !movie?.tmdbId) return;
      try {
        const favorites = await userProfileService.getFavorites(user.id);
        setIsFavorite(favorites.some((fav) => fav.tmdbId === movie.tmdbId));
      } catch (err) {
        console.error("Error checking favorite:", err);
      }
    };
    checkFavorite();
  }, [user?.id, movie?.tmdbId]);

  const handleToggleFavorite = async () => {
    if (!user?.id || !movie?.tmdbId) {
      alert("Vui lòng đăng nhập để thêm phim yêu thích!");
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await userProfileService.removeFavorite(user.id, movie.tmdbId);
        setIsFavorite(false);
      } else {
        await userProfileService.addFavorite({
          userId: user.id,
          tmdbId: movie.tmdbId,
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      alert("Không thể cập nhật phim yêu thích!");
    } finally {
      setFavoriteLoading(false);
    }
  };

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
      <div className="min-h-screen">
        {/* Section 1: Movie Info with Poster Background */}
        <div className="relative pt-20 pb-24 min-h-[900px]">
          {/* Background with movie poster */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${getPosterUrl(movie.posterUrl)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            {/* Gradient Overlay - Mờ dần xuống và hòa vào background trắng */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/40 to-gray-100"></div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 max-w-5xl mx-auto"
          >
            {/* Main Content Card */}
            <div className="rounded-2xl">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster */}
                <div className="w-full md:w-[300px] lg:w-[350px] flex-shrink-0 mx-auto md:mx-0">
                  <img
                    src={getPosterUrl(movie.posterUrl)}
                    alt={movie.title}
                    className="w-full h-auto object-cover rounded-xl shadow-2xl border-2 border-yellow-500 transition-all"
                  />
                </div>

                {/* Movie Info */}
                <div className="flex-1 flex flex-col text-gray-800">
                  <div className="flex items-start justify-between mb-6">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white flex-1">
                      {movie.title}
                    </h1>
                    <button
                      onClick={handleToggleFavorite}
                      disabled={favoriteLoading}
                      className="flex-shrink-0 ml-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50"
                      title={
                        isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"
                      }
                    >
                      <Heart
                        className={`w-6 h-6 transition-colors ${
                          isFavorite
                            ? "fill-red-500 text-red-500"
                            : "text-white"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Tabs Navigation */}
                  <div className="border-b border-white/20">
                    <div className="flex gap-8">
                      <button
                        onClick={() => setActiveTab("info")}
                        className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                          activeTab === "info"
                            ? "border-yellow-500 text-white"
                            : "border-transparent text-white/60 hover:text-white/80"
                        }`}
                      >
                        <Film className="w-5 h-5" />
                        <span className="font-semibold">Thông tin phim</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("comments")}
                        className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                          activeTab === "comments"
                            ? "border-yellow-500 text-white"
                            : "border-transparent text-white/60 hover:text-white/80"
                        }`}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-semibold">Bình luận</span>
                      </button>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="mt-6">
                    {activeTab === "info" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Movie Details */}
                        <div className="space-y-3 text-sm md:text-base mb-6">
                          <div className="flex items-center gap-3">
                            <Film className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            <span className="text-white">
                              {movie.genres.join(", ")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            <span className="text-white">
                              {movie.time} phút
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Languages className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            <span className="text-white">
                              {movie.spokenLanguages.join(", ")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            <span className="text-white">{movie.country}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            <span className="text-white">
                              {formatAgeRating(movie.age)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            <span className="text-white">
                              {movie.releaseDate}
                            </span>
                          </div>
                        </div>

                        {/* Trailer */}
                        {movie.trailer && (
                          <div className="mb-6">
                            <TrailerModalForDetail
                              trailerUrl={movie.trailer}
                              icon={
                                <span className="flex items-center gap-2 group cursor-pointer -ml-3">
                                  <MonitorPlay className="w-6 h-6 text-orange-500 group-hover:text-yellow-700 transition-colors" />
                                  <span className="text-white group-hover:text-yellow-700 group-hover:underline text-lg font-semibold transition-colors">
                                    Xem Trailer
                                  </span>
                                </span>
                              }
                              buttonLabel=""
                              className="bg-transparent p-0 hover:bg-transparent"
                            />
                          </div>
                        )}

                        {(movie.crew?.length > 0 || movie.cast?.length > 0) && (
                          <div className="pt-6 border-t border-gray-300">
                            <h2 className="text-xl font-bold mb-3 text-white">
                              Thông tin
                            </h2>

                            {movie.crew?.length > 0 && (
                              <p className="text-white mb-2">
                                <strong className="text-white">
                                  Đạo diễn:
                                </strong>{" "}
                                {movie.crew.join(", ")}
                              </p>
                            )}

                            {movie.cast?.length > 0 && (
                              <p className="text-white">
                                <strong className="text-white">
                                  Diễn viên:
                                </strong>{" "}
                                {movie.cast.join(", ")}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Overview */}
                        <div className="mt-6 pt-6 border-t border-gray-300">
                          <h2 className="text-xl font-bold mb-3 text-white">
                            Nội dung phim
                          </h2>
                          <p className="text-white text-justify leading-relaxed">
                            {movie.overview}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "comments" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-16"
                      >
                        <MessageCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Chưa có bình luận
                        </h3>
                        <p className="text-white/60">
                          Hãy là người đầu tiên bình luận về phim này
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section 2: Showtimes with White Background */}
        <div className="bg-gray-100 py-10">
          <div className="max-w-6xl mx-auto px-4">
            <MovieShowtime
              movieId={movie.id}
              movieTitle={movie.title}
              movieStatus={movie.status}
              onSelectShowtime={() => {}}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
