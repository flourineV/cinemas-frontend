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
    // Profile
    "profile.loading": "Đang tải...",
    "profile.cannotLoad": "Không thể tải thông tin hồ sơ",
    "profile.info": "Thông tin",
    "profile.bookings": "Lịch sử đặt vé",
    "profile.fnb": "Bắp nước",
    "profile.favorites": "Phim yêu thích",
    "profile.loyalty": "Lịch sử tích lũy",
    "profile.notUpdated": "Chưa cập nhật",
    "profile.edit": "Chỉnh sửa",
    "profile.ticketsBooked": "Vé đã đặt",
    "profile.favoriteMovies": "Phim yêu thích",
    "profile.loyaltyPoints": "Điểm tích lũy",
    "profile.memberRank": "Hạng thành viên",
    "profile.rankProgress": "Tiến độ hạng",
    "profile.fullName": "Họ và tên",
    "profile.email": "Email",
    "profile.phone": "Số điện thoại",
    "profile.gender": "Giới tính",
    "profile.male": "Nam",
    "profile.female": "Nữ",
    "profile.other": "Khác",
    "profile.address": "Địa chỉ",
    "profile.dateOfBirth": "Ngày sinh",
    "profile.nationalId": "CCCD",
    "profile.status": "Trạng thái",
    "profile.createdDate": "Ngày tạo",
    "profile.active": "Hoạt động",
    "profile.blocked": "Bị khóa",
    "profile.noBookingHistory": "Chưa có lịch sử đặt vé",
    "profile.bookingHistoryDesc": "Lịch sử đặt vé của bạn sẽ hiển thị ở đây",
    "profile.bookingCode": "Mã đặt vé",
    "profile.theater": "Rạp",
    "profile.room": "Phòng",
    "profile.showtime": "Suất chiếu",
    "profile.seats": "Ghế",
    "profile.seeMore": "Xem thêm",
    "profile.noFavoriteMovies": "Chưa có phim yêu thích",
    "profile.favoriteMoviesDesc": "Thêm phim yêu thích để xem lại sau",
    "profile.noFnbHistory": "Chưa có lịch sử đặt bắp nước",
    "profile.fnbHistoryDesc": "Lịch sử đặt bắp nước của bạn sẽ hiển thị ở đây",
    "profile.orderNow": "Đặt ngay",
    "profile.fnbOrder": "Đơn bắp nước",
    "profile.orderCode": "Mã đơn",
    "profile.confirmed": "Đã xác nhận",
    "profile.pending": "Đang chờ",
    "profile.cancelled": "Đã hủy",
    "profile.orderedItems": "Sản phẩm đã đặt",
    "profile.orderTime": "Thời gian đặt",
    "profile.total": "Tổng cộng",
    "profile.membershipRank": "Hạng thành viên",
    "profile.currentPoints": "Điểm hiện tại",
    "profile.pointsRemaining": "Còn",
    "profile.pointsToNext": "điểm để lên hạng tiếp theo",
    "profile.loyaltyHistory": "Lịch sử điểm thưởng",
    "profile.noLoyaltyHistory": "Chưa có lịch sử điểm thưởng",
    "profile.earned": "Nhận được",
    "profile.redeemed": "Đã đổi",
    "profile.bonus": "Thưởng",
    "profile.expired": "Hết hạn",
    "profile.points": "điểm",
    "profile.changeAvatar": "Đổi ảnh đại diện",
    "profile.avatarFormat": "JPEG hoặc PNG, tối đa 5MB",
    "profile.requiredField": "là bắt buộc",
    "profile.phoneInvalid": "Số điện thoại không hợp lệ (10-11 số)",
    "profile.selectGender": "Chọn giới tính",
    "profile.saving": "Đang lưu...",
    "profile.saveChanges": "Lưu thay đổi",
    // About
    "about.hero.title": "CINEHUB",
    "about.hero.subtitle": "Trải nghiệm điện ảnh đỉnh cao",
    "about.title": "VỀ CHÚNG TÔI",
    "about.description1":
      "CineHub là hệ thống rạp chiếu phim hiện đại, được thành lập với sứ mệnh mang đến trải nghiệm điện ảnh tuyệt vời nhất cho khán giả Việt Nam.",
    "about.description2":
      "Với công nghệ chiếu phim tiên tiến, âm thanh vòm Dolby Atmos và ghế ngồi cao cấp, CineHub cam kết mang đến những giây phút giải trí đáng nhớ.",
    "about.description3":
      "Chúng tôi không ngừng đổi mới và phát triển để trở thành điểm đến yêu thích của mọi tín đồ điện ảnh.",
    "about.mission.title": "SỨ MỆNH CỦA CHÚNG TÔI",
    "about.mission1.title": "Chất lượng hàng đầu",
    "about.mission1.description":
      "Cam kết mang đến trải nghiệm xem phim chất lượng cao nhất với công nghệ hiện đại.",
    "about.mission2.title": "Ưu đãi hấp dẫn",
    "about.mission2.description":
      "Nhiều chương trình khuyến mãi và ưu đãi đặc biệt dành cho khách hàng thân thiết.",
    "about.mission3.title": "Phim đa dạng",
    "about.mission3.description":
      "Cập nhật liên tục các bộ phim bom tấn trong nước và quốc tế.",
    "about.theaters.title": "HỆ THỐNG RẠP",
    "about.theaters.description":
      "Khám phá hệ thống rạp CineHub trải dài khắp Việt Nam với cơ sở vật chất hiện đại.",
    "about.theaters.bookTicket": "Đặt vé",
    "about.theaters.loading": "Đang tải danh sách rạp...",
    // Movie Detail
    "movie.loading": "Đang tải...",
    "movie.notFound": "Không tìm thấy phim.",
    "movie.cannotLoad": "Không thể tải thông tin phim.",
    "movie.info": "Thông tin phim",
    "movie.comments": "Bình luận",
    "movie.minutes": "phút",
    "movie.watchTrailer": "Xem Trailer",
    "movie.details": "Thông tin",
    "movie.director": "Đạo diễn",
    "movie.cast": "Diễn viên",
    "movie.overview": "Nội dung phim",
    "movie.yourRating": "Bạn",
    "movie.ratings": "lượt đánh giá",
    "movie.addToFavorite": "Thêm vào yêu thích",
    "movie.removeFromFavorite": "Xóa khỏi yêu thích",
    "movie.loginRequired": "Chưa đăng nhập",
    "movie.loginToFavorite": "Vui lòng đăng nhập để thêm phim yêu thích!",
    "movie.login": "Đăng nhập",
    "movie.cancel": "Hủy",
    "movie.removedFromFavorite": "Đã xóa khỏi yêu thích",
    "movie.removedFromFavoriteDesc":
      "Phim đã được xóa khỏi danh sách yêu thích!",
    "movie.addedToFavorite": "Đã thêm vào yêu thích",
    "movie.addedToFavoriteDesc": "Phim đã được thêm vào danh sách yêu thích!",
    "movie.error": "Lỗi",
    "movie.cannotUpdateFavorite": "Không thể cập nhật phim yêu thích!",
    "movie.loginToRate": "Yêu cầu đăng nhập",
    "movie.loginToRateDesc": "Bạn cần đăng nhập để đánh giá phim",
    "movie.notBooked": "Chưa đặt vé phim này",
    "movie.notBookedDesc": "Bạn cần đặt vé xem phim này để có thể đánh giá",
    "movie.bookNow": "Đặt vé ngay",
    "movie.ratingSuccess": "Đánh giá thành công!",
    "movie.ratingSuccessDesc": "Bạn đã đánh giá {rating} sao cho phim này",
    "movie.ratingError": "Không thể gửi đánh giá. Vui lòng thử lại sau.",
    // Theater Detail
    "theater.notFound": "Không tìm thấy rạp",
    "theater.introduction": "Giới thiệu",
    "theater.nowPlaying": "PHIM ĐANG CHIẾU",
    "theater.noShowtimes": "Hiện tại rạp chưa có suất chiếu nào",
    // FnB Page
    "fnb.title": "ĐẶT BẮP NƯỚC",
    "fnb.subtitle": "Thưởng thức bắp rang bơ và nước uống thơm ngon tại rạp",
    "fnb.selectTheater": "Chọn rạp để nhận hàng",
    "fnb.selectTheaterPlaceholder": "🎬 Chọn rạp gần bạn",
    "fnb.menuTitle": "Thực đơn đặc biệt",
    "fnb.menuSubtitle":
      "Tất cả rạp đều có cùng thực đơn với chất lượng tuyệt vời",
    "fnb.noItems": "Hiện chưa có sản phẩm nào",
    "fnb.add": "Thêm",
    "fnb.creatingOrder": "Đang tạo đơn hàng...",
    "fnb.pleaseWait": "Vui lòng đợi trong giây lát",
    "fnb.loginRequired": "Yêu cầu đăng nhập",
    "fnb.loginRequiredDesc": "Bạn cần đăng nhập để đặt bắp nước",
    "fnb.login": "Đăng nhập",
    "fnb.cancel": "Hủy",
    "fnb.noTheaterSelected": "Chưa chọn rạp",
    "fnb.noTheaterSelectedDesc": "Vui lòng chọn rạp để tiếp tục đặt hàng!",
    "fnb.emptyCart": "Giỏ hàng trống",
    "fnb.emptyCartDesc": "Vui lòng chọn ít nhất một món để tiếp tục!",
    "fnb.cartError": "Lỗi giỏ hàng",
    "fnb.cartErrorDesc":
      "Tổng tiền phải lớn hơn 0. Vui lòng kiểm tra lại giỏ hàng!",
    "fnb.error": "Lỗi",
    "fnb.tryAgain": "Vui lòng thử lại!",
    "fnb.noTheater": "Chưa chọn rạp",
    // Showtime Page
    "showtime.title": "LỊCH CHIẾU PHIM",
    "showtime.subtitle": "Tìm suất chiếu phù hợp với bạn",
    "showtime.date": "Ngày",
    "showtime.movie": "Phim",
    "showtime.theater": "Rạp",
    "showtime.selectDate": "Chọn ngày",
    "showtime.selectMovie": "Chọn Phim",
    "showtime.selectTheater": "Chọn Rạp",
    "showtime.noShowtimes": "Chưa có suất chiếu",
    "showtime.tryOther": "Vui lòng thử chọn ngày hoặc rạp khác",
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
    // Profile
    "profile.loading": "Loading...",
    "profile.cannotLoad": "Cannot load profile information",
    "profile.info": "Info",
    "profile.bookings": "Bookings",
    "profile.fnb": "F&B",
    "profile.favorites": "Favorites",
    "profile.loyalty": "Loyalty",
    "profile.notUpdated": "Not updated",
    "profile.edit": "Edit",
    "profile.ticketsBooked": "Tickets booked",
    "profile.favoriteMovies": "Favorite movies",
    "profile.loyaltyPoints": "Loyalty points",
    "profile.memberRank": "Member rank: ",
    "profile.rankProgress": "Rank progress",
    "profile.fullName": "Full name",
    "profile.email": "Email",
    "profile.phone": "Phone number",
    "profile.gender": "Gender",
    "profile.male": "Male",
    "profile.female": "Female",
    "profile.other": "Other",
    "profile.address": "Address",
    "profile.dateOfBirth": "Date of Birth",
    "profile.nationalId": "National ID",
    "profile.status": "Status",
    "profile.createdDate": "Created Date",
    "profile.active": "Active",
    "profile.blocked": "Blocked",
    "profile.noBookingHistory": "No booking history",
    "profile.bookingHistoryDesc": "Your booking history will appear here",
    "profile.bookingCode": "Booking code",
    "profile.theater": "Theater",
    "profile.room": "Room",
    "profile.showtime": "Showtime",
    "profile.seats": "Seats",
    "profile.seeMore": "See more",
    "profile.noFavoriteMovies": "No favorite movies",
    "profile.favoriteMoviesDesc": "Add favorite movies to watch later",
    "profile.noFnbHistory": "No F&B order history",
    "profile.fnbHistoryDesc": "Your F&B order history will appear here",
    "profile.orderNow": "Order now",
    "profile.fnbOrder": "F&B Order",
    "profile.orderCode": "Order code",
    "profile.confirmed": "Confirmed",
    "profile.pending": "Pending",
    "profile.cancelled": "Cancelled",
    "profile.orderedItems": "Ordered items",
    "profile.orderTime": "Order time",
    "profile.total": "Total",
    "profile.membershipRank": "Membership rank",
    "profile.currentPoints": "Current points",
    "profile.pointsRemaining": "Need",
    "profile.pointsToNext": "points to next rank",
    "profile.loyaltyHistory": "Loyalty history",
    "profile.noLoyaltyHistory": "No loyalty history",
    "profile.earned": "Earned",
    "profile.redeemed": "Redeemed",
    "profile.bonus": "Bonus",
    "profile.expired": "Expired",
    "profile.points": "points",
    "profile.changeAvatar": "Change avatar",
    "profile.avatarFormat": "JPEG or PNG, max 5MB",
    "profile.requiredField": "is required",
    "profile.phoneInvalid": "Invalid phone number (10-11 digits)",
    "profile.selectGender": "Select gender",
    "profile.saving": "Saving...",
    "profile.saveChanges": "Save changes",
    // About
    "about.hero.title": "CINEHUB",
    "about.hero.subtitle": "Premium Cinema Experience",
    "about.title": "ABOUT US",
    "about.description1":
      "CineHub is a modern cinema system, established with the mission of bringing the best cinematic experience to Vietnamese audiences.",
    "about.description2":
      "With advanced projection technology, Dolby Atmos surround sound and premium seating, CineHub is committed to delivering memorable entertainment moments.",
    "about.description3":
      "We continuously innovate and develop to become the favorite destination for all movie lovers.",
    "about.mission.title": "OUR MISSION",
    "about.mission1.title": "Top Quality",
    "about.mission1.description":
      "Committed to delivering the highest quality movie experience with modern technology.",
    "about.mission2.title": "Attractive Offers",
    "about.mission2.description":
      "Many promotions and special offers for loyal customers.",
    "about.mission3.title": "Diverse Movies",
    "about.mission3.description":
      "Continuously updated with domestic and international blockbusters.",
    "about.theaters.title": "THEATER SYSTEM",
    "about.theaters.description":
      "Discover the CineHub theater system spanning across Vietnam with modern facilities.",
    "about.theaters.bookTicket": "Book Ticket",
    "about.theaters.loading": "Loading theaters...",
    // Movie Detail
    "movie.loading": "Loading...",
    "movie.notFound": "Movie not found.",
    "movie.cannotLoad": "Cannot load movie information.",
    "movie.info": "Movie Info",
    "movie.comments": "Comments",
    "movie.minutes": "min",
    "movie.watchTrailer": "Watch Trailer",
    "movie.details": "Details",
    "movie.director": "Director",
    "movie.cast": "Cast",
    "movie.overview": "Overview",
    "movie.yourRating": "You",
    "movie.ratings": "ratings",
    "movie.addToFavorite": "Add to favorites",
    "movie.removeFromFavorite": "Remove from favorites",
    "movie.loginRequired": "Login Required",
    "movie.loginToFavorite": "Please login to add favorite movies!",
    "movie.login": "Login",
    "movie.cancel": "Cancel",
    "movie.removedFromFavorite": "Removed from favorites",
    "movie.removedFromFavoriteDesc":
      "Movie has been removed from your favorites!",
    "movie.addedToFavorite": "Added to favorites",
    "movie.addedToFavoriteDesc": "Movie has been added to your favorites!",
    "movie.error": "Error",
    "movie.cannotUpdateFavorite": "Cannot update favorite movies!",
    "movie.loginToRate": "Login Required",
    "movie.loginToRateDesc": "You need to login to rate this movie",
    "movie.notBooked": "Haven't booked this movie",
    "movie.notBookedDesc":
      "You need to book a ticket for this movie to rate it",
    "movie.bookNow": "Book Now",
    "movie.ratingSuccess": "Rating Successful!",
    "movie.ratingSuccessDesc": "You rated this movie {rating} stars",
    "movie.ratingError": "Cannot submit rating. Please try again later.",
    // Theater Detail
    "theater.notFound": "Theater not found",
    "theater.introduction": "Introduction",
    "theater.nowPlaying": "NOW PLAYING",
    "theater.noShowtimes": "No showtimes available at this theater",
    // FnB Page
    "fnb.title": "ORDER SNACKS",
    "fnb.subtitle": "Enjoy delicious popcorn and drinks at the theater",
    "fnb.selectTheater": "Select theater for pickup",
    "fnb.selectTheaterPlaceholder": "🎬 Select a theater near you",
    "fnb.menuTitle": "Special Menu",
    "fnb.menuSubtitle":
      "All theaters have the same menu with excellent quality",
    "fnb.noItems": "No products available",
    "fnb.add": "Add",
    "fnb.creatingOrder": "Creating order...",
    "fnb.pleaseWait": "Please wait a moment",
    "fnb.loginRequired": "Login Required",
    "fnb.loginRequiredDesc": "You need to login to order snacks",
    "fnb.login": "Login",
    "fnb.cancel": "Cancel",
    "fnb.noTheaterSelected": "No theater selected",
    "fnb.noTheaterSelectedDesc":
      "Please select a theater to continue ordering!",
    "fnb.emptyCart": "Empty cart",
    "fnb.emptyCartDesc": "Please select at least one item to continue!",
    "fnb.cartError": "Cart error",
    "fnb.cartErrorDesc":
      "Total amount must be greater than 0. Please check your cart!",
    "fnb.error": "Error",
    "fnb.tryAgain": "Please try again!",
    "fnb.noTheater": "No theater selected",
    // Showtime Page
    "showtime.title": "SHOWTIMES",
    "showtime.subtitle": "Find the perfect showtime for you",
    "showtime.date": "Date",
    "showtime.movie": "Movie",
    "showtime.theater": "Theater",
    "showtime.selectDate": "Select date",
    "showtime.selectMovie": "Select Movie",
    "showtime.selectTheater": "Select Theater",
    "showtime.noShowtimes": "No showtimes available",
    "showtime.tryOther": "Please try selecting a different date or theater",
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
