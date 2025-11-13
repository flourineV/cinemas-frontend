import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { movieService } from "@/services/movie/movieService";
import { getPosterUrl } from "@/utils/getPosterUrl";
import { Link } from "react-router-dom";
import type { MovieSummary } from "@/types/movie/movie.type";
import TrailerModal from "@/components/ui/TrailerModal";
import { MapPin, Clock, Globe, ShieldAlert } from "lucide-react";
import { formatTitle, formatGenres, formatSpokenLanguages } from "@/utils/format";

const NowPlayingPage = () => {
  const [nowPlaying, setNowPlaying] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    movieService.getNowPlaying(0, 50).then((res) => {
      setNowPlaying(res.content || []);
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <section className="w-full max-w-7xl mx-auto mt-12 px-4 text-white">
        <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-400 text-center mb-8">
          PHIM ĐANG CHIẾU
        </h1>

        {loading ? (
          <p className="text-center text-gray-400">Đang tải phim...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {nowPlaying.map((movie) => (
              <div
                key={movie.id}
                className="group relative flex flex-col transition"
              >
                {/* Poster */}
                <Link to={`/movies/${movie.id}`} className="group relative flex flex-col transition">
                  <div className="relative rounded-sm border border-gray-500 overflow-hidden shadow-md">
                    <img
                      src={getPosterUrl(movie.posterUrl)}
                      alt={movie.title}
                      className="w-full h-[450px] object-cover transition-transform duration-300 transform group-hover:scale-105"
                    />
                    {/* Overlay info khi hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center p-4 text-left">
                      <h3 className="text-lg font-bold text-white mb-2">{formatTitle(movie.title)}</h3>
                      <p className="text-xs font-light mb-1 flex items-center text-white">
                        <MapPin size={14} className="mr-2 text-red-500" /> {formatGenres(movie.genres)}
                      </p>
                      <p className="text-xs font-light mb-1 flex items-center text-white">
                        <Clock size={14} className="mr-2 text-red-500" /> {movie.time}’
                      </p>
                      <p className="text-xs font-light mb-1 flex items-center text-white">
                        <Globe size={14} className="mr-2 text-red-500" /> {formatSpokenLanguages(movie.spokenLanguages)}
                      </p>
                      <p className="text-xs font-light flex items-center text-white">
                        <ShieldAlert size={14} className="mr-2 text-red-500" /> {movie.age}
                      </p>
                    </div>
                  </div>

                  {/* Tên phim bên dưới poster */}
                  <div className="p-3 text-center text-white font-semibold h-[70px] flex items-center justify-center text-lg">
                    {formatTitle(movie.title)}
                  </div>
                </Link>

                {/* Trailer + Đặt vé */}
                <div
                  className={`flex w-full mt-2 space-x-2 px-3 pb-3 ${
                    movie.trailer ? "justify-start" : "justify-center"
                  }`}
                >
                  {movie.trailer && <TrailerModal trailerUrl={movie.trailer} buttonLabel="Trailer" />}
                  <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-3 rounded-sm transition-colors w-1/2">
                    ĐẶT VÉ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default NowPlayingPage;
