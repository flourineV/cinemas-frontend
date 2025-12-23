import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { theaterService } from "@/services/showtime/theaterService";
import { movieService } from "@/services/movie/movieService";
import CustomSelect from "@/components/ui/CustomSelect";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import type { MovieSummary } from "@/types/movie/movie.type";
import {
  Calendar,
  Film,
  MapPin,
  Clock,
  Languages,
  ShieldCheck,
} from "lucide-react";
import { getPosterUrl } from "@/utils/getPosterUrl";
import { useNavigate } from "react-router-dom";
import { formatSpokenLanguages } from "@/utils/format";
import { formatAgeRating } from "@/utils/formatAgeRating";
import { useLanguage } from "@/contexts/LanguageContext";

interface MovieWithShowtimes {
  movie: MovieSummary;
  theaters: Array<{
    theaterId: string;
    theaterName: string;
    theaterNameEn?: string;
    theaterAddress: string;
    theaterAddressEn?: string;
    showtimes: Array<{
      showtimeId: string;
      startTime: string;
      endTime: string;
    }>;
  }>;
}

const ShowtimePage = () => {
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [movieShowtimes, setMovieShowtimes] = useState<MovieWithShowtimes[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  // Filter states
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedTheater, setSelectedTheater] = useState("");

  // Generate date options (next 5 days)
  const generateDateOptions = () => {
    const options = [];
    const today = new Date();

    // Debug: Log current date and timezone
    console.log("🗓️ [ShowtimePage] Current date:", today);
    console.log(
      "🗓️ [ShowtimePage] Timezone offset:",
      today.getTimezoneOffset()
    );

    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Use local date format to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const value = `${year}-${month}-${day}`;

      console.log(`🗓️ [ShowtimePage] Date ${i}: ${value}`);

      let label: string;
      if (language === "en") {
        label =
          i === 0
            ? `Today ${date.getMonth() + 1}/${date.getDate()}`
            : i === 1
              ? `Tomorrow ${date.getMonth() + 1}/${date.getDate()}`
              : `${date.getMonth() + 1}/${date.getDate()}`;
      } else {
        label =
          i === 0
            ? `Hôm Nay ${date.getDate()}/${date.getMonth() + 1}`
            : i === 1
              ? `Ngày Mai ${date.getDate()}/${date.getMonth() + 1}`
              : `${date.getDate()}/${date.getMonth() + 1}`;
      }

      options.push({ value, label });
    }
    return options;
  };

  const dateOptions = generateDateOptions();

  // Cache keys and duration
  const CACHE_KEY_THEATERS = "showtime_theaters_cache";
  const CACHE_KEY_MOVIES = "showtime_movies_cache";
  const CACHE_KEY_SHOWTIMES = "showtime_data_cache";
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Helper to get/set cache
  const getCache = <T,>(key: string): { data: T; timestamp: number } | null => {
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          return parsed;
        }
      }
    } catch {}
    return null;
  };

  const setCache = <T,>(key: string, data: T) => {
    try {
      sessionStorage.setItem(
        key,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch {}
  };

  // Process showtime data with movies
  const processShowtimeData = (
    showtimeData: Array<{
      movieId: string;
      theaters: MovieWithShowtimes["theaters"];
    }>,
    movieList: MovieSummary[]
  ): MovieWithShowtimes[] => {
    const results: MovieWithShowtimes[] = [];
    for (const item of showtimeData) {
      const movie = movieList.find((m) => m.id === item.movieId);
      if (movie) {
        results.push({ movie, theaters: item.theaters });
      }
    }
    return results.sort(
      (a, b) => (b.movie.popularity || 0) - (a.movie.popularity || 0)
    );
  };

  // Load all initial data in parallel
  useEffect(() => {
    const today = dateOptions[0].value;

    const loadAllData = async () => {
      // Check all caches first
      const cachedTheaters = getCache<TheaterResponse[]>(CACHE_KEY_THEATERS);
      const cachedMovies = getCache<MovieSummary[]>(CACHE_KEY_MOVIES);
      const showtimeCacheKey = `${CACHE_KEY_SHOWTIMES}_${today}_all_all`;
      const cachedShowtimes = getCache<MovieWithShowtimes[]>(showtimeCacheKey);

      // If all cached, use immediately
      if (cachedTheaters && cachedMovies && cachedShowtimes) {
        setTheaters(cachedTheaters.data);
        setMovies(cachedMovies.data);
        setMovieShowtimes(cachedShowtimes.data);
        setSelectedDate(today);
        setLoading(false);
        return;
      }

      // Load from API in parallel
      try {
        const [theaterList, nowPlayingRes, showtimeData] = await Promise.all([
          cachedTheaters
            ? Promise.resolve(cachedTheaters.data)
            : theaterService.getAllTheaters(),
          cachedMovies
            ? Promise.resolve({ content: cachedMovies.data })
            : movieService.getNowPlaying(0, 50),
          theaterService.getMoviesWithTheaters(today, undefined, undefined),
        ]);

        // Cache results
        if (!cachedTheaters) setCache(CACHE_KEY_THEATERS, theaterList);
        if (!cachedMovies) setCache(CACHE_KEY_MOVIES, nowPlayingRes.content);

        const movieList = nowPlayingRes.content;
        const processed = processShowtimeData(showtimeData, movieList);
        setCache(showtimeCacheKey, processed);

        setTheaters(theaterList);
        setMovies(movieList);
        setMovieShowtimes(processed);
        setSelectedDate(today);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Track if initial load is done
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Load showtimes when filters change (not on initial load)
  useEffect(() => {
    // Skip if no date selected or still loading initial data
    if (!selectedDate || movies.length === 0) return;

    // Skip only the very first render after initial load
    const today = dateOptions[0].value;
    if (
      !initialLoadDone &&
      selectedDate === today &&
      !selectedMovie &&
      !selectedTheater &&
      movieShowtimes.length > 0
    ) {
      setInitialLoadDone(true);
      return;
    }

    const loadShowtimes = async () => {
      const cacheKey = `${CACHE_KEY_SHOWTIMES}_${selectedDate}_${selectedMovie || "all"}_${selectedTheater || "all"}`;

      // Check cache first
      const cached = getCache<MovieWithShowtimes[]>(cacheKey);
      if (cached) {
        setMovieShowtimes(cached.data);
        return;
      }

      try {
        setLoading(true);

        console.log("🔍 [ShowtimePage] Calling API with date:", selectedDate);
        console.log("🔍 [ShowtimePage] Movie filter:", selectedMovie || "all");
        console.log(
          "🔍 [ShowtimePage] Theater filter:",
          selectedTheater || "all"
        );

        const showtimeData = await theaterService.getMoviesWithTheaters(
          selectedDate,
          selectedMovie || undefined,
          selectedTheater || undefined
        );

        console.log("✅ [ShowtimePage] API Response:", showtimeData);
        console.log("✅ [ShowtimePage] Number of movies:", showtimeData.length);

        const processed = processShowtimeData(showtimeData, movies);
        setCache(cacheKey, processed);
        setMovieShowtimes(processed);
      } catch (error) {
        console.error("❌ [ShowtimePage] Error loading showtimes:", error);
        setMovieShowtimes([]);
      } finally {
        setLoading(false);
      }
    };

    loadShowtimes();
  }, [selectedDate, selectedMovie, selectedTheater, movies]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && movieShowtimes.length === 0) {
    return (
      <Layout>
        <div
          className="min-h-screen flex items-center justify-center relative"
          style={{
            backgroundImage: "url('/background_profile.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 relative z-10"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="min-h-screen text-gray-900 pt-8 pb-36 relative"
        style={{
          backgroundImage: "url('/background_profile.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Dark overlay to not overpower content */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-yellow-500 mb-3">
              {t("showtime.title")}
            </h1>
            <p className="text-gray-300 font-light text-lg">
              {t("showtime.subtitle")}
            </p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Date Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-lg text-white">
                <Calendar className="w-5 h-5 text-yellow-500" />
                <span>1. {t("showtime.date")}</span>
              </div>
              <CustomSelect
                variant="solid"
                options={dateOptions}
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder={t("showtime.selectDate")}
              />
            </div>

            {/* Movie Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-lg text-white">
                <Film className="w-5 h-5 text-yellow-500" />
                <span>2. {t("showtime.movie")}</span>
              </div>
              <CustomSelect
                variant="solid"
                options={[
                  { value: "", label: t("showtime.selectMovie") },
                  ...movies.map((movie) => ({
                    value: movie.id,
                    label: movie.title,
                  })),
                ]}
                value={selectedMovie}
                onChange={setSelectedMovie}
                placeholder={t("showtime.selectMovie")}
              />
            </div>

            {/* Theater Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-lg text-white">
                <MapPin className="w-5 h-5 text-yellow-500" />
                <span>3. {t("showtime.theater")}</span>
              </div>
              <CustomSelect
                variant="solid"
                options={[
                  { value: "", label: t("showtime.selectTheater") },
                  ...theaters.map((theater) => ({
                    value: theater.id,
                    label:
                      language === "en" && theater.nameEn
                        ? theater.nameEn
                        : theater.name,
                  })),
                ]}
                value={selectedTheater}
                onChange={setSelectedTheater}
                placeholder={t("showtime.selectTheater")}
              />
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-500"></div>
            </div>
          ) : movieShowtimes.length > 0 ? (
            <div className="space-y-6">
              {movieShowtimes.map((movieShowtime) => (
                <div
                  key={movieShowtime.movie.id}
                  className="bg-white rounded-xl p-5 shadow-lg"
                >
                  <div className="flex gap-6">
                    {/* Left: Poster + Movie Info */}
                    <div className="w-[200px] flex-shrink-0">
                      <img
                        src={getPosterUrl(movieShowtime.movie.posterUrl)}
                        alt={movieShowtime.movie.title}
                        className="w-full h-auto object-cover rounded-lg shadow-md border-2 border-black"
                      />
                      <div className="mt-3">
                        <h2 className="text-lg font-bold text-black mb-2">
                          {movieShowtime.movie.title}
                        </h2>
                        <div className="space-y-1.5 text-xs text-gray-800">
                          <div className="flex items-center gap-2">
                            <Film className="w-3.5 h-3.5 text-black flex-shrink-0" />
                            <span>
                              {movieShowtime.movie.genres?.join(", ") || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-black flex-shrink-0" />
                            <span>
                              {movieShowtime.movie.time}{" "}
                              {language === "en" ? "min" : "phút"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Languages className="w-3.5 h-3.5 text-black flex-shrink-0" />
                            <span>
                              {formatSpokenLanguages(
                                movieShowtime.movie.spokenLanguages
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-black flex-shrink-0" />
                            <span>
                              {formatAgeRating(
                                movieShowtime.movie.age,
                                language
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-black flex-shrink-0" />
                            <span>{movieShowtime.movie.startDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Theater rows with showtimes - White cards */}
                    <div className="flex-1 space-y-3">
                      {movieShowtime.theaters.map((theaterData) => (
                        <div
                          key={theaterData.theaterId}
                          className="bg-gray-100 border border-gray-400 rounded-xl p-4 shadow-md"
                        >
                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            {/* Theater Info - 2/5 width */}
                            <div className="w-full md:w-2/5 flex-shrink-0">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {language === "en" && theaterData.theaterNameEn
                                  ? theaterData.theaterNameEn
                                  : theaterData.theaterName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {language === "en" &&
                                theaterData.theaterAddressEn
                                  ? theaterData.theaterAddressEn
                                  : theaterData.theaterAddress}
                              </p>
                            </div>

                            {/* Showtimes - 3/5 width */}
                            <div className="w-full md:w-3/5 flex flex-wrap gap-2">
                              {theaterData.showtimes.map((showtime) => (
                                <button
                                  key={showtime.showtimeId}
                                  onClick={() =>
                                    navigate(
                                      `/movies/${movieShowtime.movie.tmdbId}?showtimeId=${showtime.showtimeId}`,
                                      {
                                        state: {
                                          preselectedShowtime: {
                                            id: showtime.showtimeId,
                                            movieId: movieShowtime.movie.id,
                                            theaterId: theaterData.theaterId,
                                            theaterName:
                                              theaterData.theaterName,
                                            theaterNameEn:
                                              theaterData.theaterNameEn,
                                            roomId: "",
                                            roomName: "",
                                            startTime: showtime.startTime,
                                            endTime: showtime.endTime,
                                          },
                                        },
                                      }
                                    )
                                  }
                                  className="px-4 py-2 bg-yellow-500 text-black hover:bg-black hover:text-yellow-500 font-bold rounded-lg transition-all duration-200 text-sm"
                                >
                                  {formatTime(showtime.startTime)}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-gray-300 text-xl mb-2">
                {t("showtime.noShowtimes")}
              </p>
              <p className="text-gray-400">{t("showtime.tryOther")}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ShowtimePage;
