import { FaFacebook, FaTiktok, FaYoutube } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import { useEffect, useState } from "react";
import { theaterService } from "@/services/showtime/theaterService";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);

  useEffect(() => {
    theaterService
      .getAllTheaters()
      .then((data) => setTheaters(data))
      .catch((err) => console.error("Failed to load theaters:", err));
  }, []);

  return (
    <footer
      id="footer"
      className="bg-black backdrop-blur-lg border-t border-gray-700 text-gray-300"
    >
      <div className="max-w-5xl mx-auto py-12 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
        {/* Cột 1: Hệ thống rạp (BÊN TRÁI) */}
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">
            {t("footer.theaterSystem")}
          </h3>
          <ul className="space-y-2 text-sm">
            {theaters.map((theater) => (
              <li
                key={theater.id}
                className="hover:text-yellow-400 transition-colors cursor-pointer"
              >
                {theater.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 2: Liên hệ + Mạng xã hội + Chính sách */}
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">
            {t("footer.contact")}
          </h3>
          <ul className="space-y-2 text-sm mb-6">
            <li>
              <span className="text-yellow-400 mr-2">📍</span>
              {t("contact.university")}
            </li>
            <li>
              <span className="text-yellow-400 mr-2">📞</span> 1900 123 456
            </li>
            <li>
              <span className="text-yellow-400 mr-2">📧</span>{" "}
              support@cinehub.vn
            </li>
          </ul>

          <div className="flex space-x-4 mb-6 text-2xl">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition-colors"
            >
              <FaFacebook />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-500 transition-colors"
            >
              <FaYoutube />
            </a>
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              <SiZalo />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-500 transition-colors"
            >
              <FaTiktok />
            </a>
          </div>

          <div className="mt-auto">
            <h3 className="text-lg font-bold text-white mb-3">
              {t("footer.policy")}
            </h3>
            <a
              href="/privacy-policy"
              className="text-sm text-gray-400 hover:text-yellow-400 transition-colors"
            >
              {t("footer.privacyPolicy")}
            </a>
          </div>
        </div>

        {/* Cột 3: Logo + Mô tả (BÊN PHẢI) */}
        <div className="flex flex-col">
          <img
            src="/LogoFullfinal.png"
            alt="CineHub Logo"
            className="h-36 mb-4 w-auto"
          />
          <p className="text-sm leading-relaxed">{t("footer.description")}</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 text-center py-4 text-sm text-gray-400">
        © 2025 CineHub. {t("footer.rights")}
      </div>
    </footer>
  );
};

export default Footer;
