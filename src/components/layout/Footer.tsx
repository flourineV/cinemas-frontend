import { FaFacebook, FaTiktok, FaYoutube} from "react-icons/fa";
import { SiZalo } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8">

        {/* Logo + mô tả */}
        <div className="col-span-1 lg:col-span-2">
          <img 
            src="/LogoFullfinal.png" 
            alt="CineHub Logo"
            className="h-28 mb-2"
          />
          <p className="text-sm leading-relaxed">
            Trải nghiệm xem phim đỉnh cao với hệ thống rạp CineHub.  
            Đặt vé nhanh chóng, cập nhật khuyến mãi và tận hưởng thế giới điện ảnh.
          </p>
        </div>

        {/* Tài khoản */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">👤 Tài khoản</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/login" className="hover:text-white transition">Đăng nhập</a></li>
            <li><a href="/register" className="hover:text-white transition">Đăng ký</a></li>
            <li><a href="/membership" className="hover:text-white transition">Membership</a></li>
          </ul>
        </div>

        {/* Xem phim */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">🎬 Xem phim</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/now-showing" className="hover:text-white transition">Phim đang chiếu</a></li>
            <li><a href="/upcoming" className="hover:text-white transition">Phim sắp chiếu</a></li>
            <li><a href="/favorites" className="hover:text-white transition">Danh sách yêu thích</a></li>
          </ul>
        </div>

        {/* CineHub */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">🏢 CineHub</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:text-white transition">Giới thiệu</a></li>
            <li><a href="/promotions" className="hover:text-white transition">Khuyến mãi</a></li>
            <li><a href="/contact" className="hover:text-white transition">Liên hệ</a></li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4">📞 Liên hệ</h3>
          <ul className="space-y-2 text-sm">
            <li>📍 123 Đường ABC, Quận 1, TP.HCM</li>
            <li>📞 1900 123 456</li>
            <li>📧 support@cinehub.vn</li>
          </ul>

          <div className="flex space-x-4 mt-6 text-3xl">
            <a href="#" className="hover:text-blue-500"><FaFacebook /></a>
            <a href="#" className="hover:text-red-500"><FaYoutube /></a>
            <a href="#" className="hover:text-cyan-500"><SiZalo /></a>
            <a href="#" className="hover:text-cyan-500"><FaTiktok /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 text-center py-4 text-sm text-gray-400">
        © 2025 CineHub. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
