import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPosterUrl } from "../../utils/image";
import type { MovieDetail } from "@/types"; 
import Layout from "../../components/layout/Layout";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetail | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/movies/${id}`);
        const data = await res.json();
        setMovie(data);
      } catch (error) {
        console.error("Lỗi khi fetch detail:", error);
      }
    };

    fetchMovie();
  }, [id]);

  if (!movie) {
    return <div className="text-center text-white mt-20">Đang tải...</div>;
  }

  return (
    <Layout>
      <main className="max-w-6xl mx-auto px-4 text-white pt-20 md:pt-24">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
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
              <p>
                <span className="font-bold">🎭 Thể loại:</span>{" "}
                {movie.genres.join(", ")}
              </p>
              <p>
                <span className="font-bold">⏱ Thời lượng:</span> {movie.time}’
              </p>
              <p>
                <span className="font-bold">🗣 Ngôn ngữ:</span>{" "}
                {movie.spokenLanguages.join(", ")}
              </p>
              <p>
                <span className="font-bold">🌍 Quốc gia:</span> {movie.country}
              </p>
              <p>
                <span className="font-bold">🔞 Độ tuổi:</span> {movie.age}
              </p>
              <p>
                <span className="font-bold">📅 Ngày phát hành:</span>{" "}
                {movie.releaseDate}
              </p>
            </div>

            {/* Nội dung tóm tắt */}
            <div className="mt-6">
              <h2 className="text-lg md:text-xl font-bold mb-2">📖 Nội dung phim</h2>
              <p className="text-justify leading-relaxed">{movie.overview}</p>
            </div>

            {/* Đạo diễn */}
            <div className="mt-6">
              <h2 className="text-lg md:text-xl font-semibold mb-2">🎬 Đạo diễn</h2>
              <p>{movie.crew.join(", ")}</p>
            </div>

            {/* Diễn viên */}
            <div className="mt-6">
              <h2 className="text-lg md:text-xl font-semibold mb-2">⭐ Diễn viên</h2>
              <p>{movie.cast.join(", ")}</p>
            </div>

            {/* Trailer */}
            {movie.trailer && (
              <div className="mt-8">
                <h2 className="text-lg md:text-xl font-semibold mb-4">📺 Trailer</h2>
                <div className="aspect-video">
                  <iframe
                    src={movie.trailer}
                    title="Trailer"
                    allowFullScreen
                    className="w-full h-full rounded-xl shadow-lg"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
