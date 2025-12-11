import Layout from "../../components/layout/Layout";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  ShieldCheck,
  TableProperties,
  MapPin,
  Ticket,
  Film,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AnimatedButton from "@/components/ui/AnimatedButton";

// Hooks
import { useCarousel } from "@/hooks/useCarousel";

// API service + types
import { searchService } from "@/services/search/searchService";
import type { SearchResponse } from "@/services/search/searchService";
import type { MovieSummary } from "@/types/movie/movie.type";

// Components
import TrailerModal from "@/components/movie/TrailerModal";
// Utils
import { getPosterUrl } from "@/utils/getPosterUrl";
import {
  formatTitle,
  formatSpokenLanguages,
  formatGenres,
} from "@/utils/format";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const navigate = useNavigate();

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const itemsPerSlide = 4;

  // Fetch search results
  useEffect(() => {
    if (!keyword) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await searchService.search(keyword);
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [keyword]);

  // Carousel
  const movieCarousel = useCarousel(results?.movies || [], itemsPerSlide);

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
                  {movie.time}'
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

  const renderCarousel = () => {
    const movies = results?.movies || [];
    if (movies.length === 0) return null;

    return (
      <div className="relative rounded-2xl">
        <div className="overflow-hidden ">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${movieCarousel.currentIndex * 100}%)`,
            }}
          >
            {Array.from({ length: movieCarousel.totalSlides }).map(
              (_, slideIdx) => {
                const start = slideIdx * itemsPerSlide;
                const end = start + itemsPerSlide;
                const slideItems = movies.slice(start, end);
                return (
                  <div
                    key={slideIdx}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full flex-shrink-0 py-6"
                  >
                    {slideItems.map(renderMovieCard)}
                  </div>
                );
              }
            )}
          </div>
        </div>
        <button
          onClick={movieCarousel.prevSlide}
          className="absolute -left-16 top-[37%] -translate-y-[45%] z-20 p-3 rounded-full text-black"
        >
          <ChevronLeft size={44} />
        </button>
        <button
          onClick={movieCarousel.nextSlide}
          className="absolute -right-16 top-[37%] -translate-y-[45%] z-20 p-3 rounded-full text-black"
        >
          <ChevronRight size={44} />
        </button>
        <div className="flex justify-center mt-3 space-x-2">
          {Array.from({ length: movieCarousel.totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => movieCarousel.goToSlide(idx)}
              className={`w-2 h-2 rounded-full ${idx === movieCarousel.currentIndex ? "bg-black" : "bg-gray-400"}`}
            />
          ))}
        </div>
      </div>
    );
  };

  if (!keyword) {
    return (
      <Layout>
        <div className="w-full min-h-screen pb-16 bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Nhập từ khóa để tìm kiếm</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full min-h-screen pb-16 bg-gray-100 pt-10">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kết quả tìm kiếm cho "{keyword}"
          </h1>
          {!loading && results && (
            <p className="text-gray-600">
              Tìm thấy {results.movies.length} phim và {results.theaters.length}{" "}
              rạp
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
          </div>
        )}

        {/* Results */}
        {!loading && results && (
          <>
            {/* Movies Section */}
            {results.movies.length > 0 && (
              <section className="relative w-full max-w-5xl mx-auto mt-10">
                <div className="relative flex items-center justify-center mb-10">
                  <Film className="w-8 h-8 text-yellow-500 mr-3" />
                  <h2 className="text-2xl md:text-4xl font-extrabold text-yellow-500">
                    PHIM ({results.movies.length})
                  </h2>
                </div>
                {renderCarousel()}
              </section>
            )}

            {/* Theaters Section */}
            {results.theaters.length > 0 && (
              <section className="relative w-full max-w-5xl mx-auto mt-20">
                <div className="relative flex items-center justify-center mb-10">
                  <MapPin className="w-8 h-8 text-yellow-500 mr-3" />
                  <h2 className="text-2xl md:text-4xl font-extrabold text-yellow-500">
                    RẠP CHIẾU ({results.theaters.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.theaters.map((theater) => (
                    <div
                      key={theater.id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 overflow-hidden flex flex-col h-full"
                    >
                      {/* Theater Image */}
                      {theater.imageUrl && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={theater.imageUrl}
                            alt={theater.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                      )}

                      {/* Theater Info */}
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {theater.name}
                        </h3>
                        <div className="flex items-start gap-2 text-gray-600 text-sm mb-3">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p className="line-clamp-2">{theater.address}</p>
                        </div>
                        {theater.provinceName && (
                          <p className="text-xs text-gray-500 mb-4">
                            {theater.provinceName}
                          </p>
                        )}

                        {/* Book Button - Always at bottom */}
                        <button
                          onClick={() => navigate(`/theater/${theater.id}`)}
                          className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2.5 rounded-lg transition-colors mt-auto"
                        >
                          <Ticket className="w-4 h-4" />
                          Đặt vé
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {results.movies.length === 0 && results.theaters.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-xl">
                  Không tìm thấy kết quả nào
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
