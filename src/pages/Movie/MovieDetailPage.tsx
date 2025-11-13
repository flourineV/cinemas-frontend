import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Film,
  Clock,
  Languages,
  Globe,
  Shield,
  Calendar,
  BookOpen,
  Clapperboard,
  Star,
  MonitorPlay,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import { getPosterUrl } from "../../utils/getPosterUrl";
import { movieService } from "@/services/movie/movieService";
import type { MovieDetail } from "@/types/movie/movie.type";
import ShowtimeList from "../Showtime/ShowtimeList";
import dayjs from "dayjs";
import "dayjs/locale/vi";
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

  // chuyển link YouTube watch sang embed
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    return url;
  };

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
      <main className="max-w-6xl mx-auto px-4 text-white pt-20 md:pt-24 pb-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster phim */}
          <div className="w-full md:w-[350px] lg:w-[400px] flex-shrink-0 mx-auto md:mx-0">
            <img
              src={getPosterUrl(movie.posterUrl)}
              alt={movie.title}
              className="w-full h-auto object-cover rounded-xl shadow-lg"
            />
          </div>

          {/* Thông tin phim */}
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center md:text-left">
              {movie.title}
            </h1>
            <div className="space-y-2 text-sm md:text-base">
              <p className="flex items-center gap-2">
                <Film className="w-4 h-4 text-yellow-400" />
                <span className="font-bold">Thể loại:</span>{" "}
                {movie.genres.join(", ")}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="font-bold">Thời lượng:</span> {movie.time}’
              </p>
              <p className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-yellow-400" />
                <span className="font-bold">Ngôn ngữ:</span>{" "}
                {movie.spokenLanguages.join(", ")}
              </p>
              <p className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-yellow-400" />
                <span className="font-bold">Quốc gia:</span> {movie.country}
              </p>
              <p className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span className="font-bold">Độ tuổi:</span> {movie.age}
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                <span className="font-bold">Ngày phát hành:</span>{" "}
                {movie.releaseDate}
              </p>
            </div>

            {/* Nội dung phim */}
            <div className="mt-6">
              <h2 className="text-lg md:text-xl font-bold mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-400" />
                Nội dung phim
              </h2>
              <p className="text-justify leading-relaxed">{movie.overview}</p>
            </div>

            {/* Đạo diễn */}
            {movie.crew && movie.crew.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg md:text-xl font-semibold mb-2 flex items-center gap-2">
                  <Clapperboard className="w-5 h-5 text-yellow-400" />
                  Đạo diễn
                </h2>
                <p>{movie.crew.join(", ")}</p>
              </div>
            )}

            {/* Diễn viên */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg md:text-xl font-semibold mb-2 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Diễn viên
                </h2>
                <p>{movie.cast.join(", ")}</p>
              </div>
            )}

            {/* Trailer */}
            {movie.trailer && (
              <div className="mt-8">
                <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                  <MonitorPlay className="w-5 h-5 text-yellow-400" />
                  Trailer
                </h2>
                <div className="aspect-video">
                  <iframe
                    src={getEmbedUrl(movie.trailer)}
                    title="Trailer"
                    allowFullScreen
                    className="w-full h-full rounded-xl shadow-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- Lịch chiếu của phim --- */}
        <div className="mt-12">
          <ShowtimeList movie={{ id: movie.id, title: movie.title }} />
        </div>
      </main>
    </Layout>
  );
}
