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
import { useCarousel } from "@/hooks/useCarousel";
import { useBannerCarousel } from "@/hooks/useBannerCarousel";
import { movieService } from "@/services/movie/movieService";
import type { MovieSummary } from "@/types/movie/movie.type";
import QuickBookingBar from "../../components/ui/QuickBookingBar";
import TrailerModal from "@/components/ui/TrailerModal";
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
  // State
  const [nowPlaying, setNowPlaying] = useState<MovieSummary[]>([]);
  const [upcoming, setUpcoming] = useState<MovieSummary[]>([]);
  const itemsPerSlide = 4;

  // Banner carousel
  const { currentIndex, prevSlide, nextSlide } = useBannerCarousel(
    images.length,
    5000
  );

  // Fetch movie data
  useEffect(() => {
    movieService.getNowPlaying(0, 20).then((res) => setNowPlaying(res.content));
    movieService.getUpcoming(0, 20).then((res) => setUpcoming(res.content));
  }, []);

  // Carousel hooks
  const {
    currentIndex: nowPlayingIndex,
    totalSlides: totalNowPlayingSlides,
    nextSlide: nextMovies,
    prevSlide: prevMovies,
    goToSlide: goToNowPlayingSlide,
  } = useCarousel(nowPlaying, itemsPerSlide);

  const {
    currentIndex: upcomingIndex,
    totalSlides: totalUpcomingSlides,
    nextSlide: nextUpcoming,
    prevSlide: prevUpcoming,
    goToSlide: goToUpcomingSlide,
  } = useCarousel(upcoming, itemsPerSlide);

  return (
    <Layout>
      <div className="w-full min-h-screen pb-16">
        {/* ---------------- BANNER ---------------- */}
        <div className="relative w-full">
          <section className="w-full max-w-5xl mx-auto aspect-[16/6] overflow-hidden rounded-sm shadow-lg">
            <div
              className="flex transition-transform duration-700 ease-in-out h-full"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {images.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Slide ${index}`}
                  className="min-w-full h-full object-cover"
                />
              ))}
            </div>
          </section>

          {/* Nút điều hướng banner */}
          <button
            onClick={prevSlide}
            className="absolute left-28 top-1/2 -translate-y-1/2 p-2 z-10 text-white hidden sm:block focus:outline-none"
          >
            <ChevronLeft size={40} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-28 top-1/2 -translate-y-1/2 p-2 z-10 text-white hidden sm:block focus:outline-none"
          >
            <ChevronRight size={40} />
          </button>
        </div>

        {/* ---------------- QUICK BOOKING ---------------- */}
        <section className="relative w-full max-w-6xl mx-auto mt-8">
          <QuickBookingBar />
        </section>

        {/* ---------------- PHIM ĐANG CHIẾU ---------------- */}
        <section className="relative w-full max-w-6xl mx-auto mt-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-yellow-400 mb-3 text-center">
            PHIM ĐANG CHIẾU
          </h2>

          {nowPlaying.length === 0 ? (
            <p className="text-white text-center">Đang tải phim...</p>
          ) : (
            <div className="relative rounded-2xl">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{
                    transform: `translateX(-${nowPlayingIndex * 100}%)`,
                  }}
                >
                  {Array.from({ length: totalNowPlayingSlides }).map(
                    (_, slideIdx) => (
                      <div
                        key={slideIdx}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full flex-shrink-0 py-6"
                      >
                        {nowPlaying
                          .slice(
                            slideIdx * itemsPerSlide,
                            (slideIdx + 1) * itemsPerSlide
                          )
                          .map((movie) => (
                            <div
                              key={movie.id}
                              className="group relative flex flex-col transition"
                            >
                              <Link
                                to={`/movies/${movie.id}`}
                                className="group relative flex flex-col transition"
                              >
                                <div className="relative rounded-sm border border-gray-500 overflow-hidden shadow-md">
                                  <img
                                    src={getPosterUrl(movie.posterUrl)}
                                    alt={movie.title}
                                    className="w-full h-[400px] object-cover object-cover transition-transform duration-300 transform group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                                    <div className="text-white text-left">
                                      <h3 className="text-lg font-bold mb-2">
                                        {formatTitle(movie.title)}
                                      </h3>
                                      <p className="text-xs font-light mb-1 flex items-center">
                                        <MapPin
                                          size={16}
                                          className="mr-2 text-red-500"
                                        />
                                        {formatGenres(movie.genres)}
                                      </p>
                                      <p className="text-xs font-light mb-1 flex items-center">
                                        <Clock
                                          size={16}
                                          className="mr-2 text-red-500"
                                        />
                                        {movie.time}’
                                      </p>
                                      <p className="text-xs font-light mb-1 flex items-center">
                                        <Globe
                                          size={16}
                                          className="mr-2 text-red-500"
                                        />
                                        {formatSpokenLanguages(
                                          movie.spokenLanguages
                                        )}
                                      </p>
                                      <p className="text-xs font-light flex items-center">
                                        <ShieldAlert
                                          size={16}
                                          className="mr-2 text-red-500"
                                        />
                                        {movie.age}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-2 flex items-center justify-center text-center text-white text-base font-medium h-[70px]">
                                  {formatTitle(movie.title)}
                                </div>
                              </Link>

                              <div
                                className={`flex w-full mt-2 space-x-2 ${
                                  movie.trailer
                                    ? "justify-start"
                                    : "justify-center"
                                }`}
                              >
                                {movie.trailer && (
                                  <TrailerModal
                                    trailerUrl={movie.trailer}
                                    buttonLabel="Trailer"
                                  />
                                )}

                                <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-3 rounded-sm transition-colors w-1/2">
                                  ĐẶT VÉ
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Navigation + dots */}
              <button
                onClick={prevMovies}
                className="absolute -left-16 top-[45%] -translate-y-[45%] z-20 bg-black/40 hover:bg-black/60 p-3 rounded-full text-white shadow-lg"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={nextMovies}
                className="absolute -right-16 top-[45%] -translate-y-[45%] z-20 bg-black/40 hover:bg-black/60 p-3 rounded-full text-white shadow-lg"
              >
                <ChevronRight size={28} />
              </button>

              <div className="flex justify-center mt-3 space-x-2">
                {Array.from({ length: totalNowPlayingSlides }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToNowPlayingSlide(idx)}
                    className={`w-3 h-3 rounded-full ${idx === nowPlayingIndex ? "bg-white" : "bg-gray-500"}`}
                  ></button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center mt-5">
            <Link
              to="/movies/now-playing"
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Xem thêm
            </Link>
          </div>
        </section>

        {/* ---------------- PHIM SẮP CHIẾU ---------------- */}
        <section className="relative w-full max-w-6xl mx-auto mt-16">
          <h2 className="text-2xl md:text-3xl font-extrabold text-yellow-400 mb-3 text-center">
            PHIM SẮP CHIẾU
          </h2>

          {upcoming.length === 0 ? (
            <p className="text-white text-center">Đang tải phim...</p>
          ) : (
            <div className="relative rounded-2xl">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${upcomingIndex * 100}%)` }}
                >
                  {Array.from({ length: totalUpcomingSlides }).map(
                    (_, slideIdx) => (
                      <div
                        key={slideIdx}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full flex-shrink-0 py-6"
                      >
                        {upcoming
                          .slice(
                            slideIdx * itemsPerSlide,
                            (slideIdx + 1) * itemsPerSlide
                          )
                          .map((movie) => (
                            <div
                              key={movie.id}
                              className="group relative flex flex-col transition"
                            >
                              <Link
                                to={`/movies/${movie.id}`}
                                className="group relative flex flex-col transition"
                              >
                                <div className="relative rounded-sm border border-gray-500 overflow-hidden shadow-md">
                                  <img
                                    src={getPosterUrl(movie.posterUrl)}
                                    alt={movie.title}
                                    className="w-full h-[400px] object-cover object-cover transition-transform duration-300 transform group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                                    <div className="text-white text-left">
                                      <h3 className="text-lg font-bold mb-2">
                                        {formatTitle(movie.title)}
                                      </h3>
                                      <p className="text-xs font-light mb-1 flex items-center">
                                        <MapPin
                                          size={16}
                                          className="mr-2 text-red-500"
                                        />
                                        {formatGenres(movie.genres)}
                                      </p>
                                      <p className="text-xs font-light mb-1 flex items-center">
                                        <Clock
                                          size={16}
                                          className="mr-2 text-red-500"
                                        />
                                        {movie.time}’
                                      </p>
                                      <p className="text-xs font-light mb-1 flex items-center">
                                        <Globe
                                          size={16}
                                          className="mr-2 text-red-500"
                                        />
                                        {formatSpokenLanguages(
                                          movie.spokenLanguages
                                        )}
                                      </p>
                                      <p className="text-xs font-light flex items-center">
                                        <ShieldAlert
                                          size={16}
                                          className="mr-2 text-red-500"
                                        />
                                        {movie.age}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-2 flex items-center justify-center text-center text-white text-base font-medium h-[70px]">
                                  {formatTitle(movie.title)}
                                </div>
                              </Link>

                              <div
                                className={`flex w-full mt-2 space-x-2 ${
                                  movie.trailer
                                    ? "justify-start"
                                    : "justify-center"
                                }`}
                              >
                                {movie.trailer && (
                                  <TrailerModal
                                    trailerUrl={movie.trailer}
                                    buttonLabel="Trailer"
                                  />
                                )}

                                <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-3 rounded-sm transition-colors w-1/2">
                                  ĐẶT VÉ
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Navigation + dots */}
              <button
                onClick={prevUpcoming}
                className="absolute -left-16 top-[45%] -translate-y-[45%] z-20 bg-black/40 hover:bg-black/60 p-3 rounded-full text-white shadow-lg"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={nextUpcoming}
                className="absolute -right-16 top-[45%] -translate-y-[45%] z-20 bg-black/40 hover:bg-black/60 p-3 rounded-full text-white shadow-lg"
              >
                <ChevronRight size={28} />
              </button>

              <div className="flex justify-center mt-3 space-x-2">
                {Array.from({ length: totalUpcomingSlides }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToUpcomingSlide(idx)}
                    className={`w-3 h-3 rounded-full ${idx === upcomingIndex ? "bg-white" : "bg-gray-500"}`}
                  ></button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center mt-5">
            <Link
              to="/movies/upcoming"
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Xem thêm
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
