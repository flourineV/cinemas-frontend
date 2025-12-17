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
import { ArrowRight } from "lucide-react";

interface SelectSeatProps {
  showtimeId: string;
  // trước: onSeatSelect: (seatIds: string[]) => void;
  onSeatSelect: (seats: ShowtimeSeatResponse[]) => void;
  selectedTickets: Record<string, number>;
  onSeatLock?: (ttl: number | null) => void;
  shouldUnlockOnUnmount?: boolean; // Control việc unlock khi unmount
}

const SelectSeat: React.FC<SelectSeatProps> = ({
  showtimeId,
  onSeatSelect,
  selectedTickets,
  onSeatLock,
  shouldUnlockOnUnmount = true, // Default true để giữ behavior cũ
}) => {
  const [seats, setSeats] = useState<ShowtimeSeatResponse[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<ShowtimeSeatResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Vẫn lấy context để dùng fallback cho trường hợp Guest thật
  const { getUserOrGuestId } = useGuestSessionContext();

  const selectedSeatsRef = useRef<ShowtimeSeatResponse[]>(selectedSeats);
  const manualUnlockRef = useRef<Set<string>>(new Set()); // Track ghế unlock bằng tay

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
          // Kiểm tra xem có phải unlock bằng tay không
          const isManualUnlock = manualUnlockRef.current.has(payload.seatId);

          if (isManualUnlock) {
            // Unlock bằng tay - không hiện alert, chỉ xóa khỏi tracking
            manualUnlockRef.current.delete(payload.seatId);
          } else {
            // Expire hoặc bị chiếm - hiện alert và reset TẤT CẢ ghế
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
      }
    };

    const unsubscribe = websocketService.subscribeSeatLock(showtimeId, handler);
    return () => {
      unsubscribe();
    };
  }, [showtimeId, onSeatSelect, onSeatLock]);

  // === CLEANUP: Unlock ghế khi unmount hoặc reload ===
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (selectedSeatsRef.current.length > 0) {
        // Hiển thị browser confirmation dialog
        e.preventDefault();
        e.returnValue = "Bạn đang giữ ghế. Reload sẽ mất chỗ ngồi đã chọn!";

        const identity = getSafeIdentity();
        const seatIds = selectedSeatsRef.current.map((s) => s.seatId);

        console.log("[BEFOREUNLOAD] Attempting to unlock seats:", seatIds);
        console.log("[BEFOREUNLOAD] Identity:", identity);

        // Tạo URL với query params cho unlock-batch
        const baseUrl = `${import.meta.env.VITE_GATEWAY_URL}/showtimes/seat-lock/unlock-batch`;
        const params = new URLSearchParams({
          showtimeId: showtimeId,
          seatIds: seatIds.join(","),
        });

        if (identity.userId) {
          params.append("userId", identity.userId);
        }
        if (identity.guestSessionId) {
          params.append("guestSessionId", identity.guestSessionId);
        }

        const apiUrl = `${baseUrl}?${params.toString()}`;

        // Thử gửi request với fetch keepalive (backup cho sendBeacon)
        try {
          fetch(apiUrl, {
            method: "POST",
            keepalive: true, // Đảm bảo request không bị cancel khi trang đóng
            headers: {
              "Content-Type": "application/json",
            },
          }).catch(() => {
            // Ignore errors vì trang đang đóng
          });
        } catch (err) {
          console.error("Failed to send unlock request:", err);
        }

        // Fallback: cũng thử sendBeacon
        navigator.sendBeacon(
          apiUrl,
          new Blob([], { type: "application/json" })
        );

        return e.returnValue;
      }
    };

    // Đăng ký event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup khi component unmount (chuyển trang trong app)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Chỉ unlock ghế khi shouldUnlockOnUnmount = true
      if (selectedSeatsRef.current.length > 0 && shouldUnlockOnUnmount) {
        const identity = getSafeIdentity();
        console.log("[UNMOUNT] Unlocking seats due to component unmount");

        // Unlock từng ghế một khi unmount
        selectedSeatsRef.current.forEach((seat) => {
          seatLockService
            .unlockSingleSeat(
              showtimeId,
              seat.seatId,
              identity.userId,
              identity.guestSessionId
            )
            .catch((error) => {
              console.error(`Failed to unlock seat ${seat.seatId}:`, error);
            });
        });
      } else if (!shouldUnlockOnUnmount) {
        console.log(
          "[UNMOUNT] Keeping seats locked - shouldUnlockOnUnmount = false"
        );
      }
    };
  }, [showtimeId]);

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
    const isCurrentlySelected = selectedSeats.some(
      (s) => s.seatId === seat.seatId
    );

    // LẤY IDENTITY AN TOÀN TẠI THỜI ĐIỂM CLICK
    const identity = getSafeIdentity();

    // CASE 1: BỎ CHỌN (UNLOCK) - Cho phép bỏ chọn ghế mình đã chọn
    if (isCurrentlySelected) {
      try {
        // Đánh dấu là unlock bằng tay
        manualUnlockRef.current.add(seat.seatId);

        await seatLockService.unlockSingleSeat(
          showtimeId,
          seat.seatId,
          identity.userId,
          identity.guestSessionId
        );

        // Chỉ xóa ghế này, không reset tất cả
        const updatedSeats = selectedSeats.filter(
          (s) => s.seatId !== seat.seatId
        );
        setSelectedSeats(updatedSeats);
        selectedSeatsRef.current = updatedSeats;
        onSeatSelect(updatedSeats);
      } catch (error) {
        console.error("Failed to unlock seat:", error);
        manualUnlockRef.current.delete(seat.seatId);
      }
      return;
    }

    // Chặn ghế đã booked hoặc locked bởi người khác
    if (seat.status === "BOOKED" || seat.status === "LOCKED") return;

    const isCoupleSeat = seat.type === "COUPLE";

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
        return Swal.fire({
          title: "Chưa chọn vé đôi",
          text: "Vui lòng chọn vé đôi trước!",
          icon: "warning",
          scrollbarPadding: false,
        });
      if (selectedCoupleSeats >= ticketCounts.coupleCount)
        return Swal.fire({
          title: "Đã đủ ghế đôi",
          text: `Bạn chỉ mua ${ticketCounts.coupleCount} vé đôi!`,
          icon: "warning",
          scrollbarPadding: false,
        });
    } else {
      if (ticketCounts.normalCount === 0)
        return Swal.fire({
          title: "Chưa chọn vé đơn",
          text: "Vui lòng chọn vé đơn trước!",
          icon: "warning",
          scrollbarPadding: false,
        });
      if (selectedNormalSeats >= ticketCounts.normalCount)
        return Swal.fire({
          title: "Đã đủ ghế đơn",
          text: `Bạn chỉ mua ${ticketCounts.normalCount} vé đơn!`,
          icon: "warning",
          scrollbarPadding: false,
        });
    }

    try {
      // Optimistic update - Update UI immediately
      const updatedSeats = [...selectedSeats, seat];
      setSelectedSeats(updatedSeats);
      selectedSeatsRef.current = updatedSeats;
      onSeatSelect(updatedSeats);

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
        // API success - keep the optimistic update
        if (onSeatLock) onSeatLock(lockResponse.ttl ?? null);
      } else if (lockResponse.status === "ALREADY_LOCKED") {
        // Revert optimistic update
        const revertedSeats = selectedSeats.filter(
          (s) => s.seatId !== seat.seatId
        );
        setSelectedSeats(revertedSeats);
        selectedSeatsRef.current = revertedSeats;
        onSeatSelect(revertedSeats);

        await Swal.fire({
          title: "Ghế đã được giữ",
          text: "Ghế này vừa được người khác chọn.",
          icon: "warning",
          scrollbarPadding: false,
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      const revertedSeats = selectedSeats.filter(
        (s) => s.seatId !== seat.seatId
      );
      setSelectedSeats(revertedSeats);
      selectedSeatsRef.current = revertedSeats;
      onSeatSelect(revertedSeats);

      console.error("Failed to lock seat:", error);
      await Swal.fire({
        title: "Lỗi",
        text: "Không thể chọn ghế. Vui lòng thử lại!",
        icon: "error",
        scrollbarPadding: false,
      });
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
        {/* Mũi tên lối vào - bên trái màn hình */}
        <div className="absolute -left-12 top-2/3 -translate-y-1/2 -translate-x-full hidden lg:flex items-center gap-2 pr-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-zinc-600 text-xs font-medium uppercase tracking-wider whitespace-nowrap">
              Lối vào
            </span>
            <svg
              className="w-8 h-8 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
        </div>

        <svg
          viewBox="0 0 1000 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 0 80 Q 500 0 1000 80"
            fill="none"
            stroke="#27272a"
            strokeWidth="4"
          />
        </svg>
        <span className="absolute bottom-2 text-zinc-800 text-lg font-extrabold text-center w-full">
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
              <span className="absolute left-4 md:left-10 text-sm text-zinc-800 font-semibold w-6 text-center">
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
                  // PRIORITY 1: Ghế mình chọn (selectedSeats) - LUÔN VÀNG
                  if (isSelected) {
                    colorClass =
                      "cursor-pointer " +
                      (!isCouple
                        ? "bg-yellow-300 text-black font-bold border border-zinc-800"
                        : "scale-105");
                  }
                  // PRIORITY 2: Ghế đã booked
                  else if (isBooked) {
                    colorClass =
                      "cursor-not-allowed " +
                      (!isCouple ? "bg-gray-600 text-gray-300" : "");
                  }
                  // PRIORITY 3: Ghế bị lock bởi người khác
                  else if (isLocked) {
                    colorClass =
                      "cursor-not-allowed opacity-70 " +
                      (!isCouple ? "bg-orange-500 text-white" : "");
                  }
                  // PRIORITY 4: Ghế trống
                  else {
                    if (isVip)
                      colorClass =
                        "bg-purple-500 text-white hover:bg-purple-400 cursor-pointer";
                    else
                      colorClass = isCouple
                        ? "cursor-pointer hover:scale-105"
                        : "bg-white text-black hover:bg-yellow-300 cursor-pointer border border-zinc-800";
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
                            className={`h-full w-16 transition-colors ${
                              isSelected
                                ? "text-yellow-400"
                                : isBooked
                                  ? "text-gray-300"
                                  : isLocked
                                    ? "text-orange-500 opacity-70"
                                    : "text-white hover:text-yellow-200"
                            }`}
                          >
                            <path
                              d="M8 0 L26 0 L32 6 L38 0 L56 0 A8 8 0 0 1 64 8 L64 32 A8 8 0 0 1 56 40 L38 40 L32 34 L26 40 L8 40 A8 8 0 0 1 0 32 L0 8 A8 8 0 0 1 8 0 Z"
                              stroke="#27272a"
                              strokeWidth="1"
                            />
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
      <div className="flex gap-4 mt-8 text-sm flex-wrap justify-center text-zinc-800 pt-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md bg-white border border-zinc-800" />
          <span>Ghế thường</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md bg-purple-500 border border-zinc-800" />
          <span>Ghế VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-10 flex items-center justify-center">
            <svg
              viewBox="0 0 64 40"
              fill="currentColor"
              className="w-full h-full text-white"
            >
              <path
                d="M8 0 L26 0 L32 6 L38 0 L56 0 A8 8 0 0 1 64 8 L64 32 A8 8 0 0 1 56 40 L38 40 L32 34 L26 40 L8 40 A8 8 0 0 1 0 32 L0 8 A8 8 0 0 1 8 0 Z"
                stroke="#27272a"
                strokeWidth="0.8"
              />
            </svg>
          </div>
          <span>Ghế đôi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md bg-yellow-400 border border-zinc-800" />
          <span>Ghế chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md bg-orange-500 opacity-70 border border-zinc-800" />
          <span>Đang giữ chỗ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md bg-gray-600 border border-zinc-800" />
          <span>Đã đặt</span>
        </div>
      </div>
    </div>
  );
};

export default SelectSeat;
