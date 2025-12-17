import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { movieService } from "@/services/movie/movieService";
import { getPosterUrl } from "@/utils/getPosterUrl";
import { Link, useNavigate } from "react-router-dom";
import type { MovieSummary } from "@/types/movie/movie.type";
import TrailerModal from "@/components/movie/TrailerModal";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { TableProperties, Clock, Globe, ShieldCheck } from "lucide-react";
import {
  formatTitle,
  formatGenres,
  formatSpokenLanguages,
} from "@/utils/format";
import { useLanguage } from "@/contexts/LanguageContext";
import Lottie from "lottie-react";

const UpcomingPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [catInBoxAnimation, setCatInBoxAnimation] = useState<any>(null);

  // Load cat in box animation
  useEffect(() => {
    fetch("/Cat_in_Box.json")
      .then((res) => res.json())
      .then((data) => setCatInBoxAnimation(data))
      .catch((err) =>
        console.error("Failed to load cat in box animation:", err)
      );
  }, []);

  useEffect(() => {
    movieService.getUpcoming(0, 50).then((res) => {
      setUpcoming(res.content || []);
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <div className="w-full min-h-screen pb-16 bg-gray-100 mt-3">
        <section className="w-full max-w-5xl mx-auto pt-8 px-4">
          <div className="relative flex justify-center mb-8">
            <h1 className="text-2xl md:text-4xl font-extrabold text-yellow-500 whitespace-nowrap">
              {t("home.upcoming")}
            </h1>
            {catInBoxAnimation && (
              <div
                className="absolute top-1/2 -translate-y-1/2"
                style={{
                  left: `calc(50% + ${t("home.upcoming").length * 0.9}em + 24px)`,
                }}
              >
                <Lottie
                  animationData={catInBoxAnimation}
                  loop={true}
                  style={{ width: 60, height: 60 }}
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-black text-lg">{t("home.noMoviesUpcoming")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-16 py-6">
              {upcoming.map((movie) => (
                <div
                  key={movie.id}
                  className="relative flex flex-col transition"
                >
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
                                className="mr-2 text-orange-500 flex-shrink-0"
                              />
                              {movie.time}'
                            </p>
                            <p className="text-xs font-light mb-2 flex items-center">
                              <Globe
                                size={23}
                                className="mr-2 text-orange-500 flex-shrink-0"
                              />
                              {formatSpokenLanguages(movie.spokenLanguages)}
                            </p>
                            <p className="text-xs font-light flex items-center">
                              <ShieldCheck
                                size={23}
                                className="mr-2 text-orange-500 flex-shrink-0"
                              />
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
                      <TrailerModal
                        trailerUrl={movie.trailer}
                        buttonLabel="Trailer"
                      />
                    )}
                    <AnimatedButton
                      variant="orange-to-f3ea28"
                      className="w-1/2"
                      onClick={() => navigate(`/movies/${movie.id}`)}
                    >
                      {t("home.learnMore")}
                    </AnimatedButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default UpcomingPage;
