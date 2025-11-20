import Layout from "../../components/layout/Layout";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Globe,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AnimatedButton from "@/components/ui/AnimatedButton";

// Hooks
import { useCarousel } from "@/hooks/useCarousel";

// API service + types
import { movieService } from "@/services/movie/movieService";
import type { MovieSummary } from "@/types/movie/movie.type";

// Components
import QuickBookingBar from "../../components/home/QuickBookingBar";
import TrailerModal from "@/components/movie/TrailerModal";
import BannerCarousel from "@/components/home/BannerCarousel";

// Utils
import { getPosterUrl } from "@/utils/getPosterUrl";
import {
  formatTitle,
  formatSpokenLanguages,
  formatGenres,
} from "@/utils/format";

const images = [
  "https://images.spiderum.com/sp-images/8d5590c080e311ed8a6481196edc880f.jpeg",
  "https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/176175/Originals/poster-film-5.jpg",
  "https://insieutoc.vn/wp-content/uploads/2021/02/poster-ngang.jpg",
];

const Home = () => {
  const [nowPlaying, setNowPlaying] = useState<MovieSummary[]>([]);
  const [upcoming, setUpcoming] = useState<MovieSummary[]>([]);
  const [loadingNowPlaying, setLoadingNowPlaying] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const itemsPerSlide = 4;

  // Fetch movie data
  useEffect(() => {
    movieService
      .getNowPlaying(0, 12)
      .then((res) => setNowPlaying(res.content || []))
      .finally(() => setLoadingNowPlaying(false));
    movieService
      .getUpcoming(0, 12)
      .then((res) => setUpcoming(res.content || []))
      .finally(() => setLoadingUpcoming(false));
  }, []);

  // Carousels
  const nowPlayingCarousel = useCarousel(nowPlaying, itemsPerSlide);
  const upcomingCarousel = useCarousel(upcoming, itemsPerSlide);

  const renderMovieCard = (movie: MovieSummary) => (
    <div key={movie.id} className="relative flex flex-col transition">
      <div className="group">
        <Link
          to={`/movies/${movie.id}`}
          className="relative flex flex-col transition"
        >
          <div className="relative rounded-sm border border-yellow-700 overflow-hidden shadow-md">
            <img
              src={getPosterUrl(movie.posterUrl)}
              alt={movie.title}
              className="w-full h-[400px] object-cover transition-transform duration-300 transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
              <div className="text-white text-left">
                <h3 className="text-lg font-bold mb-2">
                  {formatTitle(movie.title)}
                </h3>
                <p className="text-xs font-light mb-1 flex items-center">
                  <MapPin size={16} className="mr-2 text-red-500" />{" "}
                  {formatGenres(movie.genres)}
                </p>
                <p className="text-xs font-light mb-1 flex items-center">
                  <Clock size={16} className="mr-2 text-red-500" /> {movie.time}
                  ’
                </p>
                <p className="text-xs font-light mb-1 flex items-center">
                  <Globe size={16} className="mr-2 text-red-500" />{" "}
                  {formatSpokenLanguages(movie.spokenLanguages)}
                </p>
                <p className="text-xs font-light flex items-center">
                  <ShieldAlert size={16} className="mr-2 text-red-500" />{" "}
                  {movie.age}
                </p>
              </div>
            </div>
          </div>
          <div className="p-2 flex items-center justify-center text-center text-white text-base font-semibold h-[70px] uppercase">
            {formatTitle(movie.title)}
          </div>
        </Link>
      </div>
      <div
        className={`flex w-full mt-2 space-x-2 ${movie.trailer ? "justify-start" : "justify-center"}`}
      >
        {movie.trailer && (
          <TrailerModal trailerUrl={movie.trailer} buttonLabel="Trailer" />
        )}
        <AnimatedButton
          variant="orange-to-f3ea28"
          className="w-1/2"
          onClick={() => {
            // ví dụ: chuyển tới trang đặt vé
            // nếu dùng react-router navigate, import và dùng useNavigate
            // hoặc thay bằng Link nếu cần
            console.log("Đặt vé cho", movie.id);
          }}
        >
          ĐẶT VÉ
        </AnimatedButton>
      </div>
    </div>
  );

  const renderCarousel = (
    carousel: ReturnType<typeof useCarousel>,
    data: MovieSummary[]
  ) => (
    <div className="relative rounded-2xl">
      <div className="overflow-hidden ">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${carousel.currentIndex * 100}%)` }}
        >
          {Array.from({ length: carousel.totalSlides }).map((_, slideIdx) => {
            const start = slideIdx * itemsPerSlide;
            const end = start + itemsPerSlide;
            const slideItems = data.slice(start, end); // <- dùng đúng data truyền vào
            return (
              <div
                key={slideIdx}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full flex-shrink-0 py-6"
              >
                {slideItems.map(renderMovieCard)}
              </div>
            );
          })}
        </div>
      </div>
      <button
        onClick={carousel.prevSlide}
        className="absolute -left-16 top-[37%] -translate-y-[45%] z-20 p-3 rounded-full text-white"
      >
        <ChevronLeft size={44} />
      </button>
      <button
        onClick={carousel.nextSlide}
        className="absolute -right-16 top-[37%] -translate-y-[45%] z-20 p-3 rounded-full text-white "
      >
        <ChevronRight size={44} />
      </button>
      <div className="flex justify-center mt-3 space-x-2">
        {Array.from({ length: carousel.totalSlides }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => carousel.goToSlide(idx)}
            className={`w-2 h-2 rounded-full ${idx === carousel.currentIndex ? "bg-white" : "bg-gray-500"}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="w-full min-h-screen pb-16">
        {/* ---------------- BANNER ---------------- */}
        <BannerCarousel images={images} />

        {/* ---------------- QUICK BOOKING ---------------- */}
        <section className="relative w-full max-w-5xl mx-auto">
          <QuickBookingBar />
        </section>

        {/* ---------------- PHIM ĐANG CHIẾU ---------------- */}
        <section className="relative w-full max-w-5xl mx-auto mt-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-yellow-400 mb-10 text-center">
            PHIM ĐANG CHIẾU
          </h2>
          {loadingNowPlaying ? (
            <p className="text-white text-center">Đang tải phim...</p>
          ) : nowPlaying.length === 0 ? (
            <p className="text-white text-center">Không có phim nào</p>
          ) : (
            renderCarousel(nowPlayingCarousel, nowPlaying)
          )}
          {nowPlaying.length > 0 && (
            <div className="flex justify-center mt-5">
              <Link
                to="/movies/now-playing"
                className="bg-transparent border border-yellow-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-500 hover:text-black transition"
              >
                Xem thêm
              </Link>
            </div>
          )}
        </section>

        {/* ---------------- PHIM SẮP CHIẾU ---------------- */}
        <section className="relative w-full max-w-6xl mx-auto mt-20">
          <h2 className="text-2xl md:text-3xl font-extrabold text-yellow-400 mb-10 text-center">
            PHIM SẮP CHIẾU
          </h2>
          {loadingUpcoming ? (
            <p className="text-white text-center">Đang tải phim...</p>
          ) : upcoming.length === 0 ? (
            <p className="text-white text-center">Không có phim nào</p>
          ) : (
            renderCarousel(upcomingCarousel, upcoming)
          )}
          {upcoming.length > 0 && (
            <div className="flex justify-center mt-5">
              <Link
                to="/movies/upcoming"
                className="bg-transparent border border-yellow-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-500 hover:text-black transition"
              >
                Xem thêm
              </Link>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Home;
