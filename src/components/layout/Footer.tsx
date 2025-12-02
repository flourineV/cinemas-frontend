import { FaFacebook, FaTiktok, FaYoutube } from "react-icons/fa";
import { SiZalo } from "react-icons/si";

const Footer = () => {
  return (
    <footer
      id="footer"
      className="bg-black backdrop-blur-lg border-t border-gray-700 text-gray-300"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8">
        {/* Logo + mô tả */}
        <div className="col-span-1 lg:col-span-2">
          <img
            src="/LogoFullfinal.png"
            alt="CineHub Logo"
            className="h-28 mb-2"
          />
          <p className="text-sm leading-relaxed">
            Trải nghiệm xem phim đỉnh cao với hệ thống rạp CineHub. Đặt vé nhanh
            chóng, cập nhật khuyến mãi và tận hưởng thế giới điện ảnh.
          </p>
        </div>

        {/* Liên hệ */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4">📞 Liên hệ</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="text-yellow-400 mr-2">📍</span> 123 Đường ABC,
              Quận 1, TP.HCM
            </li>
            <li>
              <span className="text-yellow-400 mr-2">📞</span> 1900 123 456
            </li>
            <li>
              <span className="text-yellow-400 mr-2">📧</span>{" "}
              support@cinehub.vn
            </li>
          </ul>

          <div className="flex space-x-4 mt-6 text-3xl">
            <a href="#" className="hover:text-blue-500">
              <FaFacebook />
            </a>
            <a href="#" className="hover:text-red-500">
              <FaYoutube />
            </a>
            <a href="#" className="hover:text-cyan-500">
              <SiZalo />
            </a>
            <a href="#" className="hover:text-cyan-500">
              <FaTiktok />
            </a>
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
