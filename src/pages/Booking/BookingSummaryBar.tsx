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
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.getElementById("footer"); // Footer có sẵn trong Layout
      if (!footer) return;

      const rect = footer.getBoundingClientRect();
      setIsAtBottom(rect.top <= window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`w-full z-50 transition-all duration-300 ${
        isAtBottom ? "relative bottom-0" : "fixed bottom-0 left-0"
      }`}
    >
      <div className="bg-[#0b0f23] text-white flex justify-between items-center px-8 py-3 shadow-lg">
        <div>
          <h2 className="text-lg font-bold">{movieTitle}</h2>
          <p className="text-sm text-gray-300">{cinemaName}</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-yellow-400 px-4 py-2 rounded-md text-black font-bold text-lg">
            Thời gian giữ vé: 05:00
          </div>

          <div className="text-right">
            <p className="text-gray-300 text-sm">Tạm tính</p>
            <p className="text-2xl font-bold">{totalPrice.toLocaleString()} VNĐ</p>
          </div>

          <button className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 py-2 rounded-md">
            ĐẶT VÉ
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSummaryBar;
