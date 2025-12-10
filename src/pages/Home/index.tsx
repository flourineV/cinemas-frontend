import Layout from "../../components/layout/Layout";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  ShieldCheck,
  TableProperties,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import Lottie from "lottie-react";

// Hooks
import { useCarousel } from "@/hooks/useCarousel";

// API service + types
import { movieService } from "@/services/movie/movieService";
import { promotionService } from "@/services/promotion/promotionService";
import type { MovieSummary } from "@/types/movie/movie.type";
import type { PromotionResponse } from "@/types/promotion/promotion.type";

// Components
import QuickBookingBar from "../../components/home/QuickBookingBar";
import TrailerModal from "@/components/movie/TrailerModal";
import ContactForm from "@/components/contact/ContactForm";
// Utils
import { getPosterUrl } from "@/utils/getPosterUrl";
import {
  formatTitle,
  formatSpokenLanguages,
  formatGenres,
} from "@/utils/format";

const Home = () => {
  const navigate = useNavigate();
  const [nowPlaying, setNowPlaying] = useState<MovieSummary[]>([]);
  const [upcoming, setUpcoming] = useState<MovieSummary[]>([]);
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [loadingNowPlaying, setLoadingNowPlaying] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [catAnimation, setCatAnimation] = useState<any>(null);
  const [catInBoxAnimation, setCatInBoxAnimation] = useState<any>(null);
  const [isVisible, setIsVisible] = useState({
    hero: false,
    quickBooking: false,
    nowPlaying: false,
    upcoming: false,
  });
  const itemsPerSlide = 4;

  // Trigger animations on mount
  useEffect(() => {
    setTimeout(() => setIsVisible((prev) => ({ ...prev, hero: true })), 100);
    setTimeout(
      () => setIsVisible((prev) => ({ ...prev, quickBooking: true })),
      300
    );
    setTimeout(
      () => setIsVisible((prev) => ({ ...prev, nowPlaying: true })),
      500
    );
    setTimeout(
      () => setIsVisible((prev) => ({ ...prev, upcoming: true })),
      700
    );
  }, []);

  // Load cat animations
  useEffect(() => {
    fetch("/Loader cat.json")
      .then((res) => res.json())
      .then((data) => setCatAnimation(data))
      .catch((err) => console.error("Failed to load cat animation:", err));

    fetch("/Cat_in_Box.json")
      .then((res) => res.json())
      .then((data) => setCatInBoxAnimation(data))
      .catch((err) =>
        console.error("Failed to load cat in box animation:", err)
      );
  }, []);

  // Fetch movie data
  useEffect(() => {
    movieService
      .getNowPlaying(0, 12)
      .then((res) => {
        console.log("Now Playing Response:", res);
        setNowPlaying(res.content || []);
      })
      .catch((err) => {
        console.error("Error fetching now playing:", err);
        setNowPlaying([]);
      })
      .finally(() => setLoadingNowPlaying(false));

    movieService
      .getUpcoming(0, 12)
      .then((res) => {
        console.log("Upcoming Response:", res);
        setUpcoming(res.content || []);
      })
      .catch((err) => {
        console.error("Error fetching upcoming:", err);
        setUpcoming([]);
      })
      .finally(() => setLoadingUpcoming(false));

    promotionService
      .getAllPromotions()
      .then((res) => {
        console.log("Promotions Response:", res);
        setPromotions(res || []);
      })
      .catch((err) => console.error("Error fetching promotions:", err));
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
          <div className="relative rounded-sm border border-black overflow-hidden shadow-xl">
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
                  <TableProperties
                    size={23}
                    className="mr-2 text-orange-500 flex-shrink-0"
                  />
                  {formatGenres(movie.genres)}
                </p>
                <p className="text-xs font-light mb-2 flex items-center">
                  <Clock
                    size={23}
                    className="mr-2 text-orange-500 flex-shrink-0 "
                  />{" "}
                  {movie.time}’
                </p>
                <p className="text-xs font-light mb-2 flex items-center">
                  <Globe
                    size={23}
                    className="mr-2 text-orange-500 flex-shrink-0"
                  />{" "}
                  {formatSpokenLanguages(movie.spokenLanguages)}
                </p>
                <p className="text-xs font-light flex items-center">
                  <ShieldCheck
                    size={23}
                    className="mr-2 text-orange-500 flex-shrink-0"
                  />{" "}
                  {movie.age}
                </p>
              </div>
            </div>
          </div>
          <div className="p-2 flex items-center justify-center text-center text-black text-base font-extrabold h-[70px] uppercase">
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
          onClick={() => navigate(`/movies/${movie.id}`)}
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
        className="absolute -left-16 top-[37%] -translate-y-[45%] z-20 p-3 rounded-full text-black"
      >
        <ChevronLeft size={44} />
      </button>
      <button
        onClick={carousel.nextSlide}
        className="absolute -right-16 top-[37%] -translate-y-[45%] z-20 p-3 rounded-full text-black"
      >
        <ChevronRight size={44} />
      </button>
      <div className="flex justify-center mt-3 space-x-2">
        {Array.from({ length: carousel.totalSlides }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => carousel.goToSlide(idx)}
            className={`w-2 h-2 rounded-full ${idx === carousel.currentIndex ? "bg-black" : "bg-gray-400"}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="w-full min-h-screen pb-16 bg-gray-100">
        {/* Hero Section */}
        <div
          className={`relative w-full h-[70vh] overflow-hidden transition-all duration-1000 ${isVisible.hero ? "opacity-100" : "opacity-0"}`}
        >
          {/* Background Image */}
          <img
            src="/buvn.jpg"
            alt="Cinema Background"
            className="w-full h-full object-cover"
          />

          {/* Vignette Overlay - Tối xung quanh, sáng ở giữa */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/60 to-black/70"></div>

          {/* Gradient Overlay - Mờ dần xuống và hòa vào background cam */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/40 to-gray-100"></div>

          {/* Content - CINEHUB + Button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <h1
              className="text-4xl md:text-7xl font-extrabold text-white mb-4 tracking-wider"
              style={{
                textShadow:
                  "0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7), 4px 4px 8px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
              }}
            >
              CINEHUB
            </h1>
            <p
              className="text-xl md:text-2xl text-white font-light mb-8"
              style={{
                textShadow:
                  "0 0 10px rgba(0,0,0,0.9), 2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
              }}
            >
              Trải nghiệm điện ảnh đỉnh cao
            </p>
          </div>
        </div>

        {/* QuickBookingBar positioned below hero */}
        <section
          className={`relative w-full max-w-5xl mx-auto z-20 -mt-16 transition-all duration-1000 ${isVisible.quickBooking ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <QuickBookingBar />
        </section>

        <section
          className={`relative w-full max-w-5xl mx-auto mt-10 transition-all duration-1000 ${isVisible.nowPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="relative flex items-center justify-center mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold text-yellow-500">
              PHIM ĐANG CHIẾU
            </h2>
            {catAnimation && (
              <div className="absolute left-1/2 translate-x-[calc(50%+180px)] md:translate-x-[calc(50%+120px)]">
                <Lottie
                  animationData={catAnimation}
                  loop={true}
                  style={{ width: 80, height: 80 }}
                />
              </div>
            )}
          </div>
          {loadingNowPlaying ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
            </div>
          ) : nowPlaying.length === 0 ? (
            <p className="text-black text-center">
              Hiện tại chưa có phim nào được chiếu
            </p>
          ) : (
            renderCarousel(nowPlayingCarousel, nowPlaying)
          )}
          {nowPlaying.length > 0 && (
            <div className="flex justify-center mt-5">
              <Link
                to="/movies/now-playing"
                className="bg-black/80 border border-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-white hover:text-black transition-all shadow-md"
              >
                Xem thêm
              </Link>
            </div>
          )}
        </section>

        {/* ---------------- PHIM SẮP CHIẾU ---------------- */}
        <section
          className={`relative w-full max-w-5xl mx-auto mt-20 transition-all duration-1000 ${isVisible.upcoming ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="relative flex items-center justify-center mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold text-yellow-500">
              PHIM SẮP CHIẾU
            </h2>
            {catInBoxAnimation && (
              <div className="absolute left-1/2 translate-x-[calc(50%+200px)] md:translate-x-[calc(50%+140px)]">
                <Lottie
                  animationData={catInBoxAnimation}
                  loop={true}
                  style={{ width: 60, height: 60 }}
                />
              </div>
            )}
          </div>
          {loadingUpcoming ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
            </div>
          ) : upcoming.length === 0 ? (
            <p className="text-black text-center">
              Hiện tại chưa có phim nào sắp ra mắt
            </p>
          ) : (
            renderCarousel(upcomingCarousel, upcoming)
          )}
          {upcoming.length > 0 && (
            <div className="flex justify-center mt-5">
              <Link
                to="/movies/upcoming"
                className="bg-black/80 border border-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-white hover:text-black transition-all shadow-md"
              >
                Xem thêm
              </Link>
            </div>
          )}
        </section>

        {/* ---------------- KHUYẾN MÃI ---------------- */}
        {promotions.length > 0 && (
          <section className="relative w-full max-w-5xl mx-auto mt-20">
            <div className="relative flex items-center justify-center mb-10">
              <h2 className="text-2xl md:text-4xl font-extrabold text-yellow-500">
                KHUYẾN MÃI HOT
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                >
                  {promo.promoDisplayUrl ? (
                    <img
                      src={promo.promoDisplayUrl}
                      alt={promo.code}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500">
                      <div className="text-center p-6">
                        <p className="text-4xl font-extrabold text-white mb-2">
                          {promo.discountType === "PERCENTAGE"
                            ? `${promo.discountValue}%`
                            : `${promo.discountValue.toLocaleString()}đ`}
                        </p>
                        <p className="text-sm text-white/90">GIẢM GIÁ</p>
                      </div>
                    </div>
                  )}
                  <div className="p-4 bg-white">
                    <p className="text-lg font-bold text-gray-900 mb-1 text-center mb-3">
                      {promo.code}
                    </p>
                    {promo.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {promo.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mb-5">
                      HSD: {new Date(promo.endDate).toLocaleDateString("vi-VN")}
                    </p>
                    <AnimatedButton
                      variant="orange-to-f3ea28"
                      className="w-full"
                      onClick={() => navigate("/movies/now-playing")}
                    >
                      ĐẶT VÉ NGAY
                    </AnimatedButton>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- LIÊN HỆ ---------------- */}
        <section className="relative w-full max-w-5xl mx-auto mt-20 mb-10">
          <div className="relative flex items-center justify-center mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold text-yellow-500">
              LIÊN HỆ VỚI CHÚNG TÔI
            </h2>
          </div>
          <ContactForm />
        </section>
      </div>
    </Layout>
  );
};

export default Home;
