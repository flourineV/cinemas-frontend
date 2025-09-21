import Layout from '../../components/layout/Layout';
import QuickBookingBar from "../../components/ui/QuickBookingBar";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  // thay bằng ảnh quảng cáo thật
    "https://images.spiderum.com/sp-images/8d5590c080e311ed8a6481196edc880f.jpeg", 
    "https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/176175/Originals/poster-film-5.jpg",
    "https://insieutoc.vn/wp-content/uploads/2021/02/poster-ngang.jpg",
  ];

const movies = [
  { title: "Movie 1", poster: "https://via.placeholder.com/200x300?text=Movie+1" },
  { title: "Movie 2", poster: "https://via.placeholder.com/200x300?text=Movie+2" },
  { title: "Movie 3", poster: "https://via.placeholder.com/200x300?text=Movie+3" },
  { title: "Movie 4", poster: "https://via.placeholder.com/200x300?text=Movie+4" },
  { title: "Movie 5", poster: "https://via.placeholder.com/200x300?text=Movie+5" },
  { title: "Movie 6", poster: "https://via.placeholder.com/200x300?text=Movie+6" },
  { title: "Movie 7", poster: "https://via.placeholder.com/200x300?text=Movie+7" },
  { title: "Movie 8", poster: "https://via.placeholder.com/200x300?text=Movie+8" },
];

const upcomingMovies = [
  { id: 1, title: "Avatar 3", poster: "link-anh-1" },
  { id: 2, title: "Batman Beyond", poster: "link-anh-2" },
  { id: 3, title: "Inside Out 2", poster: "link-anh-3" },
  { id: 4, title: "Deadpool 3", poster: "link-anh-4" },
];

