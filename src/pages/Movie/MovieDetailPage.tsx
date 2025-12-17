import { useParams, useNavigate } from "react-router-dom";
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
  Star,
} from "lucide-react";
import { formatSpokenLanguages } from "@/utils/format";
import Layout from "../../components/layout/Layout";
import { getPosterUrl } from "../../utils/getPosterUrl";
import { formatAgeRating } from "@/utils/formatAgeRating";
import { movieService } from "@/services/movie/movieService";
import type { MovieDetail } from "@/types/movie/movie.type";
import TrailerModalForDetail from "@/components/movie/TrailerModalForDetail";
import MovieComments from "@/components/comment/MovieComments";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import MovieShowtime from "../Showtime/MovieShowtime";
import { userProfileService } from "@/services/userprofile/userProfileService";
import { useAuthStore } from "@/stores/authStore";
import { reviewService } from "@/services/review/review.service";
import { bookingService } from "@/services/booking/booking.service";
import { useLanguage } from "@/contexts/LanguageContext";

import Swal from "sweetalert2";
dayjs.locale("vi");

type TabType = "info" | "comments";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { language } = useLanguage();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [hasBooked, setHasBooked] = useState<boolean>(false);
  const [checkingBooking, setCheckingBooking] = useState<boolean>(true);

  // Debug useEffect to track hasBooked changes
  useEffect(() => {
    console.log("🔄 [MovieDetail] hasBooked state changed to:", hasBooked);
  }, [hasBooked]);

  // Log render
  console.log(
    "🎬 [MovieDetail] Rendering with hasBooked:",
    hasBooked,
    "checkingBooking:",
    checkingBooking
  );

  useEffect(() => {
    if (!id) return;
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const res = await movieService.getMovieDetail(id, language);
        setMovie(res);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin phim.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id, language]);

  // Check if movie is favorited by user
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user?.id || !movie?.id) return;

      try {
        const isFav = await userProfileService.isFavorite(user.id, movie.id);
        setIsFavorite(isFav);
      } catch (error) {
        console.error("Error checking favorite status:", error);
        setIsFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [user?.id, movie?.id]);

  // Load rating info and check booking status
  useEffect(() => {
    console.log(
      "🔄 [MovieDetail] useEffect triggered - movie?.id:",
      movie?.id,
      "user?.id:",
      user?.id
    );

    const loadRatingAndBooking = async () => {
      if (!movie?.id) {
        console.log("❌ [MovieDetail] No movie ID, returning early");
        return;
      }
      try {
        // Load average rating
        const avgResponse = await reviewService.getAverageRating(movie.id);
        setAvgRating(avgResponse.averageRating || 0);
        setReviewCount(avgResponse.ratingCount || 0);

        // Check if user has booked this movie
        if (user?.id) {
          setCheckingBooking(true);
          console.log("🔍 [MovieDetail] Checking booking for:", {
            userId: user.id,
            movieId: movie.id,
          });

          try {
            const booked = await bookingService.checkUserBookedMovie(
              user.id,
              movie.id
            );

            console.log("✅ [MovieDetail] Booking check result:", booked);
            console.log("✅ [MovieDetail] Type of result:", typeof booked);
            setHasBooked(booked);
            console.log("🔄 [MovieDetail] Setting hasBooked to:", booked);

            // Load user's existing rating if they have booked
            if (booked) {
              console.log("📊 [MovieDetail] Loading user rating...");
              try {
                const myRating = await reviewService.getMyRating(movie.id);
                console.log("📊 [MovieDetail] User rating result:", myRating);
                if (myRating) {
                  setUserRating(myRating.rating);
                }
              } catch (ratingError) {
                console.error(
                  "❌ [MovieDetail] Error loading user rating:",
                  ratingError
                );
                // Don't set hasBooked to false just because rating failed
              }
            }
          } catch (bookingError) {
            console.error(
              "❌ [MovieDetail] Error checking booking:",
              bookingError
            );
            console.log(
              "🔄 [MovieDetail] Setting hasBooked to FALSE due to booking error"
            );
            setHasBooked(false);
          }
        } else {
          console.log(
            "❌ [MovieDetail] No user logged in, setting hasBooked = false"
          );
          console.log(
            "🔄 [MovieDetail] Setting hasBooked to FALSE due to no user"
          );
          setHasBooked(false);
        }
      } catch (err) {
        console.error("❌ [MovieDetail] Error loading rating/booking:", err);
        console.log(
          "🔄 [MovieDetail] Setting hasBooked to FALSE due to outer catch"
        );
        setHasBooked(false);
      } finally {
        setCheckingBooking(false);
      }
    };
    loadRatingAndBooking();
  }, [movie?.id, user?.id]);

  const handleToggleFavorite = async () => {
    if (!user?.id || !movie?.id) {
      Swal.fire({
        icon: "warning",
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để thêm phim yêu thích!",
        confirmButtonText: "Đăng nhập",
        showCancelButton: true,
        cancelButtonText: "Hủy",
        confirmButtonColor: "#f59e0b",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/auth");
        }
      });
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await userProfileService.removeFavorite(user.id, movie.id);
        setIsFavorite(false);
        Swal.fire({
          icon: "success",
          title: "Đã xóa khỏi yêu thích",
          text: "Phim đã được xóa khỏi danh sách yêu thích!",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } else {
        await userProfileService.addFavorite({
          userId: user.id, // Use actual userId from auth
          movieId: movie.id,
        });
        setIsFavorite(true);
        Swal.fire({
          icon: "success",
          title: "Đã thêm vào yêu thích",
          text: "Phim đã được thêm vào danh sách yêu thích!",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể cập nhật phim yêu thích!",
        confirmButtonText: "OK",
        confirmButtonColor: "#f59e0b",
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleRatingClick = async (rating: number) => {
    console.log(
      "⭐ [MovieDetail] Rating click - hasBooked:",
      hasBooked,
      "checkingBooking:",
      checkingBooking
    );

    if (!user) {
      Swal.fire({
        title: "Yêu cầu đăng nhập",
        text: "Bạn cần đăng nhập để đánh giá phim",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#f59e0b",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/auth");
        }
      });
      return;
    }

    if (!hasBooked) {
      console.log("❌ [MovieDetail] Blocking rating - hasBooked is false");
      Swal.fire({
        title: "Chưa đặt vé phim này",
        text: "Bạn cần đặt vé xem phim này để có thể đánh giá",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Đặt vé ngay",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#f59e0b",
      }).then((result) => {
        if (result.isConfirmed) {
          // Scroll to showtime section
          const showtimeSection = document.querySelector("#showtime-section");
          if (showtimeSection) {
            showtimeSection.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
      return;
    }

    console.log("✅ [MovieDetail] Allowing rating - hasBooked is true");

    try {
      await reviewService.upsertRating(movie!.id, { rating });
      setUserRating(rating);

      // Reload average rating
      const newAvgResponse = await reviewService.getAverageRating(movie!.id);
      setAvgRating(newAvgResponse.averageRating || 0);
      setReviewCount(newAvgResponse.ratingCount || 0);

      Swal.fire({
        title: "Đánh giá thành công!",
        text: `Bạn đã đánh giá ${rating} sao cho phim này`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error rating movie:", error);
      Swal.fire({
        title: "Lỗi",
        text: "Không thể gửi đánh giá. Vui lòng thử lại sau.",
        icon: "error",
      });
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
        <div className="relative pt-20 pb-48">
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
              <div className="flex flex-col md:flex-row gap-6 md:items-stretch">
                {/* Poster */}
                <div className="w-full md:w-[300px] lg:w-[350px] flex-shrink-0 mx-auto md:mx-0 flex flex-col">
                  <img
                    src={getPosterUrl(movie.posterUrl)}
                    alt={movie.title}
                    className="w-full h-auto object-cover rounded-xl shadow-2xl border-2 border-yellow-500 transition-all"
                  />

                  {/* Rating dưới poster */}
                  <div className="mt-4 rounded-lg p-4">
                    {/* Combined Rating Display - 5 sao chung */}
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => {
                        // Priority: hover > user rating > average rating
                        let starState = "empty";

                        if (hoverRating > 0) {
                          // Khi đang hover, chỉ hiển thị đúng số sao hover
                          starState = star <= hoverRating ? "hover" : "empty";
                        } else {
                          // Khi không hover, hiển thị user rating hoặc average rating
                          const displayRating =
                            userRating > 0 ? userRating : avgRating;
                          if (star <= Math.floor(displayRating)) {
                            starState = "filled";
                          } else if (
                            star === Math.ceil(displayRating) &&
                            displayRating % 1 >= 0.5
                          ) {
                            starState = "half";
                          }
                        }

                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingClick(star)}
                            onMouseEnter={() =>
                              !checkingBooking && setHoverRating(star)
                            }
                            onMouseLeave={() => setHoverRating(0)}
                            disabled={checkingBooking}
                            className={`transition-transform ${
                              checkingBooking
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer hover:scale-110"
                            }`}
                          >
                            <Star
                              size={32}
                              className={`${
                                starState === "hover"
                                  ? "fill-yellow-400 text-yellow-400"
                                  : starState === "filled"
                                    ? "fill-yellow-500 text-yellow-500"
                                    : starState === "half"
                                      ? "fill-yellow-500/50 text-yellow-500"
                                      : "text-white/30"
                              } transition-colors`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Rating Info */}
                    <div className="flex items-center justify-center gap-4 mb-2">
                      <div className="text-center">
                        <span className="text-white text-xl font-bold">
                          {avgRating.toFixed(1)}
                        </span>
                        <span className="text-white/60 text-sm ml-1">/ 5</span>
                      </div>
                      {userRating > 0 && (
                        <>
                          <div className="w-px h-6 bg-white/30"></div>
                          <div className="text-center">
                            <span className="text-yellow-400 text-sm font-semibold">
                              Bạn: {userRating}/5
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <p className="text-center text-white/80 text-sm">
                      {reviewCount} lượt đánh giá
                    </p>
                  </div>
                </div>

                {/* Movie Info */}
                <div className="flex-1 flex flex-col text-gray-800 min-h-0">
                  <div className="flex items-start justify-between mb-6">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white flex-1">
                      {movie.title}
                    </h1>
                    <button
                      onClick={handleToggleFavorite}
                      disabled={favoriteLoading}
                      className="group flex-shrink-0 ml-4 p-3 rounded-full transition-all disabled:opacity-50"
                      title={
                        isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"
                      }
                    >
                      <Heart
                        className={`w-6 h-6 transition-all duration-200 ${
                          isFavorite
                            ? "fill-red-500 text-red-500"
                            : "text-white group-hover:fill-red-500 group-hover:text-red-500"
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

                  {/* Tab Content - chiều cao cố định và scroll */}
                  <div className="mt-6 flex-1 overflow-hidden">
                    {activeTab === "info" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                      >
                        {/* Movie Details */}
                        <div className="space-y-3 text-sm md:text-base mb-6">
                          <div className="flex items-center gap-3">
                            <Film className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            <span className="text-white">
                              {movie.genres.join(", ")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            <span className="text-white">
                              {movie.time} phút
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Languages className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            <span className="text-white">
                              {formatSpokenLanguages(movie.spokenLanguages)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            <span className="text-white">{movie.country}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            <span className="text-white">
                              {formatAgeRating(movie.age)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-yellow-500 flex-shrink-0" />
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
                                  <MonitorPlay className="w-6 h-6 text-yellow-500 group-hover:text-yellow-700 transition-colors" />
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
                        className="h-full flex flex-col"
                      >
                        <MovieComments
                          movieId={movie.id}
                          userId={user?.id}
                          hasBooked={hasBooked}
                          onCommentSubmit={() => {
                            // Reload reviews after submit
                            if (movie?.id) {
                              reviewService
                                .getReviewsByMovie(movie.id)
                                .then((reviews) =>
                                  setReviewCount(reviews.length)
                                );
                            }
                          }}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section 2: Showtimes with White Background */}
        <div id="showtime-section" className="bg-gray-100 py-10">
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
