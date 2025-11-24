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
}

const BookingSummary: React.FC<Props> = ({ booking, selectedCombos, comboTotal, appliedPromo, discountValue, finalTotal, goToStep }) => {
  const combosArray = Object.values(selectedCombos).filter(c => c.qty > 0);

  return (
    <aside className="space-y-4">
      <div className="bg-zinc-900/40 border border-yellow-600/20 rounded-xl p-6 sticky top-28">
        <h3 className="text-lg font-extrabold text-yellow-300">Tóm tắt đơn hàng</h3>
        <div className="mt-3 text-sm text-gray-300">
          <div className="flex justify-between"><span>Phim</span><span className="font-semibold">{booking.movieTitle}</span></div>
          <div className="flex justify-between mt-2"><span>Rạp</span><span className="font-semibold">{booking.showtime?.theaterName ?? booking.showtime?.cinemaName}</span></div>
          <div className="flex justify-between mt-2"><span>Phòng</span><span className="font-semibold">{booking.showtime?.roomName}</span></div>
          <div className="flex justify-between mt-2"><span>Thời gian</span><span className="font-semibold">{(booking.showtime?.startTime ? new Date(booking.showtime.startTime).toLocaleString() : booking.showtime?.time)}</span></div>
          <div className="flex justify-between mt-2"><span>Ghế</span><span className="font-semibold">{(booking.seats || []).map((s: any) => s.seatNumber).join(", ")}</span></div>
               
          <div className="mt-3">
            <div className="font-semibold text-yellow-300">Combo</div>
            {combosArray.length === 0 ? (
              <div className="text-gray-400 text-sm">Không có combo</div>
            ) : (
              <ul className="text-sm list-disc ml-4 mt-2">
                {combosArray.map((c, idx) => (
                  <li key={idx}>{c.name} x {c.qty} — {(c.qty * c.price).toLocaleString()} VND</li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-700 mt-4">
            <div className="flex justify-between text-gray-300"><span>Tạm tính</span><span>{booking.totalPrice.toLocaleString()} VND</span></div>
            <div className="flex justify-between text-gray-300 mt-2"><span>Combo</span><span>{comboTotal.toLocaleString()} VND</span></div>
            {appliedPromo && (
              <div className="flex justify-between text-red-400 mt-2">
                <span>Mã giảm giá ({appliedPromo.code})</span>
                <span>-{appliedPromo.discountType === "PERCENTAGE" ? `${appliedPromo.discountValue}%` : discountValue.toLocaleString() + " VND"}</span>
              </div>
            )}
            <div className="flex justify-between text-yellow-300 font-bold mt-3 text-lg"><span>Tổng</span><span>{finalTotal.toLocaleString()} VND</span></div>
          </div>

          <div className="mt-6">
            <button onClick={() => goToStep(4)} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-md">Thanh toán</button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default BookingSummary;