const promotions = [
  {
    title: "Mua 1 tặng 1 vé 2D",
    description: "Áp dụng vào thứ 3 hàng tuần tại tất cả rạp.",
    image: "https://via.placeholder.com/400x200?text=Promo+1",
  },
  {
    title: "Combo bắp nước 49K",
    description: "Tiết kiệm hơn 30% khi mua kèm vé xem phim.",
    image: "https://via.placeholder.com/400x200?text=Promo+2",
  },
  {
    title: "Ưu đãi thành viên",
    description: "Giảm 20% cho khách hàng VIP.",
    image: "https://via.placeholder.com/400x200?text=Promo+3",
  },
];

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0); // lưu currentIndex ảnh hiện tại

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4000); // 4s đổi 1 lần
    return () => clearInterval(timer);
  }, [currentIndex]);

  // --- Movie carousel state ---
  const itemsPerSlide = 4;
  const totalSlides = Math.ceil(movies.length / itemsPerSlide);
  const [movieIndex, setMovieIndex] = useState(0);

  const nextMovies = () => {
    setMovieIndex((prev) => (prev + 1) % totalSlides);
  };
  const prevMovies = () => {
    setMovieIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  // --- UpcomingMovie carousel state ---
  const totalUpcomingSlides = Math.ceil(upcomingMovies.length / itemsPerSlide);
  const [upcomingIndex, setUpcomingIndex] = useState(0);

  const nextUpcoming = () => {
    setUpcomingIndex((prev) => (prev + 1) % totalUpcomingSlides);
  };
  const prevUpcoming = () => {
    setUpcomingIndex((prev) => (prev === 0 ? totalUpcomingSlides - 1 : prev - 1));
  };

  // --- Promotion carousel state ---
  const promosPerSlide = 3; // 3 promo mỗi slide
  const totalPromoSlides = Math.ceil(promotions.length / promosPerSlide);
  const [promoIndex, setPromoIndex] = useState(0);

  const nextPromos = () => {
    setPromoIndex((prev) => (prev + 1) % totalPromoSlides);
  };

  const prevPromos = () => {
    setPromoIndex((prev) =>
      prev === 0 ? totalPromoSlides - 1 : prev - 1
    );
  };

  return (
    <Layout>
      <div className="w-full bg-slate-900 min-h-screen pt-20">
         {/* Banner quảng cáo */}
         <section className="relative w-full max-w-6xl mx-auto h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden rounded-2xl shadow-lg">
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }} // hiệu ứng trượt ngang
          >
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Slide ${index}`}
                className="w-full h-full flex-shrink-0 object-cover object-center"
              />
            ))}
          </div>

          {/* Nút điều hướng */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white"
          >
            <ChevronRight size={28} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full cursor-pointer ${
                  idx === currentIndex ? "bg-white" : "bg-gray-500"
                }`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </section>

        {/* Thanh đặt vé nhanh */}
        <section className="max-w-6xl mx-auto px-4 mt-10">
          <QuickBookingBar />
        </section>

        {/* Carousel phim đang chiếu */}
        <section className="relative w-full max-w-6xl mx-auto mt-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">🎬 Phim đang chiếu</h2>

          <div className="relative overflow-hidden rounded-2xl shadow-lg">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${movieIndex * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div
                  key={slideIndex}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full flex-shrink-0 px-4 py-6"
                >
                  {movies
                    .slice(
                      slideIndex * itemsPerSlide,
                      (slideIndex + 1) * itemsPerSlide
                    )
                    .map((movie, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800 rounded-xl overflow-hidden shadow-md hover:scale-105 transition"
                      >
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-[350px] object-cover"
                        />
                        <div className="p-2 text-center text-white text-sm font-medium">
                          {movie.title}
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>

            {/* Nút điều hướng */}
            <button
              onClick={prevMovies}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextMovies}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center mt-3 space-x-2">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setMovieIndex(idx)}
                className={`w-3 h-3 rounded-full ${
                  idx === movieIndex ? "bg-white" : "bg-gray-500"
                }`}
              ></button>
            ))}
          </div>

          {/* Nút xem thêm */}
          <div className="flex justify-center mt-5">
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
              Xem thêm
            </button>
          </div>
        </section>

        {/* Phim sắp chiếu */}
        <section className="relative w-full max-w-6xl mx-auto mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">🎥 Phim sắp chiếu</h2>

          <div className="relative overflow-hidden rounded-2xl shadow-lg">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${upcomingIndex * 100}%)` }}
            >
              {Array.from({ length: totalUpcomingSlides }).map((_, slideIndex) => (
                <div
                  key={slideIndex}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full flex-shrink-0 px-4 py-6"
                >
                  {upcomingMovies
                    .slice(
                      slideIndex * itemsPerSlide,
                      (slideIndex + 1) * itemsPerSlide
                    )
                    .map((movie, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800 rounded-xl overflow-hidden shadow-md hover:scale-105 transition"
                      >
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-[350px] object-cover"
                        />
                        <div className="p-2 text-center text-white text-sm font-medium">
                          {movie.title}
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>

            {/* Nút điều hướng */}
            <button
              onClick={prevUpcoming}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextUpcoming}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center mt-3 space-x-2">
            {Array.from({ length: totalUpcomingSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setUpcomingIndex(idx)}
                className={`w-3 h-3 rounded-full ${
                  idx === upcomingIndex ? "bg-white" : "bg-gray-500"
                }`}
              ></button>
            ))}
          </div>

          {/* Nút xem thêm */}
          <div className="flex justify-center mt-5">
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
              Xem thêm
            </button>
          </div>
        </section>

        {/* --- Khuyến mãi --- */}
        <section className="relative w-full max-w-6xl mx-auto mt-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">🔥 Khuyến mãi</h2>

          <div className="relative overflow-hidden rounded-2xl shadow-lg">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${promoIndex * 100}%)` }}
            >
              {Array.from({ length: totalPromoSlides }).map((_, slideIndex) => (
                <div
                  key={slideIndex}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto flex-shrink-0 px-4 py-6"
                >
                  {promotions
                    .slice(
                      slideIndex * promosPerSlide,
                      (slideIndex + 1) * promosPerSlide
                    )
                    .map((promo, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800 rounded-xl overflow-hidden shadow-md hover:scale-105 transition"
                      >
                        <img
                          src={promo.image}
                          alt={promo.title}
                          className="w-full h-[200px] object-cover"
                        />
                        <div className="p-4 text-white">
                          <h3 className="text-lg font-semibold mb-2">{promo.title}</h3>
                          <p className="text-sm text-gray-300">{promo.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>

            {/* Nút điều hướng */}
            <button
              onClick={prevPromos}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextPromos}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center mt-3 space-x-2">
            {Array.from({ length: totalPromoSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPromoIndex(idx)}
                className={`w-3 h-3 rounded-full ${
                  idx === promoIndex ? "bg-white" : "bg-gray-500"
                }`}
              ></button>
            ))}
          </div>

          {/* Nút Xem tất cả */}
          <div className="flex justify-center mt-5">
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
              Xem tất cả ưu đãi
            </button>
          </div>
        </section>

        {/* Chương trình thành viên */}
        <section className="w-full max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">🎟️ Chương trình thành viên</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Member Card 1 */}
            <div className="bg-slate-800 rounded-xl p-6 shadow-md text-center hover:scale-105 transition-transform">
              <img
                src="/images/member1.png"
                alt="Thành viên Bạc"
                className="w-24 h-24 mx-auto mb-4 object-contain"
              />
              <h3 className="text-lg font-semibold text-white mb-2">Thành viên Bạc</h3>
              <p className="text-slate-300 text-sm">
                Nhận điểm thưởng khi mua vé và combo, ưu đãi sinh nhật đặc biệt.
              </p>
            </div>

            {/* Member Card 2 */}
            <div className="bg-slate-800 rounded-xl p-6 shadow-md text-center hover:scale-105 transition-transform">
              <img
                src="/images/member2.png"
                alt="Thành viên Vàng"
                className="w-24 h-24 mx-auto mb-4 object-contain"
              />
              <h3 className="text-lg font-semibold text-white mb-2">Thành viên Vàng</h3>
              <p className="text-slate-300 text-sm">
                Tích điểm nhanh hơn, giảm giá vé và combo, ưu tiên đặt chỗ.
              </p>
            </div>

            {/* Member Card 3 */}
            <div className="bg-slate-800 rounded-xl p-6 shadow-md text-center hover:scale-105 transition-transform">
              <img
                src="/images/member3.png"
                alt="Thành viên Kim Cương"
                className="w-24 h-24 mx-auto mb-4 object-contain"
              />
              <h3 className="text-lg font-semibold text-white mb-2">Thành viên Kim Cương</h3>
              <p className="text-slate-300 text-sm">
                Quyền lợi VIP: phòng chờ riêng, ưu đãi vé độc quyền và nhiều quà tặng.
              </p>
            </div>
          </div>

          {/* Button */}
          <div className="text-center mt-10">
            <button className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
              Tìm hiểu ngay
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
