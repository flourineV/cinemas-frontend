import type { ReactNode } from 'react';
import './Header.css';

interface HeaderProps {
  children?: ReactNode;
}

const Header = ({ children }: HeaderProps) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <h1>CineHub</h1>
        </div>
        
        <nav className="header-nav">
          <a href="/" className="nav-link">Trang chủ</a>
          <a href="/movies" className="nav-link">Phim</a>
          <a href="/cinemas" className="nav-link">Rạp</a>
          <a href="/contact" className="nav-link">Liên hệ</a>
        </nav>
        
        <div className="header-actions">
          <button className="btn-login">Đăng nhập</button>
          <button className="btn-register">Đăng ký</button>
        </div>
      </div>
      
      {children}
    </header>
  );
};

export default Header;
