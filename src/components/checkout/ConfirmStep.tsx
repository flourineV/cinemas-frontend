import React from "react";
import type { PromotionResponse } from "@/types/promotion/promotion.type";

interface Props {
  booking: any;
  comboTotal: number;
  finalTotal: number;
  appliedPromo?: PromotionResponse | null;
  discountValue?: number;
  onPrev: () => void;
  onConfirm: () => void;
}

const ConfirmStep: React.FC<Props> = ({ booking, comboTotal, finalTotal, appliedPromo, discountValue, onPrev, onConfirm }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-yellow-300">Xác nhận đơn hàng</h2>

      <div className="bg-zinc-900 p-4 rounded-lg space-y-2">
        <div className="flex justify-between"><span>Phim:</span> <span>{booking.movieTitle}</span></div>
        <div className="flex justify-between"><span>Combo:</span> <span>{comboTotal.toLocaleString()} VND</span></div>
        {appliedPromo && (
          <div className="flex justify-between text-red-400">
            <span>Mã giảm giá ({appliedPromo.code})</span>
            <span>{appliedPromo.discountType === "PERCENTAGE" ? `-${appliedPromo.discountValue}%` : `-${discountValue?.toLocaleString()} VND`}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-yellow-300 mt-2">
          <span>Tổng:</span> <span>{finalTotal.toLocaleString()} VND</span>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <button onClick={onPrev} className="bg-gray-700 py-2 px-5 rounded-md">Quay lại</button>
        <button onClick={onConfirm} className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-md">Thanh toán</button>
      </div>
    </div>
  );
};

export default ConfirmStep;
