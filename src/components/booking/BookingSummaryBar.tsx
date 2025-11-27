import React, { useEffect, useState } from "react";
import Swal from "sweetalert2"; // Import SweetAlert2

interface BookingSummaryBarProps {
  movieTitle: string;
  cinemaName: string;
  totalPrice: number;
  isVisible: boolean;
  ttl?: number | null; // Time to live in seconds, null = chưa lock ghế
  onSubmit: () => void;
  onTTLExpired?: () => void; // Callback khi hết thời gian
}

const BookingSummaryBar: React.FC<BookingSummaryBarProps> = ({
  movieTitle,
  cinemaName,
  totalPrice,
  isVisible,
  ttl,
  onSubmit,
  onTTLExpired,
}) => {
  const [isSticky, setIsSticky] = useState(true);
  const [topPosition, setTopPosition] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(ttl ?? null);
  const barRef = React.useRef<HTMLDivElement>(null);

  // Mặc định 5 phút (300 giây) để hiển thị khi chưa chạy
  const DEFAULT_TTL_DISPLAY = 300;

  // Update timeLeft when ttl changes from parent (WebSocket broadcast)
  useEffect(() => {
    if (ttl !== null && ttl !== undefined) {
      console.log("📊 [BookingSummaryBar] TTL updated from parent:", ttl);
      setTimeLeft(ttl);
    }
  }, [ttl]);

  // Countdown timer logic - chỉ chạy 1 lần khi component mount
  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          return prev;
        }

        const newValue = prev - 1;

        // Notify parent when TTL expired
        if (newValue === 0 && onTTLExpired) {
          console.log("⏰ [BookingSummaryBar] TTL expired!");
          onTTLExpired();
        }

        return newValue;
      });
    }, 1000);

    return () => {
      console.log("🧹 [BookingSummaryBar] Cleanup timer");
      clearInterval(timer);
    };
  }, [isVisible, onTTLExpired]); // Không có timeLeft trong dependencies!

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle Scroll logic (Sticky/Absolute)
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.getElementById("footer");
      if (!footer || !barRef.current) return;

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const barHeight = barRef.current.offsetHeight;

      if (footerRect.top <= windowHeight) {
        setIsSticky(false);
        const footerTop = footer.offsetTop;
        setTopPosition(footerTop - barHeight);
      } else {
        setIsSticky(true);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isVisible]);

  // --- Xử lý sự kiện click Đặt vé ---
  const handleBooking = () => {
    // Điều kiện: Nếu chưa có thời gian đếm ngược (chưa lock ghế) hoặc tổng tiền = 0
    if (timeLeft === null || totalPrice === 0) {
      Swal.fire({
        title: "Chưa chọn ghế!",
        text: "Vui lòng chọn ghế và vé trước khi tiến hành thanh toán.",
        icon: "warning",
        confirmButtonText: "Đã hiểu",
        confirmButtonColor: "#ca8a04", // Màu vàng khớp theme (yellow-600)
        background: "#fff",
        color: "#000",
      });
      return;
    }

    // Nếu ok thì gọi hàm submit của parent
    onSubmit();
  };

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
          {/* LOGIC HIỂN THỊ ĐỒNG HỒ */}
          {timeLeft !== null && timeLeft > 0 ? (
            // TRƯỜNG HỢP 1: Đang đếm ngược (đã chọn ghế)
            <div
              className={`h-20 px-4 py-1 rounded-md text-black flex flex-col items-center justify-center min-w-[140px] ${
                timeLeft <= 60
                  ? "bg-red-400 animate-pulse"
                  : timeLeft <= 120
                    ? "bg-orange-300"
                    : "bg-yellow-200"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase opacity-90">
                Thời gian giữ vé
              </span>
              <span className="text-xl font-extrabold leading-none mt-2">
                {formatTime(timeLeft)}
              </span>
            </div>
          ) : (
            // TRƯỜNG HỢP 2: Chưa chạy (chưa chọn ghế) -> Hiển thị mặc định 5 phút
            <div className="h-20 px-4 py-1 rounded-md bg-gray-300 text-gray-600 flex flex-col items-center justify-center min-w-[140px]">
              <span className="text-[11px] font-semibold uppercase opacity-90">
                Thời gian giữ vé
              </span>
              <span className="text-xl font-extrabold leading-none mt-2">
                {formatTime(DEFAULT_TTL_DISPLAY)}
              </span>
            </div>
          )}

          {/* Container gom nhóm Tiền và Nút */}
          <div className="flex flex-col gap-2 min-w-[240px]">
            {/* Hàng 1: Tạm tính */}
            <div className="flex justify-between items-baseline pt-3">
              <span className="text-black text-md font-medium">Tạm tính</span>
              <span className="text-xl font-bold text-black">
                {totalPrice.toLocaleString()} VNĐ
              </span>
            </div>

            {/* Hàng 2: Nút Đặt vé */}
            <button
              onClick={handleBooking} // Đổi thành hàm xử lý nội bộ có SweetAlert
              className="w-full h-11 mb-3 bg-yellow-200 hover:bg-yellow-400 text-black font-bold py-3 rounded-md uppercase tracking-wide transition-colors shadow-md"
            >
              ĐẶT VÉ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummaryBar;
