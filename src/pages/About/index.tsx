import { Package, Gift, Film, MapPin, Phone, Mail } from "lucide-react";
import Layout from "../../components/layout/Layout";
import { useEffect, useState } from "react";
import { theaterService } from "@/services/showtime/theaterService";
import type { TheaterResponse } from "@/types/showtime/theater.type";

// Theater List Component
const TheaterList = () => {
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [loading, setLoading] = useState(true);

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
        <p className="text-gray-400 text-lg">Đang tải danh sách rạp...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {theaters.map((theater, index) => (
        <div
          key={theater.id}
          className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 border-2 border-purple-600/60 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300 group"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-600/30 rounded-full flex items-center justify-center border-2 border-purple-500 group-hover:bg-purple-600/50 transition-colors">
              <span className="text-white font-bold text-lg">{index + 1}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-extrabold text-white mb-3 uppercase tracking-wide">
                {theater.name}
              </h3>
              <div className="flex items-start gap-3 text-gray-100">
                <MapPin size={20} className="text-purple-400 flex-shrink-0" />
                <span className="leading-relaxed font-light -mt-1 -ml-2">
                  {theater.address}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const About = () => {
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
      title: "Mang phim đến mọi người",
      description:
        "Cung cấp trải nghiệm điện ảnh chất lượng cao, giúp mọi khán giả tiếp cận phim dễ dàng và thuận tiện.",
    },
    {
      icon: Gift,
      title: "Khuyến khích sáng tạo",
      description:
        "Hỗ trợ các nhà làm phim trẻ, thúc đẩy ngành công nghiệp điện ảnh Việt Nam phát triển bền vững.",
    },
    {
      icon: Film,
      title: "Trải nghiệm đẳng cấp",
      description:
        "Đem đến những trải nghiệm rạp hiện đại, âm thanh hình ảnh sống động, nâng tầm văn hóa giải trí cho khán giả.",
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
              CINEHUB
            </h1>
            <p
              className="text-2xl md:text-3xl text-white font-light"
              style={{
                textShadow:
                  "0 0 10px rgba(0,0,0,0.9), 2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
              }}
            >
              Trải nghiệm điện ảnh đỉnh cao
            </p>
          </div>
        </section>

        {/* Company Description */}
        <section
          className={`max-w-6xl mx-auto px-4 py-16 transition-all duration-1000 ${isVisible.description ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-5xl font-extrabold mb-20 text-yellow-500 text-center">
            Về CineHub
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
            {/* Text Content */}
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed text-justify flex flex-col justify-center">
              <p>
                CineHub là hệ thống rạp chiếu phim hàng đầu Việt Nam, mang đến
                cho khán giả những trải nghiệm điện ảnh đẳng cấp quốc tế. Với
                công nghệ hiện đại nhất, âm thanh sống động và hình ảnh sắc nét,
                chúng tôi cam kết đem lại những giây phút giải trí tuyệt vời
                nhất.
              </p>
              <p>
                Hệ thống rạp chiếu phim CineHub được trang bị hệ thống âm thanh
                Dolby Atmos, màn hình LED cao cấp, ghế ngồi êm ái và không gian
                sang trọng. Chúng tôi không ngừng nâng cấp cơ sở vật chất và
                dịch vụ để phục vụ khách hàng ngày càng tốt hơn.
              </p>
              <p>
                Với mạng lưới rạp chiếu phim trên toàn quốc, CineHub tự hào là
                điểm đến yêu thích của hàng triệu khán giả yêu điện ảnh. Hãy đến
                với CineHub để cùng nhau đắm chìm trong thế giới phim ảnh đầy
                màu sắc!
              </p>
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
            Sứ mệnh
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
            HỆ THỐNG CÁC CỤM RẠP
          </h2>
          <p className="text-gray-700 text-lg mb-12 text-center max-w-3xl mx-auto">
            Cinestar là hệ thống gồm 10 cụm rạp chiếu phim hiện đại, trải dài cả
            nước, mang đến trải nghiệm điện ảnh chất lượng cao cho khán giả trên
            toàn quốc.
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

        {/* Theater Gallery */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "CineHub Đà Nẵng", image: "/CineHubDaNang.png" },
              { name: "CineHub Nguyễn Trãi", image: "/CineHubNguyenTrai.png" },
              {
                name: "CineHub Nguyễn Văn Cừ",
                image: "/CineHubNguyenVanCu.png",
              },
              { name: "CineHub Quốc Học Huế", image: "/CineHubQuocHocHue.png" },
              { name: "CineHub Siêu Nhân", image: "/CineHubSieuNhan.png" },
            ].map((theater, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-2xl hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all duration-500"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-900 to-blue-900">
                  <img
                    src={theater.image}
                    alt={theater.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/20 transition-colors duration-500"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-extrabold uppercase tracking-wide drop-shadow-lg">
                    {theater.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
