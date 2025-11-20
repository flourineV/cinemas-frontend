import React, { useState, useEffect, useMemo } from "react";
import { showtimeSeatService } from "@/services/showtime/showtimeSeatService";
import type { ShowtimeSeatResponse } from "@/types/showtime/showtimeSeat.type";

interface SelectSeatProps {
  showtimeId: string;
  onSeatSelect: (seats: string[]) => void;
  selectedTickets: Record<string, number>;
}

const SelectSeat: React.FC<SelectSeatProps> = ({
  showtimeId,
  onSeatSelect,
  selectedTickets,
}) => {
  const [seats, setSeats] = useState<ShowtimeSeatResponse[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch dữ liệu ghế
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        const layout = await showtimeSeatService.getSeatsByShowtime(showtimeId);
        setSeats(layout.seats);
      } catch (error) {
        console.error("❌ Error fetching seats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [showtimeId]);

  // 2. Gom nhóm ghế theo hàng (A, B, C...)
  const groupedSeats: { [row: string]: ShowtimeSeatResponse[] } = {};
  seats.forEach((seat) => {
    const row = seat.seatNumber.charAt(0);
    if (!groupedSeats[row]) {
      groupedSeats[row] = [];
    }
    groupedSeats[row].push(seat);
  });

  const rows = Object.keys(groupedSeats).sort();

  // 3. Tìm cột lớn nhất (Max Column) để căn đều các hàng
  // Ví dụ: Rạp có ghế tới số 12 thì maxColumn = 12
  const maxColumn = useMemo(() => {
    if (seats.length === 0) return 0;
    return Math.max(
      ...seats.map((s) => {
        const col = parseInt(s.seatNumber.substring(1));
        // Nếu là ghế đôi thì nó chiếm không gian tới cột tiếp theo
        return s.type === "COUPLE" ? col + 1 : col;
      })
    );
  }, [seats]);

  // 4. Tính toán số lượng vé đã chọn
  const ticketCounts = useMemo(() => {
    let normalCount = 0;
    let coupleCount = 0;

    Object.entries(selectedTickets).forEach(([key, count]) => {
      const [seatType] = key.split("-");
      if (seatType === "NORMAL") {
        normalCount += count;
      } else if (seatType === "COUPLE") {
        coupleCount += count;
      }
    });

    return { normalCount, coupleCount };
  }, [selectedTickets]);

  // 5. Xử lý chọn ghế với validation
  const toggleSeat = async (seat: ShowtimeSeatResponse) => {
    if (seat.status === "BOOKED" || seat.status === "LOCKED") return;

    const isCurrentlySelected = selectedSeats.includes(seat.seatId);
    const isCoupleSeat = seat.type === "COUPLE";

    // Import Swal
    const Swal = (await import("sweetalert2")).default;

    // Nếu đang bỏ chọn ghế, cho phép
    if (isCurrentlySelected) {
      setSelectedSeats((prev) => {
        const updated = prev.filter((s) => s !== seat.seatId);
        onSeatSelect(updated);
        return updated;
      });
      return;
    }

    // Đếm số ghế đơn và ghế đôi đã chọn
    const selectedNormalSeats = selectedSeats.filter((seatId) => {
      const s = seats.find((seat) => seat.seatId === seatId);
      return s && s.type !== "COUPLE";
    }).length;

    const selectedCoupleSeats = selectedSeats.filter((seatId) => {
      const s = seats.find((seat) => seat.seatId === seatId);
      return s && s.type === "COUPLE";
    }).length;

    // Validation: Nếu chọn ghế đôi
    if (isCoupleSeat) {
      // Kiểm tra có vé đôi không
      if (ticketCounts.coupleCount === 0) {
        await Swal.fire({
          icon: "warning",
          title: "Chưa chọn vé đôi",
          text: "Vui lòng chọn vé đôi trước khi chọn ghế đôi!",
          confirmButtonColor: "#eab308",
        });
        return;
      }

      // Kiểm tra đã chọn đủ ghế đôi chưa
      if (selectedCoupleSeats >= ticketCounts.coupleCount) {
        await Swal.fire({
          icon: "warning",
          title: "Đã đủ ghế đôi",
          text: `Bạn chỉ mua ${ticketCounts.coupleCount} vé đôi, không thể chọn thêm ghế đôi!`,
          confirmButtonColor: "#eab308",
        });
        return;
      }
    } else {
      // Validation: Nếu chọn ghế đơn
      // Kiểm tra có vé đơn không
      if (ticketCounts.normalCount === 0) {
        await Swal.fire({
          icon: "warning",
          title: "Chưa chọn vé đơn",
          text: "Vui lòng chọn vé đơn trước khi chọn ghế đơn!",
          confirmButtonColor: "#eab308",
        });
        return;
      }

      // Kiểm tra đã chọn đủ ghế đơn chưa
      if (selectedNormalSeats >= ticketCounts.normalCount) {
        await Swal.fire({
          icon: "warning",
          title: "Đã đủ ghế đơn",
          text: `Bạn chỉ mua ${ticketCounts.normalCount} vé đơn, không thể chọn thêm ghế!`,
          confirmButtonColor: "#eab308",
        });
        return;
      }
    }

    // Cho phép chọn ghế
    setSelectedSeats((prev) => {
      const updated = [...prev, seat.seatId];
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
    <div className="flex flex-col items-center w-full">
      {/* Màn hình cong */}
      <div className="relative w-[70%] h-28 flex justify-center mb-10">
        <svg
          viewBox="0 0 1000 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 0 80 Q 500 0 1000 80"
            fill="none"
            stroke="white"
            strokeWidth="4"
          />
        </svg>
        <span className="absolute bottom-2 text-white text-lg font-extrabold text-center w-full">
          MÀN HÌNH
        </span>
      </div>

      {/* Khu vực ghế */}
      <div className="space-y-3 w-full">
        {rows.map((row) => {
          // Sắp xếp ghế trong hàng theo số cột tăng dần
          const rowSeats = groupedSeats[row].sort((a, b) => {
            const colA = parseInt(a.seatNumber.substring(1));
            const colB = parseInt(b.seatNumber.substring(1));
            return colA - colB;
          });

          // Tính toán khoảng trống cuối hàng để căn thẳng cột
          const lastSeat = rowSeats[rowSeats.length - 1];
          let lastSeatEndCol = 0;
          if (lastSeat) {
            const col = parseInt(lastSeat.seatNumber.substring(1));
            lastSeatEndCol = lastSeat.type === "COUPLE" ? col + 1 : col;
          }
          const seatsToFillAtEnd = maxColumn - lastSeatEndCol;
          const endSpacers =
            seatsToFillAtEnd > 0 ? Array(seatsToFillAtEnd).fill(null) : [];

          return (
            <div
              key={row}
              className="w-full flex justify-center items-center relative px-10"
            >
              {/* Nhãn hàng (Row Label) cố định bên trái */}
              <span className="absolute left-4 md:left-10 text-sm text-gray-300 font-semibold w-6 text-center">
                {row}
              </span>

              {/* Container chứa các ghế */}
              <div className="flex gap-4">
                {rowSeats.map((seat, index) => {
                  const isSelected = selectedSeats.includes(seat.seatId);
                  const isBooked = seat.status === "BOOKED";
                  const isLocked = seat.status === "LOCKED";
                  const isCouple = seat.type === "COUPLE";
                  const isVip = seat.type === "VIP";

                  const currentCol = parseInt(seat.seatNumber.substring(1));
                  const prevSeat = index > 0 ? rowSeats[index - 1] : null;

                  // Tính vị trí kết thúc của ghế trước đó để xác định khoảng trống
                  let prevCol = 0;
                  if (prevSeat) {
                    const prevSeatCol = parseInt(
                      prevSeat.seatNumber.substring(1)
                    );
                    prevCol =
                      prevSeat.type === "COUPLE"
                        ? prevSeatCol + 1
                        : prevSeatCol;
                  }

                  // Tạo khoảng trống GIỮA các ghế (nếu có)
                  const colGap = currentCol - prevCol - 1;
                  const gapSpacers = colGap > 0 ? Array(colGap).fill(null) : [];

                  // --- XỬ LÝ STYLE VÀ CLASS ---
                  const containerClasses =
                    "h-10 flex items-center justify-center transition-all duration-200 select-none";

                  // Width: Ghế đôi w-24 (96px), Ghế đơn w-10 (40px)
                  const widthClass = isCouple ? "w-24" : "w-10 rounded-md";

                  let colorClass = "";

                  if (isBooked) {
                    colorClass = isCouple
                      ? "cursor-not-allowed"
                      : "bg-gray-600 text-gray-300 cursor-not-allowed";
                  } else if (isLocked) {
                    colorClass = isCouple
                      ? "cursor-not-allowed opacity-70"
                      : "bg-orange-500 text-white cursor-not-allowed opacity-70";
                  } else if (isSelected) {
                    colorClass = isCouple
                      ? "cursor-pointer"
                      : "bg-yellow-400 text-black cursor-pointer";
                  } else {
                    // Ghế rảnh
                    if (isVip) {
                      colorClass =
                        "bg-purple-500 text-white hover:bg-purple-400 cursor-pointer";
                    } else {
                      colorClass = isCouple
                        ? "cursor-pointer"
                        : "bg-white text-black hover:bg-yellow-200 cursor-pointer";
                    }
                  }

                  return (
                    <React.Fragment key={seat.seatId}>
                      {/* Render khoảng trống giữa các ghế */}
                      {gapSpacers.map((_, idx) => (
                        <div
                          key={`gap-${row}-${prevCol + idx + 1}`}
                          className="w-10 h-10"
                        />
                      ))}

                      {/* Render Ghế */}
                      <div
                        onClick={() => toggleSeat(seat)}
                        className={`${containerClasses} ${widthClass} ${colorClass} ${
                          !isCouple ? "font-semibold text-[10px]" : ""
                        }`}
                      >
                        {isCouple ? (
                          // SVG GHẾ ĐÔI
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 64 40"
                            fill="currentColor"
                            preserveAspectRatio="none"
                            // w-16 (64px) nằm giữa container w-24 (96px)
                            className={`h-full w-16 ${
                              isBooked
                                ? "text-gray-300"
                                : isLocked
                                  ? "text-white opacity-70"
                                  : isSelected
                                    ? "text-yellow-400"
                                    : "text-white hover:text-yellow-200 transition-colors"
                            }`}
                          >
                            <path d="M8 0 L26 0 L32 6 L38 0 L56 0 A8 8 0 0 1 64 8 L64 32 A8 8 0 0 1 56 40 L38 40 L32 34 L26 40 L8 40 A8 8 0 0 1 0 32 L0 8 A8 8 0 0 1 8 0 Z" />
                            <text
                              x="50%"
                              y="55%"
                              dominantBaseline="middle"
                              textAnchor="middle"
                              fill={isBooked ? "#6b7280" : "#000000"}
                              style={{
                                fontSize: "10px",
                                fontWeight: 600,
                              }}
                            >
                              {seat.seatNumber}
                            </text>
                          </svg>
                        ) : (
                          // TEXT GHẾ ĐƠN
                          seat.seatNumber
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Render khoảng trống CUỐI hàng để căn thẳng cột */}
                {endSpacers.map((_, idx) => (
                  <div key={`end-gap-${row}-${idx}`} className="w-10 h-10" />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chú thích (Legend) */}
      <div className="flex gap-4 mt-8 text-sm flex-wrap justify-center text-white pt-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center text-[10px] rounded-md font-semibold bg-white text-black border border-gray-300"></div>
          <span>Ghế thường</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center text-[10px] rounded-md font-semibold bg-purple-500 text-white"></div>
          <span>Ghế VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 40"
              fill="currentColor"
              className="w-full h-full text-white"
            >
              <path d="M8 0 L26 0 L32 6 L38 0 L56 0 A8 8 0 0 1 64 8 L64 32 A8 8 0 0 1 56 40 L38 40 L32 34 L26 40 L8 40 A8 8 0 0 1 0 32 L0 8 A8 8 0 0 1 8 0 Z" />
            </svg>
          </div>
          <span>Ghế đôi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center text-[10px] rounded-md font-semibold bg-yellow-400 text-black"></div>
          <span>Ghế chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center text-[10px] rounded-md font-semibold bg-orange-500 text-white opacity-70"></div>
          <span>Đang giữ chỗ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center text-[10px] rounded-md font-semibold bg-gray-600 text-gray-300 cursor-not-allowed"></div>
          <span>Đã đặt</span>
        </div>
      </div>
    </div>
  );
};

export default SelectSeat;
