import { Link } from 'react-router-dom';
import { User, ChevronDown, Search, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../store/authStore';
import { useAuthActions } from '../../hooks/useAuthActions';

const Header = () => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const { isAuthenticated, userRole } = useAuth();
  const { logout } = useAuthActions();

  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-900 text-white z-50 shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div
          className="
            flex items-center justify-between
            py-2 px-4
            sm:py-3 sm:px-6
            md:py-3 md:px-12
            lg:py-3 lg:px-36
            w-full
          "
        >
          <Link to="/" className="flex items-center">
            <img
              src="/LogoFullfinal.png"
              alt="CineHub Logo"
              className="max-h-14 sm:max-h-16 md:max-h-20 lg:max-h-24 w-auto object-contain"
            />
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/about" className="text-base hover:text-yellow-400 transition-colors ">
              Giới thiệu
            </Link>
            <Link to="/promotions" className="text-base hover:text-yellow-400 transition-colors">
              Khuyến mãi
            </Link>
            <Link to="/events" className="text-base hover:text-yellow-400 transition-colors">
              Tổ chức sự kiện
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center bg-white rounded-full px-4 py-2 min-w-[300px]">
            <input 
              type="text" 
              placeholder="Tìm phim, rạp..." 
              className="flex-1 bg-white text-black text-sm outline-none"
            />
            <Search className="w-4 h-4 text-black" />
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-8">
            {!isAuthenticated ? (
              <>
                {/* User Login */}
                <Link to="/login" className="flex items-center space-x-1 hover:text-yellow-400 transition-colors whitespace-nowrap">
                  <User className="w-4 h-4" />
                  <span className="text-base">Đăng nhập</span>
                </Link>
              </>
            ) : (
              <>
                {/* Dashboard Link */}
                <Link to="/dashboard" className="flex items-center space-x-1 hover:text-yellow-400 transition-colors whitespace-nowrap">
                  <User className="w-4 h-4" />
                  <span className="text-base">Dashboard {userRole}</span>
                </Link>

                {/* Logout Button */}
                <button 
                  onClick={logout}
                  className="flex items-center space-x-1 hover:text-red-400 transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-base">Đăng xuất</span>
                </button>
              </>
            )}

            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-1 hover:text-yellow-400 transition-colors whitespace-nowrap focus:outline-none border-0"
              >
                <span className="text-red-500 font-bold text-sm">★</span>
                <span className="text-base">VN</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {/* Dropdown Menu */}
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button 
                      onClick={() => setIsLanguageOpen(false)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <span className="text-red-500 font-bold">★</span>
                      <span>Tiếng Việt</span>
                    </button>
                    <button 
                      onClick={() => setIsLanguageOpen(false)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <span className="text-blue-600 font-bold">🇺🇸</span>
                      <span>English</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
