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
      <main className="max-w-6xl mx-auto px-4 text-white pt-20 md:pt-24 pb-10">
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

        {/* Lịch chiếu */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-center mb-6">LỊCH CHIẾU</h2>

          {/* Chọn ngày */}
          <div className="flex justify-center gap-4 mb-6 flex-wrap">
            <button className="px-4 py-2 rounded-md bg-yellow-400 text-black font-bold">
              29/09<br />Thứ Hai
            </button>
            <button className="px-4 py-2 rounded-md border border-yellow-400 text-yellow-400">
              30/09<br />Thứ Ba
            </button>
            <button className="px-4 py-2 rounded-md border border-yellow-400 text-yellow-400">
              01/10<br />Thứ Tư
            </button>
            <button className="px-4 py-2 rounded-md border border-yellow-400 text-yellow-400">
              02/10<br />Thứ Năm
            </button>
          </div>

          {/* Danh sách rạp */}
          <div className="bg-purple-700 rounded-xl p-4 shadow-md max-w-2xl mx-auto">
            <h3 className="font-semibold text-lg mb-2">
              Cinestar Satra Quận 6 (TP.HCM)
            </h3>
            <p className="text-sm text-gray-200 mb-2">
              Tầng 6, TTTM Satra Võ Văn Kiệt, 1466 Võ Văn Kiệt, Phường 1, Quận 6, TP.HCM
            </p>
            <p className="text-sm mb-2">Standard</p>
            <div className="flex gap-2 flex-wrap">
              <button className="px-3 py-1 border border-white rounded-md hover:bg-white hover:text-black">
                23:00
              </button>
            </div>
           </div>
        </div>
      </main>
    </Layout>
  );
}
