import { Package, Gift, Film, MapPin, Ticket } from "lucide-react";
import Layout from "../../components/layout/Layout";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { theaterService } from "@/services/showtime/theaterService";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import { useLanguage } from "@/contexts/LanguageContext";

// Theater Gallery Component - Same as SearchPage
// Theater Gallery Component
const TheaterGallery = () => {
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  useEffect(() => {
    theaterService
      .getAllTheaters()
      .then((data) => setTheaters(data))
      .catch((err) => console.error("Failed to load theaters:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <section className="relative w-full max-w-5xl mx-auto mt-20">
      <div className="relative flex items-center justify-center mb-10">
        <MapPin className="w-8 h-8 text-yellow-500 mr-3" />
        <h2 className="text-2xl md:text-4xl font-extrabold text-yellow-500">
          {language === "en" ? "THEATERS" : "RẠP CHIẾU"} ({theaters.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theaters.map((theater) => (
          <div
            key={theater.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 overflow-hidden flex flex-col h-full"
          >
            {/* Theater Image */}
            {theater.imageUrl && (
              <div className="relative h-48 overflow-hidden flex-shrink-0">
                <img
                  src={theater.imageUrl}
                  alt={theater.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            )}

            {/* Theater Info Container */}
            <div className="p-6 flex flex-col flex-1">
              {/* PHẦN TRÊN: Tên và Địa chỉ */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {language === "en"
                    ? theater.nameEn || theater.name
                    : theater.name}
                </h3>
                <div className="flex items-start gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="line-clamp-2">
                    {language === "en"
                      ? theater.addressEn || theater.address
                      : theater.address}
                  </p>
                </div>
              </div>

              {/* PHẦN DƯỚI: Tỉnh thành và Nút (Được đẩy xuống đáy nhờ mt-auto) */}
              <div className="mt-auto w-full">
                {(theater.provinceName || theater.provinceNameEn) && (
                  <p className="text-lg text-yellow-500 font-light mb-4">
                    {language === "en"
                      ? theater.provinceNameEn || theater.provinceName
                      : theater.provinceName}
                  </p>
                )}

                <button
                  onClick={() => navigate(`/theater/${theater.id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2.5 rounded-lg transition-colors"
                >
                  <Ticket className="w-4 h-4" />
                  {t("about.theaters.bookTicket")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Theater List Component
const TheaterList = () => {
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    theaterService
      .getAllTheaters()
      .then((data) => setTheaters(data))
      .catch((err) => console.error("Failed to load theaters:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-400 text-lg">{t("about.theaters.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {theaters.map((theater, index) => (
        <Link
          key={theater.id}
          to={`/theater/${theater.id}`}
          className="block bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 border-2 border-purple-600/60 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300 group cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-600/30 rounded-full flex items-center justify-center border-2 border-purple-500 group-hover:bg-purple-600/50 transition-colors">
              <span className="text-white font-bold text-lg">{index + 1}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-extrabold text-white mb-3 uppercase tracking-wide">
                {language === "en"
                  ? theater.nameEn || theater.name
                  : theater.name}
              </h3>
              <div className="flex items-start gap-3 text-gray-100">
                <MapPin size={20} className="text-purple-400 flex-shrink-0" />
                <span className="leading-relaxed font-light -mt-1 -ml-2">
                  {language === "en"
                    ? theater.addressEn || theater.address
                    : theater.address}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

const About = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState({
    hero: false,
    description: false,
    benefits: false,
    cta: false,
  });

  // Trigger animations on mount - giống Home
  useEffect(() => {
    setTimeout(() => setIsVisible((prev) => ({ ...prev, hero: true })), 100);
    setTimeout(
      () => setIsVisible((prev) => ({ ...prev, description: true })),
      300
    );
    setTimeout(
      () => setIsVisible((prev) => ({ ...prev, benefits: true })),
      500
    );
    setTimeout(() => setIsVisible((prev) => ({ ...prev, cta: true })), 700);
  }, []);

  const missions = [
    {
      icon: Package,
      title: t("about.mission1.title"),
      description: t("about.mission1.description"),
    },
    {
      icon: Gift,
      title: t("about.mission2.title"),
      description: t("about.mission2.description"),
    },
    {
      icon: Film,
      title: t("about.mission3.title"),
      description: t("about.mission3.description"),
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-[#f1f6f8] text-white">
        {/* Hero Section */}
        <section
          className={`relative h-[500px] flex items-center justify-center overflow-hidden transition-all duration-1000 ${isVisible.hero ? "opacity-100" : "opacity-0"}`}
        >
          {/* Background Image */}
          <img
            src="/intro_cinehub.jpg"
            alt="CineHub Cinema"
            className="w-full h-full object-cover"
          />

          {/* Vignette Overlay - Sáng giữa, tối xung quanh */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/60 to-black/70"></div>

          {/* Gradient Overlay nhẹ để hòa màu */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/40 to-gray-100"></div>

          {/* Text Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-4">
            <h1
              className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-wider"
              style={{
                textShadow:
                  "0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7), 4px 4px 8px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
              }}
            >
              {t("about.hero.title")}
            </h1>
            <p
              className="text-2xl md:text-3xl text-white font-light"
              style={{
                textShadow:
                  "0 0 10px rgba(0,0,0,0.9), 2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
              }}
            >
              {t("about.hero.subtitle")}
            </p>
          </div>
        </section>

        {/* Company Description */}
        <section
          className={`max-w-6xl mx-auto px-4 py-16 transition-all duration-1000 ${isVisible.description ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-5xl font-extrabold mb-20 text-yellow-500 text-center">
            {t("about.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
            {/* Text Content */}
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed text-justify flex flex-col justify-center">
              <p>{t("about.description1")}</p>
              <p>{t("about.description2")}</p>
              <p>{t("about.description3")}</p>
            </div>

            {/* Image */}
            <div className="flex justify-center items-center">
              <img
                src="/about1.jpg"
                alt="CineHub Cinema Interior"
                className="w-full h-full max-h-[500px] rounded-xl shadow-2xl object-cover border-4 border-yellow-500"
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section
          className={`max-w-6xl mx-auto px-4 py-16 transition-all duration-1000 ${isVisible.benefits ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-5xl font-extrabold mb-12 text-yellow-500 text-center">
            {t("about.mission.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {missions.map((benefit, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-yellow-400/20 rounded-lg p-6 hover:border-yellow-400/50 transition-colors"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-yellow-400/10 p-4 rounded-full">
                    <benefit.icon className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-yellow-400">
                  {benefit.title}
                </h3>
                <p className="text-gray-300 text-center leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action - Theater Locations */}
        <section
          className={`max-w-7xl mx-auto px-4 py-16 transition-all duration-1000 ${isVisible.cta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-5xl font-extrabold mb-5 text-yellow-500 text-center">
            {t("about.theaters.title")}
          </h2>
          <p className="text-gray-700 text-lg mb-12 text-center max-w-3xl mx-auto">
            {t("about.theaters.description")}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Map Image */}
            <div className="flex justify-center items-start lg:sticky lg:top-24">
              <div className="relative w-full">
                <img
                  src="/provinceovervn.png"
                  alt="Vietnam Map with Theater Locations"
                  className="w-full h-auto object-contain"
                />
                <div className="absolute inset-0 bg-gray-100/30 pointer-events-none"></div>
              </div>
            </div>

            {/* Right: Theater List */}
            <TheaterList />
          </div>
        </section>

        {/* Theater Gallery - Same as SearchPage */}
        <div className="pb-20">
          <TheaterGallery />
        </div>
      </div>
    </Layout>
  );
};

export default About;
