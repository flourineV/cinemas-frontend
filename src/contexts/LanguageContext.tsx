import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "vi" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Simple translation function (you can expand this)
const translations = {
  vi: {
    // Header
    "header.about": "Giới thiệu",
    "header.search": "Tìm kiếm phim...",
    "header.login": "Đăng nhập",
    "header.profile": "Hồ sơ",
    "header.dashboard": "Bảng điều khiển",
    "header.logout": "Đăng xuất",
    // Home
    "home.hero.title": "CINEHUB",
    "home.hero.subtitle": "Trải nghiệm điện ảnh đỉnh cao",
    "home.nowPlaying": "PHIM ĐANG CHIẾU",
    "home.upcoming": "PHIM SẮP CHIẾU",
    "home.promotions": "KHUYẾN MÃI",
    "home.contact": "LIÊN HỆ",
    "home.learnMore": "Tìm hiểu thêm",
    "home.bookTicket": "Đặt vé",
    "home.bookNow": "Đặt ngay",
    "home.seeMore": "Xem thêm",
    "home.noMoviesPlaying": "Không có phim nào đang chiếu",
    "home.noMoviesUpcoming": "Không có phim nào sắp chiếu",
    // Quick Booking Bar
    "home.booking.title": "ĐẶT VÉ NHANH",
    "home.booking.movie": "Chọn phim",
    "home.booking.theater": "Chọn rạp",
    "home.booking.date": "Chọn ngày",
    "home.booking.showtime": "Chọn suất",
    "home.booking.bookNow": "Đặt ngay",
    // Footer
    "footer.theaterSystem": "Hệ thống rạp",
    "footer.contact": "Liên hệ",
    "footer.policy": "Chính sách",
    "footer.privacyPolicy": "Chính sách bảo mật",
    "footer.description":
      "CineHub - Hệ thống rạp chiếu phim hiện đại, mang đến trải nghiệm điện ảnh đỉnh cao với công nghệ tiên tiến nhất.",
    "footer.rights": "Tất cả quyền được bảo lưu.",
    // Contact
    "contact.university": "UIT - Trường Đại học Công nghệ Thông tin",
    "contact.address": "Địa chỉ",
    "contact.description":
      "Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh bên dưới.",
    "contact.title": "Gửi tin nhắn cho chúng tôi",
    "contact.name": "Họ và tên",
    "contact.namePlaceholder": "Nhập họ và tên của bạn",
    "contact.nameRequired": "Vui lòng nhập họ tên",
    "contact.nameMinLength": "Họ tên phải có ít nhất 2 ký tự",
    "contact.email": "Email",
    "contact.emailRequired": "Vui lòng nhập email",
    "contact.emailInvalid": "Email không hợp lệ",
    "contact.message": "Nội dung",
    "contact.messagePlaceholder": "Nhập nội dung tin nhắn...",
    "contact.messageRequired": "Vui lòng nhập nội dung",
    "contact.messageMinLength": "Nội dung phải có ít nhất 10 ký tự",
    "contact.messageMaxLength": "Nội dung không được vượt quá 1000 ký tự",
    "contact.send": "Gửi tin nhắn",
    "contact.sending": "Đang gửi...",
    "contact.success": "Thành công!",
    "contact.successMessage":
      "Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.",
    "contact.error": "Lỗi!",
    "contact.errorMessage":
      "Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.",
    // Common
    "common.loading": "Đang tải...",
    "common.confirm": "Xác nhận",
  },
  en: {
    // Header
    "header.about": "About",
    "header.search": "Search movies...",
    "header.login": "Login",
    "header.profile": "Profile",
    "header.dashboard": "Dashboard",
    "header.logout": "Logout",
    // Home
    "home.hero.title": "CINEHUB",
    "home.hero.subtitle": "Premium Cinema Experience",
    "home.nowPlaying": "NOW PLAYING",
    "home.upcoming": "UPCOMING",
    "home.promotions": "PROMOTIONS",
    "home.contact": "CONTACT",
    "home.learnMore": "Learn More",
    "home.bookTicket": "Book Ticket",
    "home.bookNow": "Book Now",
    "home.seeMore": "See More",
    "home.noMoviesPlaying": "No movies currently playing",
    "home.noMoviesUpcoming": "No upcoming movies",
    // Quick Booking Bar
    "home.booking.title": "QUICK BOOKING",
    "home.booking.movie": "Movie",
    "home.booking.theater": "Theater",
    "home.booking.date": "Date",
    "home.booking.showtime": "Showtime",
    "home.booking.bookNow": "BOOK NOW!",
    // Footer
    "footer.theaterSystem": "Theater System",
    "footer.contact": "Contact",
    "footer.policy": "Policy",
    "footer.privacyPolicy": "Privacy Policy",
    "footer.description":
      "CineHub - Modern cinema system, delivering premium movie experience with the most advanced technology.",
    "footer.rights": "All rights reserved.",
    // Contact
    "contact.university": "UIT - University of Information Technology",
    "contact.address": "Address",
    "contact.description":
      "We are always ready to listen and support you. Please contact us through the channels below.",
    "contact.title": "Send us a message",
    "contact.name": "Full name",
    "contact.namePlaceholder": "Enter your full name",
    "contact.nameRequired": "Please enter your name",
    "contact.nameMinLength": "Name must be at least 2 characters",
    "contact.email": "Email",
    "contact.emailRequired": "Please enter your email",
    "contact.emailInvalid": "Invalid email address",
    "contact.message": "Message",
    "contact.messagePlaceholder": "Enter your message...",
    "contact.messageRequired": "Please enter your message",
    "contact.messageMinLength": "Message must be at least 10 characters",
    "contact.messageMaxLength": "Message cannot exceed 1000 characters",
    "contact.send": "Send message",
    "contact.sending": "Sending...",
    "contact.success": "Success!",
    "contact.successMessage":
      "Your message has been sent successfully. We will respond as soon as possible.",
    "contact.error": "Error!",
    "contact.errorMessage":
      "An error occurred while sending your message. Please try again later.",
    // Common
    "common.loading": "Loading...",
    "common.confirm": "Confirm",
  },
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language] = useState<Language>(() => {
    // Get from localStorage or default to Vietnamese
    const saved = localStorage.getItem("cinehub-language");
    return (saved as Language) || "vi";
  });

  // Scroll to top after reload if language was just changed
  useEffect(() => {
    if (sessionStorage.getItem("cinehub-language-changed") === "true") {
      sessionStorage.removeItem("cinehub-language-changed");
      window.scrollTo(0, 0);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem("cinehub-language", lang);
    sessionStorage.setItem("cinehub-language-changed", "true");
    window.location.reload();
  };

  const toggleLanguage = () => {
    const newLang = language === "vi" ? "en" : "vi";
    setLanguage(newLang);
  };

  const t = (key: string): string => {
    return (
      translations[language][key as keyof (typeof translations)["vi"]] || key
    );
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
