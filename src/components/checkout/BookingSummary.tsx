import React from "react";
import type { SelectedComboItem } from "./SelectComboStep";
import type { PromotionResponse } from "@/types/promotion/promotion.type";

interface Props {
  booking: any;
  selectedCombos: Record<string, SelectedComboItem>;
  comboTotal: number;
  appliedPromo: PromotionResponse | null;
  discountValue: number;
  finalTotal: number;
  goToStep: (step: number) => void;
  ttl?: number | null; // <-- new prop: ttl in seconds, null = chưa lock ghế
}

const DEFAULT_TTL_DISPLAY = 300; // 5 phút

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const BookingSummary: React.FC<Props> = ({
  booking,
  selectedCombos,
  comboTotal,
  appliedPromo,
  discountValue,
  finalTotal,
  goToStep,
  ttl = null,
}) => {
  const combosArray = Object.values(selectedCombos).filter((c) => c.qty > 0);

  // timeToShow: nếu ttl === null => show default 5:00
  const timeToShow = ttl === null ? DEFAULT_TTL_DISPLAY : ttl;

  // bg class logic (match BookingSummaryBar)
  const ttlBgClass =
    ttl === null
      ? "bg-gray-300 text-gray-600"
      : timeToShow <= 60
        ? "bg-red-400 text-black animate-pulse"
        : timeToShow <= 120
          ? "bg-orange-300 text-black"
          : "bg-yellow-200 text-black";

  return (
    <aside className="space-y-4 relative">
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 sticky top-28 shadow-lg">
        {/* Header row with title + TTL on the right */}
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-extrabold text-gray-800">
            Tóm tắt đơn hàng
          </h3>

          <div
            className={`h-9 px-3 py-1 rounded-md flex items-center justify-center min-w-[96px] ${ttlBgClass}`}
          >
            <div className="text-xs font-semibold uppercase opacity-90 mr-2">
              Thời gian giữ vé
            </div>
            <div className="text-sm font-extrabold leading-none">
              {formatTime(timeToShow)}
            </div>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Phim</span>
            <span className="font-semibold">{booking.movieTitle}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>Rạp</span>
            <span className="font-semibold">
              {booking.showtime?.theaterName ?? booking.showtime?.cinemaName}
            </span>
          </div>
          <div className="flex justify-between mt-2">
            <span>Phòng</span>
            <span className="font-semibold">{booking.showtime?.roomName}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>Thời gian</span>
            <span className="font-semibold">
              {booking.showtime?.startTime
                ? new Date(booking.showtime.startTime).toLocaleString()
                : booking.showtime?.time}
            </span>
          </div>
          <div className="flex justify-between mt-2">
            <span>Ghế</span>
            <span className="font-semibold">
              {(booking.seats || []).map((s: any) => s.seatNumber).join(", ")}
            </span>
          </div>

          <div className="mt-3">
            <div className="font-semibold text-gray-800">Combo</div>
            {combosArray.length === 0 ? (
              <div className="text-gray-500 text-sm">Không có combo</div>
            ) : (
              <ul className="text-sm list-disc ml-4 mt-2">
                {combosArray.map((c, idx) => (
                  <li key={idx}>
                    {c.name} x {c.qty} — {(c.qty * c.price).toLocaleString()}{" "}
                    VND
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-4 border-t border-gray-300 mt-4">
            <div className="flex justify-between text-gray-700">
              <span>Tạm tính</span>
              <span>{booking.totalPrice.toLocaleString()} VND</span>
            </div>
            <div className="flex justify-between text-gray-700 mt-2">
              <span>Combo</span>
              <span>{comboTotal.toLocaleString()} VND</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-red-600 mt-2">
                <span>Mã giảm giá ({appliedPromo.code})</span>
                <span>
                  -
                  {appliedPromo.discountType === "PERCENTAGE"
                    ? `${appliedPromo.discountValue}%`
                    : discountValue.toLocaleString() + " VND"}
                </span>
              </div>
            )}
            <div className="flex justify-between text-yellow-600 font-bold mt-3 text-lg">
              <span>Tổng</span>
              <span>{finalTotal.toLocaleString()} VND</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => goToStep(4)}
              className="w-full bg-yellow-500 text-white font-bold py-3 rounded-lg hover:bg-yellow-600 transition"
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default BookingSummary;
