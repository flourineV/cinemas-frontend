import React, { useState } from "react";

interface SelectSeatProps {
  onSeatSelect: (seats: string[]) => void;
}

// Chỉ tới hàng N
const ROWS = ["A","B","C","D","E","F","G","H","J","K","L","M","N"];
const COLS = 15;

// Giả lập dữ liệu ghế đã đặt và ghế đôi
const RESERVED_SEATS = ["D7","F8","M12"];
const DOUBLE_SEATS = ["N5","N6","N7","N8","N9","N10"];

const SelectSeat: React.FC<SelectSeatProps> = ({ onSeatSelect }) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const toggleSeat = (seatId: string) => {
    if (RESERVED_SEATS.includes(seatId)) return;
    setSelectedSeats((prev) => {
      const updated = prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId];
      onSeatSelect(updated);
      return updated;
    });
  };

  return (
    <div className="flex gap-4 flex-wrap justify-center">
      {/* Màn hình cong */}
      <div className="relative w-[80%] h-12 flex justify-center mb-6">
        <div className="absolute top-0 w-full border-t-4 border-white rounded-full h-10"></div>
        <span className="absolute top-10 text-sm opacity-80">Màn hình</span>
      </div>

      {/* Khu ghế */}
      <div className="space-y-3">
        {ROWS.map((row) => (
          <div key={row} className="flex gap-3 justify-center items-center">
            <span className="w-4 text-xs text-gray-300">{row}</span>
            {Array.from({ length: COLS }).map((_, i) => {
              const seatId = `${row}${i + 1}`;
              const isReserved = RESERVED_SEATS.includes(seatId);
              const isSelected = selectedSeats.includes(seatId);
              const isDouble = DOUBLE_SEATS.includes(seatId);

              return (
                <div
                  key={seatId}
                  onClick={() => toggleSeat(seatId)}
                  className={`w-10 h-10 flex items-center justify-center text-[11px] rounded-md font-semibold transition-all duration-200 select-none
                    ${
                      isReserved
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : isSelected
                        ? "bg-yellow-400 text-black cursor-pointer scale-105"
                        : isDouble
                        ? "bg-pink-300 text-black cursor-pointer hover:bg-pink-400"
                        : "bg-white text-black hover:bg-yellow-200 cursor-pointer"
                    }`}
                >
                  {seatId}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Ghi chú màu */}
      <div className="flex gap-6 mt-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded-md"></div>
          <span>Ghế thường</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-pink-300 rounded-md"></div>
          <span>Ghế đôi (2 người)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-yellow-400 rounded-md"></div>
          <span>Ghế chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-600 rounded-md"></div>
          <span>Ghế đã đặt</span>
        </div>
      </div>
    </div>
  );
};

export default SelectSeat;
