import Layout from '../../components/layout/Layout';
import QuickBookingBar from "../../components/ui/QuickBookingBar";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock, Globe, ShieldAlert } from "lucide-react";
import { movieService } from "@/services/movieService";
import type { MovieSummary } from "@/types";
import { getPosterUrl } from "@/utils/image";
import { formatTitle } from "@/utils/format";
import { Link } from "react-router-dom";
import { useCarousel } from "@/hooks/useCarousel"; 
import { useBannerCarousel } from "@/hooks/useBannerCarousel";
import { formatGenres } from "@/utils/formatGenres";
import { formatSpokenLanguages } from '@/utils/formatSpokenLanguages';
import TrailerModal from '@/components/ui/TrailerModal';

const images = [
    "https://images.spiderum.com/sp-images/8d5590c080e311ed8a6481196edc880f.jpeg", 
    "https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/176175/Originals/poster-film-5.jpg",
    "https://insieutoc.vn/wp-content/uploads/2021/02/poster-ngang.jpg",
];


const Home = () => {
    // --- Banner quảng cáo hook (Đã thay thế logic cũ) ---
    const { 
        currentIndex, 
        prevSlide, 
        nextSlide, 
    } = useBannerCarousel(images.length, 4000); // 4000ms là 4s

    // --- Data fetching state (Giữ nguyên) ---
    const [nowPlaying, setNowPlaying] = useState<MovieSummary[]>([]);
    const [upcoming, setUpcoming] = useState<MovieSummary[]>([]);
    const itemsPerSlide = 4; // Số lượng item mặc định cho phim

    useEffect(() => {
        movieService.getNowPlaying(0, 20).then((res: { data: { content: MovieSummary[] } }) => {
            setNowPlaying(res.data.content); 
        });
        movieService.getUpcoming(0, 20).then((res: { data: { content: MovieSummary[] } }) => {
            setUpcoming(res.data.content); 
        });
    }, []);

    // 2. Sử dụng useCarousel cho PHIM ĐANG CHIẾU (Giữ nguyên)
    const { 
        currentIndex: nowPlayingIndex, 
        totalSlides: totalNowPlayingSlides, 
        nextSlide: nextMovies, 
        prevSlide: prevMovies,
        goToSlide: goToNowPlayingSlide
    } = useCarousel(nowPlaying, itemsPerSlide);


    // 3. Sử dụng useCarousel cho PHIM SẮP CHIẾU (Giữ nguyên)
    const { 
        currentIndex: upcomingIndex, 
        totalSlides: totalUpcomingSlides, 
        nextSlide: nextUpcoming, 
        prevSlide: prevUpcoming,
        goToSlide: goToUpcomingSlide
    }
    = useCarousel(upcoming, itemsPerSlide);

    return (
        <Layout>
            <div className="w-full min-h-screen mt-16 pb-16">
                {/* Banner quảng cáo (Đã thay thế bằng hook useBannerCarousel) */}
                <div className="relative w-full"> 
                    
                    <section className="w-full max-w-6xl mx-auto aspect-[16/6] overflow-hidden rounded-sm shadow-lg"> 
                    {/* Bỏ relative để nút bên ngoài dễ căn chỉnh hơn */}
                        
                        <div 
                            className="flex transition-transform duration-700 ease-in-out h-full"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }} 
                        >
                            {images.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`Slide ${index}`}
                                    className="min-w-full h-full object-cover object-center"
                                />
                            ))}
                        </div>
                    </section>

                    {/* Nút điều hướng: Đặt ABSOLUTE so với DIV cha mới (relative w-full) */}
                    <button
                        onClick={prevSlide} 
                        // ĐÃ THÊM: hidden (mặc định ẩn) và sm:block (hiện từ sm trở lên)
                        className="absolute left-28 top-1/2 border-none -translate-y-1/2 p-2 z-10 text-white hidden sm:block focus:outline-none"
                    >
                        <ChevronLeft size={40} />
                    </button>
                    <button
                        onClick={nextSlide} 
                        // ĐÃ THÊM: hidden (mặc định ẩn) và sm:block (hiện từ sm trở lên)
                        className="absolute right-28 top-1/2 border-none -translate-y-1/2 p-2 z-10 text-white hidden sm:block focus:outline-none"
                    >
                        <ChevronRight size={40} />
                    </button>
                </div>

                {/* Thanh đặt vé nhanh (Giữ nguyên) */}
                <section className="max-w-6xl mx-auto mt-8">
                    <QuickBookingBar />
                </section>
                
                {/* Carousel phim đang chiếu (Giữ nguyên) */}
                <section className="relative w-full max-w-6xl mx-auto mt-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">PHIM ĐANG CHIẾU</h2>
                    {/* ... (Phần hiển thị carousel Phim Đang Chiếu) ... */}
                    {nowPlaying.length === 0 ? (
                        <p className="text-white text-center">Đang tải phim...</p>
                    ) : (
                        <div className="relative rounded-2xl">
                            {/* Slide Wrapper */}
                            <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-700 ease-in-out"
                                style={{ transform: `translateX(-${nowPlayingIndex * 100}%)` }}
                            >
                                {Array.from({ length: totalNowPlayingSlides }).map((_, slideIdx) => (
                                  <div
                                        key={slideIdx}
                                        className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full flex-shrink-0 py-6"
                                  >
                                    {nowPlaying
                                        .slice(slideIdx * itemsPerSlide, (slideIdx + 1) * itemsPerSlide)
                                        .map((movie) => (
                                        <div key={movie.id} className="group relative flex flex-col transition">
                                        <Link 
                                            to={`/movies/${movie.tmdbId}`} 
                                            // THẺ LINK LỚN: là group, có hiệu ứng phóng to (scale)
                                            className="group relative flex flex-col transition" 
                                        >
                                            {/* 1. CONTAINER CHỨA POSTER VÀ OVERLAY (Không có scale, chỉ có group-hover opacity) */}
                                            <div className="relative rounded-sm border border-gray-500 overflow-hidden shadow-md">
                                                {/* Poster */}
                                                <img
                                                    src={getPosterUrl(movie.posterUrl)}
                                                    alt={movie.title}
                                                    className="w-full h-[400px] object-cover" // Đã tăng chiều cao lên 400px
                                                />
                                                {/* Overlay và Info (Giữ nguyên) */}
                                                <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                                                    <div className="text-white text-left">
                                                        <h3 className="text-lg font-bold mb-2">{formatTitle(movie.title)}</h3>
                                                        {/* 1. THỂ LOẠI (Thay bằng Icon MapPin) */}
                                                        <p className="text-xs font-light mb-1 flex items-center">
                                                            <MapPin size={16} className="mr-2 text-red-500" />
                                                            {formatGenres(movie.genres)}
                                                        </p>
                                                        
                                                        {/* 2. THỜI LƯỢNG (Thay bằng Icon Clock) */}
                                                        <p className="text-xs font-light mb-1 flex items-center">
                                                            <Clock size={16} className="mr-2 text-red-500" />
                                                            {movie.time}’
                                                        </p>
                                                        
                                                        {/* 3. NGÔN NGỮ (Thay bằng Icon Globe) */}
                                                        <p className="text-xs font-light mb-1 flex items-center">
                                                            <Globe size={16} className="mr-2 text-red-500" />
                                                            {formatSpokenLanguages(movie.spokenLanguages)}
                                                        </p>
                                                        
                                                        {/* 4. ĐỘ TUỔI (Thay bằng Icon ShieldAlert) */}
                                                        <p className="text-xs font-light flex items-center">
                                                            <ShieldAlert size={16} className="mr-2 text-red-500" />
                                                            {movie.age}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* 2. TITLE (Tách biệt, không bị che bởi hiệu ứng opacity của Poster) */}
                                            <div className="p-2 flex items-center justify-center text-center text-white text-base font-medium h-[70px] ">
                                                {formatTitle(movie.title)}
                                            </div>
                                            </Link>

                                            {/* 3. NÚT XEM TRAILER & ĐẶT VÉ */}
                                            <div className="flex w-full mt-2 space-x-2">
                                                {/* Nút Xem Trailer (Dạng nút phụ) thay lại thành movie.trailer */}
                                                 <TrailerModal trailerUrl={movie.trailer} buttonLabel="Trailer" />

                                                {/* Nút Đặt Vé (Nút chính) */}
                                                <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-3 rounded-sm transition-colors w-1/2">
                                                    ĐẶT VÉ
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                ))}
                            </div>
                            </div>
                            
                            {/* ... (Nút điều hướng và Dots indicator giữ nguyên) ... */}
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

                            
                            {/* Dots indicator */}
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
                    {/* Nút xem thêm */}
                    <div className="flex justify-center mt-5">
                        <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
                            Xem thêm
                        </button>
                    </div>
                </section>
                
                {/* --- */}

                {/* Phim sắp chiếu (Đã chỉnh giống Phim đang chiếu) */}
                <section className="relative w-full max-w-6xl mx-auto mt-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">PHIM SẮP CHIẾU</h2>

                    {upcoming.length === 0 ? (
                        <p className="text-white text-center">Đang tải phim...</p>
                    ) : (
                        <div className="relative rounded-2xl">
                        {/* Slide Wrapper */}
                        <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-700 ease-in-out"
                            style={{ transform: `translateX(-${upcomingIndex * 100}%)` }}
                        >
                            {/* Slide Content */}
                            {Array.from({ length: totalUpcomingSlides }).map((_, slideIdx) => (
                                  <div
                                        key={slideIdx}
                                        className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full flex-shrink-0 py-6"
                                  >
                                    {upcoming
                                        .slice(slideIdx * itemsPerSlide, (slideIdx + 1) * itemsPerSlide)
                                        .map((movie) => (
                                <div key={movie.id} className="group relative flex flex-col transition">
                                <Link
                                    to={`/movies/${movie.tmdbId}`}
                                    className="group relative flex flex-col transition"
                                    >
                                    {/* 1. Poster + Overlay */}
                                    <div className="relative rounded-sm border border-gray-500 overflow-hidden shadow-md">
                                        <img
                                        src={getPosterUrl(movie.posterUrl)}
                                        alt={movie.title}
                                        className="w-full h-[400px] object-cover"
                                        />
                                        {/* Overlay Info */}
                                        <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                                        <div className="text-white text-left">
                                            <h3 className="text-lg font-bold mb-2">{formatTitle(movie.title)}</h3>

                                            <p className="text-xs font-light mb-1 flex items-center">
                                            <MapPin size={16} className="mr-2 text-red-500" />
                                            {formatGenres(movie.genres)}
                                            </p>

                                            <p className="text-xs font-light mb-1 flex items-center">
                                            <Clock size={16} className="mr-2 text-red-500" />
                                            {movie.time}’
                                            </p>

                                            <p className="text-xs font-light mb-1 flex items-center">
                                            <Globe size={16} className="mr-2 text-red-500" />
                                            {formatSpokenLanguages(movie.spokenLanguages)}
                                            </p>

                                            <p className="text-xs font-light flex items-center">
                                            <ShieldAlert size={16} className="mr-2 text-red-500" />
                                            {movie.age}
                                            </p>
                                        </div>
                                        </div>
                                    </div>

                                    {/* 2. Title */}
                                    <div className="p-2 flex items-center justify-center text-center text-white text-base font-medium h-[70px]">
                                        {formatTitle(movie.title)}
                                    </div>
                                    </Link>

                                    {/* 3. Nút Trailer & Đặt Vé */}
                                    <div className="flex w-full mt-2 space-x-2">
                                                <a 
                                                    href={movie.posterUrl || "#"} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center border border-white/50 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors hover:bg-white/10 w-1/2"
                                                    >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.969 12l-3.328 2.5a.75.75 0 01-1.141-.645V10.145a.75.75 0 011.141-.645l3.328 2.5z" />
                                                    </svg>
                                                    Trailer
                                                </a>

                                        <Link 
                                            to={`/movies/${movie.tmdbId}`} 
                                            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-3 rounded-sm transition-colors w-1/2 flex items-center justify-center">
                                            TÌM HIỂU THÊM
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            </div>
                            ))}
                        </div>
                        </div>

                        {/* Nút điều hướng */}
                        <button
                            onClick={prevUpcoming}
                            className="absolute -left-16 top-[45%] -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 text-white"
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <button
                            onClick={nextUpcoming}
                            className="absolute -right-16 top-[45%] -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 text-white"
                        >
                            <ChevronRight size={28} />
                        </button>

                        {/* Dots indicator */}
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

                    {/* Nút xem thêm */}
                    <div className="flex justify-center mt-5">
                        <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
                        Xem thêm
                        </button>
                    </div>
                </section>

            </div>
        </Layout>
    );
};

export default Home;