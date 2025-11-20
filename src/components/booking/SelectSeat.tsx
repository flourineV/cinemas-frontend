import React, { useState, useEffect } from "react";
import { showtimeSeatService } from "@/services/showtime/showtimeSeatService";
import type { ShowtimeSeatResponse } from "@/types/showtime/showtimeSeat.type";

interface SelectSeatProps {
  showtimeId: string;
  onSeatSelect: (seats: string[]) => void;
}

const SelectSeat: React.FC<SelectSeatProps> = ({
  showtimeId,
  onSeatSelect,
}) => {
  const [seats, setSeats] = useState<ShowtimeSeatResponse[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch seats data - chỉ cần 1 API call
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);

        // Lấy layout và trạng thái ghế từ 1 API duy nhất
        const layout = await showtimeSeatService.getSeatsByShowtime(showtimeId);

        console.log("🎬 Showtime Layout Response:", layout);
        console.log("📊 Status distribution:", {
          total: layout.totalSeats,
          rows: layout.totalRows,
          columns: layout.totalColumns,
          available: layout.seats.filter((s) => s.status === "AVAILABLE")
            .length,
          locked: layout.seats.filter((s) => s.status === "LOCKED").length,
          booked: layout.seats.filter((s) => s.status === "BOOKED").length,
        });

        setSeats(layout.seats);
      } catch (error) {
        console.error("❌ Error fetching seats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [showtimeId]);

  // Group seats by row - extract row from seatNumber (A01, B05, etc.)
  const groupedSeats: { [row: string]: ShowtimeSeatResponse[] } = {};
  seats.forEach((seat) => {
    const row = seat.seatNumber.charAt(0); // Extract 'A' from 'A01'
    if (!groupedSeats[row]) {
      groupedSeats[row] = [];
    }
    groupedSeats[row].push(seat);
  });

  // Sort rows alphabetically
  const rows = Object.keys(groupedSeats).sort();

  const toggleSeat = (seat: ShowtimeSeatResponse) => {
    // Không cho chọn ghế đã đặt hoặc đang bị khóa
    if (seat.status === "BOOKED" || seat.status === "LOCKED") return;

    setSelectedSeats((prev) => {
      const updated = prev.includes(seat.seatId)
        ? prev.filter((s) => s !== seat.seatId)
        : [...prev, seat.seatId];
      onSeatSelect(updated);
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <p className="text-white text-xl">Đang tải sơ đồ ghế...</p>
      </div>
    );
  }

  if (seats.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <p className="text-white text-xl">Không có dữ liệu ghế.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Màn hình cong */}
      <div className="relative w-[80%] h-12 flex justify-center mb-6">
        <div className="absolute top-0 w-full border-t-4 border-white rounded-full h-10"></div>
        <span className="absolute top-10 text-sm opacity-80 text-white">
          Màn hình
        </span>
      </div>

      {/* Khu ghế - Dynamic theo data từ API */}
      <div className="space-y-3">
        {rows.map((row) => {
          // Sort seats in row by column number extracted from seatNumber
          const rowSeats = groupedSeats[row].sort((a, b) => {
            const colA = parseInt(a.seatNumber.substring(1)); // Extract '01' from 'A01'
            const colB = parseInt(b.seatNumber.substring(1));
            return colA - colB;
          });

          return (
            <div key={row} className="flex gap-3 justify-center items-center">
              <span className="w-8 text-xs text-gray-300 font-semibold">
                {row}
              </span>
              {rowSeats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.seatId);
                const isBooked = seat.status === "BOOKED";
                const isLocked = seat.status === "LOCKED";

                return (
                  <div
                    key={seat.seatId}
                    onClick={() => toggleSeat(seat)}
                    className={`w-10 h-10 flex items-center justify-center text-[10px] rounded-md font-semibold transition-all duration-200 select-none
                      ${
                        isBooked
                          ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                          : isLocked
                            ? "bg-orange-500 text-white cursor-not-allowed opacity-70"
                            : isSelected
                              ? "bg-yellow-400 text-black cursor-pointer scale-105"
                              : "bg-white text-black hover:bg-yellow-200 cursor-pointer"
                      }`}
                  >
                    {seat.seatNumber}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Ghi chú màu */}
      <div className="flex gap-4 mt-8 text-sm flex-wrap justify-center text-white">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded-md border border-gray-300"></div>
          <span>Ghế thường</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-yellow-400 rounded-md"></div>
          <span>Ghế đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-500 rounded-md"></div>
          <span>Đang giữ chỗ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-600 rounded-md"></div>
          <span>Đã đặt</span>
        </div>
      </div>
    </div>
  );
};

export default SelectSeat;
