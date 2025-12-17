import { useState } from "react";

export type Language = "vi" | "en";

const translations = {
  vi: {
    // Header
    "header.about": "Giới thiệu",
    "header.showtime": "Lịch chiếu",
    "header.popcorn": "Đặt bắp nước",
    "header.search": "Tìm phim hoặc rạp chiếu...",
    "header.login": "Đăng nhập",
    "header.profile": "Hồ sơ cá nhân",
    "header.dashboard": "Bảng điều khiển",
    "header.logout": "Đăng xuất",

    // Home page
    "home.hero.title": "CINEHUB",
    "home.hero.subtitle": "Trải nghiệm điện ảnh đỉnh cao",
    "home.booking.title": "ĐẶT VÉ NHANH",
    "home.booking.movie": "Chọn phim",
    "home.booking.theater": "Chọn rạp",
    "home.booking.date": "Chọn ngày",
    "home.booking.showtime": "Chọn suất",
    "home.booking.bookNow": "ĐẶT NGAY",
    "home.nowPlaying": "PHIM ĐANG CHIẾU",
    "home.upcoming": "PHIM SẮP CHIẾU",
    "home.promotions": "KHUYẾN MÃI HOT",
    "home.contact": "LIÊN HỆ VỚI CHÚNG TÔI",
    "home.seeMore": "Xem thêm",
    "home.noMoviesPlaying": "Hiện tại chưa có phim nào được chiếu",
    "home.noMoviesUpcoming": "Hiện tại chưa có phim nào sắp ra mắt",
    "home.bookNow": "ĐẶT VÉ NGAY",
    "home.viewAll": "Xem tất cả",
    "home.bookTicket": "Đặt vé",
    "home.learnMore": "Tìm hiểu",
    "home.watchTrailer": "Xem trailer",

    // Languages
    "language.vietnamese": "Tiếng Việt",
    "language.english": "English",
  },
  en: {
    // Header
    "header.about": "About",
    "header.showtime": "Showtimes",
    "header.popcorn": "Snacks",
    "header.search": "Search movies or theaters...",
    "header.login": "Login",
    "header.profile": "Profile",
    "header.dashboard": "Dashboard",
    "header.logout": "Logout",

    // Home page
    "home.hero.title": "CINEHUB",
    "home.hero.subtitle": "Redefining Cinema Experience",
    "home.booking.title": "QUICK BOOKING",
    "home.booking.movie": "Select Movie",
    "home.booking.theater": "Select Theater",
    "home.booking.date": "Select Date",
    "home.booking.showtime": "Select Showtime",
    "home.booking.bookNow": "BOOK NOW",
    "home.nowPlaying": "NOW-PLAYING MOVIES",
    "home.upcoming": "UPCOMING MOVIES",
    "home.promotions": "HOT PROMOTIONS",
    "home.contact": "CONTACT US",
    "home.seeMore": "See More",
    "home.noMoviesPlaying": "No movies currently playing",
    "home.noMoviesUpcoming": "No upcoming movies",
    "home.bookNow": "BOOK NOW",
    "home.viewAll": "View All",
    "home.bookTicket": "Book",
    "home.learnMore": "More",
    "home.watchTrailer": "Watch Trailer",

    // Languages
    "language.vietnamese": "Tiếng Việt",
    "language.english": "English",
  },
};

export const useTranslation = () => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("cinehub-language");
    return (saved as Language) || "vi";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("cinehub-language", lang);
  };

  const t = (key: string): string => {
    const translation =
      translations[language]?.[key as keyof (typeof translations)[Language]];
    return translation || key;
  };

  return { language, setLanguage, t };
};
