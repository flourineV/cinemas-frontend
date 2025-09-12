import type { ReactNode } from 'react';
import './Footer.css';

interface FooterProps {
  children?: ReactNode;
}

const Footer = ({ children }: FooterProps) => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>CineHub</h3>
          <p>Trải nghiệm điện ảnh tuyệt vời nhất</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="Twitter">🐦</a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Phim</h4>
          <ul>
            <li><a href="/movies">Phim đang chiếu</a></li>
            <li><a href="/movies?upcoming=true">Phim sắp chiếu</a></li>
            <li><a href="/movies?type=imax">Phim IMAX</a></li>
            <li><a href="/movies?type=3d">Phim 3D</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Rạp</h4>
          <ul>
            <li><a href="/cinemas">Tất cả rạp</a></li>
            <li><a href="/cinemas?city=ho-chi-minh">TP. Hồ Chí Minh</a></li>
            <li><a href="/cinemas?city=ha-noi">Hà Nội</a></li>
            <li><a href="/cinemas?city=da-nang">Đà Nẵng</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Hỗ trợ</h4>
          <ul>
            <li><a href="/contact">Liên hệ</a></li>
            <li><a href="/faq">Câu hỏi thường gặp</a></li>
            <li><a href="/terms">Điều khoản</a></li>
            <li><a href="/privacy">Chính sách bảo mật</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 CineHub. Tất cả quyền được bảo lưu.</p>
      </div>
      
      {children}
    </footer>
  );
};

export default Footer;
