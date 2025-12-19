import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { theaterService } from "@/services/showtime/theaterService";
import { movieService } from "@/services/movie/movieService";
import MovieShowtimeCard from "@/components/theater/MovieShowtimeCard";
import type {
  TheaterResponse,
  MovieShowtimesResponse,
} from "@/types/showtime/theater.type";
import type { MovieDetail } from "@/types/movie/movie.type";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Function to get theater image based on name
const getTheaterImage = (theaterName: string): string => {
  const name = theaterName.toLowerCase();

  if (name.includes("đà nẵng") || name.includes("da nang")) {
    return "/CineHubDaNang.png";
  }
  if (name.includes("nguyễn trãi") || name.includes("nguyen trai")) {
    return "/CineHubNguyenTrai.png";
  }
  if (name.includes("nguyễn văn cừ") || name.includes("nguyen van cu")) {
    return "/CineHubNguyenVanCu.png";
  }
  if (
    name.includes("quốc học") ||
    name.includes("quoc hoc") ||
    name.includes("huế") ||
    name.includes("hue")
  ) {
    return "/CineHubQuocHocHue.png";
  }
  if (name.includes("siêu nhân") || name.includes("sieu nhan")) {
    return "/CineHubSieuNhan.png";
  }

  return "/buvn.jpg";
};

const TheaterDetail = () => {
  const { theaterId } = useParams<{ theaterId: string }>();
  const { language, t } = useLanguage();
  const [theater, setTheater] = useState<TheaterResponse | null>(null);
  const [moviesWithShowtimes, setMoviesWithShowtimes] = useState<
    Array<{ movie: MovieDetail; showtimes: MovieShowtimesResponse }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!theaterId) return;

    Promise.all([
      theaterService.getTheaterById(theaterId),
      theaterService.getMoviesByTheater(theaterId),
    ])
      .then(async ([theaterData, showtimesData]) => {
        setTheater(theaterData);

        // Fetch movie details for each movieId
        const moviePromises = showtimesData.map(
          (showtime: MovieShowtimesResponse) =>
            movieService.getMovieDetail(showtime.movieId)
        );

        const movieDetails = await Promise.all(moviePromises);

        // Combine movie details with showtimes
        const combined = movieDetails.map(
          (movie: MovieDetail, index: number) => ({
            movie,
            showtimes: showtimesData[index],
          })
        );

        setMoviesWithShowtimes(combined);
      })
      .catch((err) => console.error("Failed to load theater:", err))
      .finally(() => setLoading(false));
  }, [theaterId]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
        </div>
      </Layout>
    );
  }

  if (!theater) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p className="text-gray-700 text-xl">{t("theater.notFound")}</p>
        </div>
      </Layout>
    );
  }

  // Use theater image from backend or fallback to local
  const theaterImage = theater.imageUrl || getTheaterImage(theater.name);

  // Get localized theater data
  const theaterName =
    language === "en" ? theater.nameEn || theater.name : theater.name;
  const theaterAddress =
    language === "en" ? theater.addressEn || theater.address : theater.address;
  const theaterDescription =
    language === "en"
      ? theater.descriptionEn || theater.description
      : theater.description;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100">
        {/* Hero Section */}
        <div className="relative w-full h-[60vh] overflow-hidden">
          <img
            src={theaterImage}
            alt={theaterName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/buvn.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/60 to-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/40 to-gray-100"></div>

          <div className="absolute inset-0 flex items-center justify-center z-10 text-center px-4">
            <div>
              <h1
                className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-wider uppercase"
                style={{
                  textShadow:
                    "0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7), 4px 4px 8px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                }}
              >
                {theaterName}
              </h1>
              <div className="flex items-center justify-center gap-3 text-white text-lg md:text-xl">
                <MapPin size={24} className="text-yellow-400" />
                <p
                  style={{
                    textShadow:
                      "0 0 10px rgba(0,0,0,0.9), 2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                  }}
                >
                  {theaterAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {theaterDescription && (
          <section className="w-full max-w-5xl mx-auto py-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {t("theater.introduction")}
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed text-justify">
              {theaterDescription}
            </p>
          </section>
        )}

        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-extrabold text-yellow-500 mb-8 text-center">
            {t("theater.nowPlaying")}
          </h2>
          {moviesWithShowtimes.length === 0 ? (
            <p className="text-gray-600 text-center py-12">
              {t("theater.noShowtimes")}
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {moviesWithShowtimes.map(({ movie, showtimes }) => (
                <MovieShowtimeCard
                  key={movie.id}
                  movie={movie}
                  showtimes={showtimes}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TheaterDetail;
