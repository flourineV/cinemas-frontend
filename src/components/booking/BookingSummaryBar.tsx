import React, { useEffect, useState } from "react";

interface BookingSummaryBarProps {
  movieTitle: string;
  cinemaName: string;
  totalPrice: number;
  isVisible: boolean;
}

const BookingSummaryBar: React.FC<BookingSummaryBarProps> = ({
  movieTitle,
  cinemaName,
  totalPrice,
  isVisible,
}) => {
  const [isSticky, setIsSticky] = useState(true);
  const [topPosition, setTopPosition] = useState(0);
  const barRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.getElementById("footer");
      if (!footer || !barRef.current) return;

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const barHeight = barRef.current.offsetHeight;

      // Nếu footer đã vào viewport
      if (footerRect.top <= windowHeight) {
        // Chuyển sang absolute, đặt ngay trên footer
        setIsSticky(false);
        const footerTop = footer.offsetTop;
        setTopPosition(footerTop - barHeight);
      } else {
        // Footer chưa vào viewport, giữ fixed
        setIsSticky(true);
      }
    };

    handleScroll(); // Check initial state
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={barRef}
      className={`w-full left-0 z-50 ${isSticky ? "fixed bottom-0" : "absolute"}`}
      style={!isSticky ? { top: `${topPosition}px` } : undefined}
    >
      <div className="bg-yellow-600 h-28 text-white flex justify-between items-center px-56 shadow-lg border-t border-yellow-600/30">
        <div>
          <h2 className="text-2xl font-extrabold text-black">{movieTitle}</h2>
          <p className="text-md text-gray-800 mt-2">{cinemaName}</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-yellow-200 h-20 px-4 py-1 rounded-md text-black flex flex-col items-center justify-center min-w-[140px]">
            <span className="text-[11px] font-semibold uppercase opacity-90">
              Thời gian giữ vé
            </span>
            <span className="text-xl font-extrabold leading-none mt-2">
              05:00
            </span>
          </div>

          {/* Container gom nhóm Tiền và Nút */}
          <div className="flex flex-col gap-2 min-w-[240px]">
            {/* Hàng 1: Tạm tính & Giá tiền (nằm ngang, đẩy về 2 phía) */}
            <div className="flex justify-between items-baseline pt-3">
              <span className="text-black text-md font-medium">Tạm tính</span>
              <span className="text-xl font-bold text-black">
                {totalPrice.toLocaleString()} VNĐ
              </span>
            </div>

            {/* Hàng 2: Nút Đặt vé (full width) */}
            <button className="w-full h-11 mb-3 bg-yellow-200 hover:bg-yellow-400 text-black font-bold py-3 rounded-md uppercase tracking-wide transition-colors shadow-md">
              ĐẶT VÉ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummaryBar;
