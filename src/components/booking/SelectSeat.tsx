import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Swal from "sweetalert2";
import { showtimeSeatService } from "@/services/showtime/showtimeSeatService";
import { seatLockService } from "@/services/showtime/seatLockService";
import { websocketService } from "@/services/websocket/websocketService";
import { useGuestSessionContext } from "@/contexts/GuestSessionContext";
import type { ShowtimeSeatResponse } from "@/types/showtime/showtimeSeat.type";
import type { SeatLockResponse } from "@/types/showtime/seatlock.type";

interface SelectSeatProps {
  showtimeId: string;
  // trước: onSeatSelect: (seatIds: string[]) => void;
  onSeatSelect: (seats: ShowtimeSeatResponse[]) => void;
  selectedTickets: Record<string, number>;
  onSeatLock?: (ttl: number | null) => void;
}

const SelectSeat: React.FC<SelectSeatProps> = ({
  showtimeId,
  onSeatSelect,
  selectedTickets,
  onSeatLock,
}) => {
  const [seats, setSeats] = useState<ShowtimeSeatResponse[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<ShowtimeSeatResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Vẫn lấy context để dùng fallback cho trường hợp Guest thật
  const { getUserOrGuestId } = useGuestSessionContext();

  const selectedSeatsRef = useRef<ShowtimeSeatResponse[]>(selectedSeats);
  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  // === HÀM HELPER QUAN TRỌNG: ƯU TIÊN LẤY USER TỪ LOCAL STORAGE ===
  const getSafeIdentity = () => {
    // 1. Ưu tiên: Check auth-storage (User đã login)
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        // Cấu trúc zustand persist: { state: { user: { id: ... } } }
        const userId = parsed?.state?.user?.id;

        if (userId) {
          console.log("👤 [SelectSeat] Found User ID from Storage:", userId);
          // Trả về userId, ép guestSessionId thành undefined để Backend không hiểu nhầm
          return { userId: userId, guestSessionId: undefined };
        }
      } catch (e) {
        console.error("Error parsing auth-storage", e);
      }
    }

    // 2. Fallback: Nếu không có User, mới gọi Context để lấy/tạo Guest ID
    const guestIdentity = getUserOrGuestId();
    console.log("👻 [SelectSeat] Using Guest Identity:", guestIdentity);
    return guestIdentity;
  };

  // === WEBSOCKET HANDLING ===
  // (Giữ nguyên logic cập nhật trạng thái từ socket)
  useEffect(() => {
    if (!showtimeId) return;

    const handler = async (raw: any) => {
      const payload = raw as SeatLockResponse;

      // 1. Update UI
      setSeats((prev) =>
        prev.map((s) =>
          s.seatId === payload.seatId
            ? {
                ...s,
                status:
                  payload.status === "LOCKED"
                    ? "LOCKED"
                    : payload.status === "BOOKED"
                      ? "BOOKED"
                      : "AVAILABLE",
              }
            : s
        )
      );

      // 2. Update TTL nếu là ghế mình chọn
      if (typeof payload.ttl === "number") {
        const isMySeat = selectedSeatsRef.current.some(
          (s) => s.seatId === payload.seatId
        );
        if (isMySeat && onSeatLock) {
          onSeatLock(payload.ttl);
        }
      }

      // 3. Handle mất ghế (Expire hoặc bị chiếm)
      if (payload.status === "AVAILABLE") {
        const wasSelected = selectedSeatsRef.current.some(
          (s) => s.seatId === payload.seatId
        );

        if (wasSelected) {
          try {
            await Swal.fire({
              icon: "warning",
              title: "Hết thời gian giữ ghế",
              text: "Ghế bạn đang giữ đã bị giải phóng. Vui lòng chọn lại ghế!",
              confirmButtonColor: "#eab308",
              scrollbarPadding: false,
            });
          } catch (err) {
            console.warn(err);
          }

          setSelectedSeats([]);
          selectedSeatsRef.current = [];
          onSeatSelect([]);
          if (onSeatLock) onSeatLock(null);
        }
      }
    };

    const unsubscribe = websocketService.subscribeSeatLock(showtimeId, handler);
    return () => {
      unsubscribe();
    };
  }, [showtimeId, onSeatSelect, onSeatLock]);

  // === DATA FETCHING ===
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        const layout = await showtimeSeatService.getSeatsByShowtime(showtimeId);
        setSeats(layout.seats);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [showtimeId]);

  // === LAYOUT CALCULATION ===
  const groupedSeats: { [row: string]: ShowtimeSeatResponse[] } = {};
  seats.forEach((seat) => {
    const row = seat.seatNumber.charAt(0);
    if (!groupedSeats[row]) groupedSeats[row] = [];
    groupedSeats[row].push(seat);
  });
  const rows = Object.keys(groupedSeats).sort();

  const maxColumn = useMemo(() => {
    if (seats.length === 0) return 0;
    return Math.max(
      ...seats.map((s) =>
        s.type === "COUPLE"
          ? parseInt(s.seatNumber.substring(1)) + 1
          : parseInt(s.seatNumber.substring(1))
      )
    );
  }, [seats]);

  const ticketCounts = useMemo(() => {
    let normalCount = 0;
    let coupleCount = 0;
    Object.entries(selectedTickets).forEach(([key, count]) => {
      const [seatType] = key.split("-");
      if (seatType === "NORMAL") normalCount += count;
      else if (seatType === "COUPLE") coupleCount += count;
    });
    return { normalCount, coupleCount };
  }, [selectedTickets]);

  // === TOGGLE SEAT LOGIC ===
  const toggleSeat = async (seat: ShowtimeSeatResponse) => {
    if (seat.status === "BOOKED" || seat.status === "LOCKED") return;

    const isCurrentlySelected = selectedSeats.some(
      (s) => s.seatId === seat.seatId
    );
    const isCoupleSeat = seat.type === "COUPLE";

    // LẤY IDENTITY AN TOÀN TẠI THỜI ĐIỂM CLICK
    const identity = getSafeIdentity();

    // CASE 1: BỎ CHỌN (UNLOCK)
    if (isCurrentlySelected) {
      try {
        await seatLockService.unlockSingleSeat(
          showtimeId,
          seat.seatId,
          identity.userId,
          identity.guestSessionId
        );
        const updatedSeats = selectedSeats.filter(
          (s) => s.seatId !== seat.seatId
        );
        setSelectedSeats(updatedSeats);
        selectedSeatsRef.current = updatedSeats;
        onSeatSelect(updatedSeats);
      } catch (error) {
        console.error("Failed to unlock seat:", error);
      }
      return;
    }

    // CASE 2: CHỌN MỚI (LOCK)

    // Validate số lượng
    const selectedNormalSeats = selectedSeats.filter(
      (s) => s.type !== "COUPLE"
    ).length;
    const selectedCoupleSeats = selectedSeats.filter(
      (s) => s.type === "COUPLE"
    ).length;

    if (isCoupleSeat) {
      if (ticketCounts.coupleCount === 0)
        return Swal.fire(
          "Chưa chọn vé đôi",
          "Vui lòng chọn vé đôi trước!",
          "warning"
        );
      if (selectedCoupleSeats >= ticketCounts.coupleCount)
        return Swal.fire(
          "Đã đủ ghế đôi",
          `Bạn chỉ mua ${ticketCounts.coupleCount} vé đôi!`,
          "warning"
        );
    } else {
      if (ticketCounts.normalCount === 0)
        return Swal.fire(
          "Chưa chọn vé đơn",
          "Vui lòng chọn vé đơn trước!",
          "warning"
        );
      if (selectedNormalSeats >= ticketCounts.normalCount)
        return Swal.fire(
          "Đã đủ ghế đơn",
          `Bạn chỉ mua ${ticketCounts.normalCount} vé đơn!`,
          "warning"
        );
    }

    try {
      // Xác định loại vé cho ghế này
      let ticketType: "ADULT" | "CHILD" | "STUDENT" = "ADULT";
      const ticketEntries = Object.entries(selectedTickets);
      if (ticketEntries.length > 0) {
        // Lấy tạm loại vé đầu tiên tìm thấy để lock (Backend có thể validate lại sau)
        const firstTicket = ticketEntries[0][0].split("-")[1] as any;
        ticketType = firstTicket;
      }

      // GỌI API LOCK
      const lockResponse = await seatLockService.lockSingleSeat({
        ...identity, // Spread userId & guestSessionId vào đây
        showtimeId,
        selectedSeat: {
          seatId: seat.seatId,
          seatType: seat.type,
          ticketType,
        },
      });

      if (lockResponse.status === "LOCKED") {
        const updatedSeats = [...selectedSeats, seat];
        setSelectedSeats(updatedSeats);
        selectedSeatsRef.current = updatedSeats;
        onSeatSelect(updatedSeats);
        if (onSeatLock) onSeatLock(lockResponse.ttl ?? null);
      } else if (lockResponse.status === "ALREADY_LOCKED") {
        await Swal.fire(
          "Ghế đã được giữ",
          "Ghế này vừa được người khác chọn.",
          "warning"
        );
      }
    } catch (error) {
      console.error("Failed to lock seat:", error);
      await Swal.fire("Lỗi", "Không thể chọn ghế. Vui lòng thử lại!", "error");
    }
  };

  // === RENDER ===
  if (loading)
    return (
      <div className="flex justify-center py-10">
        <p className="text-white text-xl">Đang tải sơ đồ ghế...</p>
      </div>
    );
  if (seats.length === 0)
    return (
      <div className="flex justify-center py-10">
        <p className="text-white text-xl">Không có dữ liệu ghế.</p>
      </div>
    );

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
          const rowSeats = groupedSeats[row].sort(
            (a, b) =>
              parseInt(a.seatNumber.substring(1)) -
              parseInt(b.seatNumber.substring(1))
          );
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
              <span className="absolute left-4 md:left-10 text-sm text-gray-300 font-semibold w-6 text-center">
                {row}
              </span>
              <div className="flex gap-4">
                {rowSeats.map((seat, index) => {
                  const isSelected = selectedSeats.some(
                    (s) => s.seatId === seat.seatId
                  );
                  const isBooked = seat.status === "BOOKED";
                  const isLocked = seat.status === "LOCKED";
                  const isCouple = seat.type === "COUPLE";
                  const isVip = seat.type === "VIP";

                  const currentCol = parseInt(seat.seatNumber.substring(1));
                  const prevSeat = index > 0 ? rowSeats[index - 1] : null;
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
                  const colGap = currentCol - prevCol - 1;
                  const gapSpacers = colGap > 0 ? Array(colGap).fill(null) : [];

                  let colorClass = "";
                  if (isBooked) {
                    colorClass =
                      "cursor-not-allowed " +
                      (!isCouple ? "bg-gray-600 text-gray-300" : "");
                  } else if (isLocked) {
                    colorClass =
                      "cursor-not-allowed opacity-70 " +
                      (!isCouple ? "bg-orange-500 text-white" : "");
                  } else if (isSelected) {
                    colorClass =
                      "cursor-pointer " +
                      (!isCouple ? "bg-yellow-400 text-black" : "scale-105");
                  } else {
                    if (isVip)
                      colorClass =
                        "bg-purple-500 text-white hover:bg-purple-400 cursor-pointer";
                    else
                      colorClass = isCouple
                        ? "cursor-pointer hover:scale-105"
                        : "bg-white text-black hover:bg-yellow-200 cursor-pointer";
                  }

                  const containerClasses =
                    "h-10 flex items-center justify-center transition-all duration-200 select-none";
                  const widthClass = isCouple ? "w-24" : "w-10 rounded-md";

                  return (
                    <React.Fragment key={seat.seatId}>
                      {gapSpacers.map((_, idx) => (
                        <div
                          key={`gap-${row}-${prevCol + idx + 1}`}
                          className="w-10 h-10"
                        />
                      ))}
                      <div
                        onClick={() => toggleSeat(seat)}
                        className={`${containerClasses} ${widthClass} ${colorClass} ${!isCouple ? "font-semibold text-[10px]" : ""}`}
                      >
                        {isCouple ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 64 40"
                            fill="currentColor"
                            preserveAspectRatio="none"
                            className={`h-full w-16 transition-colors ${isBooked ? "text-gray-300" : isLocked ? "text-orange-500 opacity-70" : isSelected ? "text-yellow-400" : "text-white hover:text-yellow-200"}`}
                          >
                            <path d="M8 0 L26 0 L32 6 L38 0 L56 0 A8 8 0 0 1 64 8 L64 32 A8 8 0 0 1 56 40 L38 40 L32 34 L26 40 L8 40 A8 8 0 0 1 0 32 L0 8 A8 8 0 0 1 8 0 Z" />
                            <text
                              x="50%"
                              y="55%"
                              dominantBaseline="middle"
                              textAnchor="middle"
                              fill={isBooked ? "#6b7280" : "#000000"}
                              style={{ fontSize: "10px", fontWeight: 600 }}
                            >
                              {seat.seatNumber}
                            </text>
                          </svg>
                        ) : (
                          seat.seatNumber
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
                {endSpacers.map((_, idx) => (
                  <div key={`end-gap-${row}-${idx}`} className="w-10 h-10" />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chú thích */}
      <div className="flex gap-4 mt-8 text-sm flex-wrap justify-center text-white pt-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md bg-white border border-gray-300" />
          <span>Ghế thường</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md bg-purple-500" />
          <span>Ghế VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-10 flex items-center justify-center">
            <svg
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
          <div className="w-10 h-10 rounded-md bg-yellow-400" />
          <span>Ghế chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md bg-orange-500 opacity-70" />
          <span>Đang giữ chỗ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md bg-gray-600" />
          <span>Đã đặt</span>
        </div>
      </div>
    </div>
  );
};

export default SelectSeat;
