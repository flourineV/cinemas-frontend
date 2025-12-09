import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import "dayjs/locale/vi";

// Services & Components
import { showtimeService } from "@/services/showtime/showtimeService";
import { provinceService } from "@/services/showtime/provinceService";
import { bookingService } from "@/services/booking/booking.service";
import { seatLockService } from "@/services/showtime/seatLockService";
import { CustomSelect } from "@/components/ui/CustomSelect";
import SelectSeat from "@/components/booking/SelectSeat";
import SelectTicket from "@/components/booking/SelectTicket";
import BookingSummaryBar from "@/components/booking/BookingSummaryBar";

// Context & Hooks
import { useGuestSessionContext } from "@/contexts/GuestSessionContext";
import { useSeatLockWebSocket } from "@/hooks/useSeatLockWebSocket";

// Types
import type {
  ShowtimeResponse,
  TheaterShowtimesResponse,
} from "@/types/showtime/showtime.type";
import type { ProvinceResponse } from "@/types/showtime/province.type";
import type { SeatLockResponse } from "@/types/showtime/seatlock.type";
import type { ShowtimeSeatResponse } from "@/types/showtime/showtimeSeat.type";
import type {
  CreateBookingRequest,
  SeatSelectionDetail,
} from "@/types/booking/booking.type";

dayjs.locale("vi");

interface MovieShowtimeProps {
  movieId: string;
  movieTitle: string;
  movieStatus?: "NOW_PLAYING" | "UPCOMING" | "ARCHIVED";
  onSelectShowtime?: (showtime: ShowtimeResponse) => void;
}

const MovieShowtime: React.FC<MovieShowtimeProps> = ({
  movieId,
  movieTitle,
  movieStatus = "NOW_PLAYING",
  onSelectShowtime,
}) => {
  const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedShowtime, setSelectedShowtime] =
    useState<ShowtimeResponse | null>(null);
  const [theaterShowtimes, setTheaterShowtimes] = useState<
    TheaterShowtimesResponse[]
  >([]);

  const ticketSectionRef = useRef<HTMLDivElement>(null);
  const seatSectionRef = useRef<HTMLDivElement>(null);

  const [selectedTickets, setSelectedTickets] = useState<
    Record<string, number>
  >({});
  const [selectedSeats, setSelectedSeats] = useState<ShowtimeSeatResponse[]>(
    []
  );
  const [totalPrice, setTotalPrice] = useState(0);
  const [seatLockTTL, setSeatLockTTL] = useState<number | null>(null);

  const { guestSessionId, isLoggedIn } = useGuestSessionContext();
  const navigate = useNavigate();

  // --- WebSocket & TTL Logic ---
  const handleSeatLockUpdate = useCallback((data: SeatLockResponse) => {
    if (data.status === "LOCKED" && data.ttl > 0) {
      setSeatLockTTL(data.ttl);
    }
  }, []);

  const handleTTLExpired = async () => {
    await Swal.fire({
      icon: "warning",
      title: "Hết thời gian giữ ghế",
      text: "Vui lòng chọn lại ghế!",
      confirmButtonColor: "#eab308",
      background: "#18181b", // zinc-900
      color: "#fff",
    });
    setSelectedSeats([]);
    setSeatLockTTL(null);
  };

  useSeatLockWebSocket({
    showtimeId: selectedShowtime?.id || null,
    onSeatLockUpdate: handleSeatLockUpdate,
    enabled: !!selectedShowtime,
  });

  // --- Scroll to top on mount ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await provinceService.getAllProvinces();
        setProvinces(res);
        if (res.length > 0) setSelectedProvinceId(res[0].id);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchTheaterShowtimes = async () => {
      if (!selectedProvinceId) return;
      try {
        setLoading(true);
        const data =
          await showtimeService.getTheaterShowtimesByMovieAndProvince(
            movieId,
            selectedProvinceId
          );
        setTheaterShowtimes(data);
      } catch (error) {
        console.error("Error fetching theater showtimes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTheaterShowtimes();
  }, [movieId, selectedProvinceId]);

  // --- Date Handling ---
  const getFixedDates = () => {
    const dates = [];
    for (let i = 0; i < 5; i++)
      dates.push(dayjs().add(i, "day").format("YYYY-MM-DD"));
    return dates;
  };
  const fixedDates = getFixedDates();

  useEffect(() => {
    if (!selectedDate && movieStatus === "NOW_PLAYING") {
      setSelectedDate(fixedDates[0]);
    }
  }, []);

  const getTheaterShowtimesByDate = () => {
    if (!selectedDate) return [];
    return theaterShowtimes.map((theater) => ({
      ...theater,
      showtimes: theater.showtimes.filter(
        (st) => dayjs(st.startTime).format("YYYY-MM-DD") === selectedDate
      ),
    }));
  };
  const theaterShowtimesForDate = getTheaterShowtimesByDate();

  // --- UI Effects & Reset khi chọn showtime mới ---
  const prevShowtimeRef = useRef<ShowtimeResponse | null>(null);

  useEffect(() => {
    const unlockAndReset = async () => {
      // Nếu có showtime cũ và đang có ghế được chọn, unlock trước
      if (
        prevShowtimeRef.current &&
        selectedSeats.length > 0 &&
        prevShowtimeRef.current.id !== selectedShowtime?.id
      ) {
        try {
          await seatLockService.releaseSeats({
            showtimeId: prevShowtimeRef.current.id,
            seatIds: selectedSeats.map((s) => s.seatId),
            reason: "Showtime changed",
          });
        } catch (error) {
          console.error("Error unlocking seats when changing showtime:", error);
        }
      }

      // Reset state khi chọn showtime mới
      if (
        selectedShowtime &&
        prevShowtimeRef.current?.id !== selectedShowtime.id
      ) {
        setSelectedTickets({});
        setSelectedSeats([]);
        setTotalPrice(0);
        setSeatLockTTL(null);

        // Scroll đến phần chọn vé
        if (ticketSectionRef.current) {
          ticketSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }

      // Cập nhật ref
      prevShowtimeRef.current = selectedShowtime;
    };

    unlockAndReset();
  }, [selectedShowtime]);

  // Unlock ghế khi chuyển tỉnh/rạp
  useEffect(() => {
    const unlockSeats = async () => {
      if (selectedSeats.length > 0 && selectedShowtime) {
        try {
          await seatLockService.releaseSeats({
            showtimeId: selectedShowtime.id,
            seatIds: selectedSeats.map((s) => s.seatId),
            reason: "Province changed",
          });
        } catch (error) {
          console.error("Error unlocking seats:", error);
        }
      }
    };

    unlockSeats();
    setSelectedShowtime(null);
    setSelectedTickets({});
    setSelectedSeats([]);
    setTotalPrice(0);
    setSeatLockTTL(null);
  }, [selectedProvinceId]);

  // Unlock ghế khi chuyển ngày
  useEffect(() => {
    const unlockSeats = async () => {
      if (selectedSeats.length > 0 && selectedShowtime) {
        try {
          await seatLockService.releaseSeats({
            showtimeId: selectedShowtime.id,
            seatIds: selectedSeats.map((s) => s.seatId),
            reason: "Date changed",
          });
        } catch (error) {
          console.error("Error unlocking seats:", error);
        }
      }
    };

    unlockSeats();
    setSelectedShowtime(null);
    setSelectedTickets({});
    setSelectedSeats([]);
    setTotalPrice(0);
    setSeatLockTTL(null);
  }, [selectedDate]);

  useEffect(() => {
    const calculateTotal = async () => {
      try {
        const { pricingService } = await import(
          "@/services/pricing/pricingService"
        );
        const allPrices = await pricingService.getAllSeatPrices();

        // Tạo queue cho từng loại ghế
        const ticketQueues: Record<string, string[]> = {};
        Object.entries(selectedTickets).forEach(([key, count]) => {
          const parts = key.split("-");
          const seatType = parts[0];
          const ticketType = parts.slice(1).join("-");
          ticketQueues[seatType] = ticketQueues[seatType] || [];
          for (let i = 0; i < count; i++)
            ticketQueues[seatType].push(ticketType);
        });

        let total = 0;

        // Tính giá dựa trên ghế đã chọn
        selectedSeats.forEach((seat) => {
          const seatType = seat.type ?? "NORMAL";
          const queue = ticketQueues[seatType] || [];
          const ticketType = queue.length ? queue.shift()! : "ADULT";

          // Tìm giá tương ứng với loại ghế và loại vé
          const price = allPrices.find(
            (p) => p.seatType === seatType && p.ticketType === ticketType
          );

          if (price) {
            total += Number(price.basePrice);
          }
        });

        setTotalPrice(total);
      } catch (error) {
        console.error(error);
      }
    };
    calculateTotal();
  }, [selectedTickets, selectedSeats]);

  useEffect(() => {
    const totalTickets = Object.values(selectedTickets).reduce(
      (a, b) => a + b,
      0
    );
    if (totalTickets > 0 && seatSectionRef.current) {
      // Debounce: chỉ scroll sau khi người dùng dừng thao tác 3.5 giây
      const timeoutId = setTimeout(() => {
        seatSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 3500);

      // Cleanup: hủy timeout cũ nếu selectedTickets thay đổi lại
      return () => clearTimeout(timeoutId);
    }
  }, [selectedTickets]);

  // === LOGIC XỬ LÝ SUBMIT (ĐẶT VÉ) ===
  const prepareBookingRequest = (): CreateBookingRequest => {
    const ticketQueues: Record<string, string[]> = {};
    Object.entries(selectedTickets).forEach(([key, count]) => {
      const parts = key.split("-");
      const seatType = parts[0];
      const ticketType = parts.slice(1).join("-");
      ticketQueues[seatType] = ticketQueues[seatType] || [];
      for (let i = 0; i < count; i++) ticketQueues[seatType].push(ticketType);
    });

    const seatDetails: SeatSelectionDetail[] = selectedSeats.map((seat) => {
      const sType = seat.type ?? "NORMAL";
      const queue = ticketQueues[sType] || [];
      const ticketType = queue.length ? queue.shift()! : "ADULT";

      return {
        seatId: seat.seatId,
        seatType: sType,
        ticketType,
      };
    });

    return {
      showtimeId: selectedShowtime!.id,
      selectedSeats: seatDetails,
      guestSessionId: !isLoggedIn ? guestSessionId : undefined,
    };
  };

  const handleSubmitBooking = async () => {
    if (!selectedShowtime) return alert("Bạn chưa chọn lịch chiếu!");
    if (selectedSeats.length === 0) return alert("Bạn chưa chọn ghế!");

    const totalTickets = Object.values(selectedTickets).reduce(
      (a, b) => a + b,
      0
    );
    if (totalTickets === 0) return alert("Bạn chưa chọn loại vé!");
    if (totalTickets !== selectedSeats.length)
      return Swal.fire("Lỗi", "Số lượng vé và ghế không khớp!", "error");

    let userIdFromStorage = null;
    try {
      const authStorageStr = localStorage.getItem("auth-storage");
      if (authStorageStr) {
        const parsed = JSON.parse(authStorageStr);
        userIdFromStorage = parsed?.state?.user?.id;
      }
    } catch (e) {
      console.error("Lỗi parse auth-storage:", e);
    }

    const baseRequest = prepareBookingRequest();

    try {
      if (userIdFromStorage) {
        Swal.fire({
          title: "Đang khởi tạo vé...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
          background: "#18181b",
          color: "#fff",
        });

        const booking = await bookingService.createBooking({
          ...baseRequest,
          userId: userIdFromStorage,
          guestSessionId: undefined,
        });

        Swal.close();
        navigate("/checkout", {
          state: {
            booking: {
              ...booking,
              movieTitle,
              showtime: selectedShowtime,
              seats: selectedSeats,
            },
            ttl: seatLockTTL,
            ttlTimestamp: Date.now(),
          },
        });
      } else {
        const pendingData = {
          requestData: baseRequest,
          movieTitle,
          showtime: selectedShowtime,
          totalPrice,
          seats: selectedSeats,
          tickets: selectedTickets,
          ttl: seatLockTTL,
          ttlTimestamp: Date.now(),
        };
        navigate("/checkout", { state: { pendingData } });
      }
    } catch (error) {
      console.error("Lỗi process booking:", error);
      Swal.fire({
        title: "Lỗi",
        text: "Không thể tạo đơn hàng. Vui lòng thử lại.",
        icon: "error",
        background: "#18181b",
        color: "#fff",
      });
    }
  };

  if (movieStatus === "UPCOMING" && theaterShowtimes.length === 0 && !loading) {
    return (
      <div className="p-6 pt-16 text-center text-zinc-400 text-xl italic">
        Hiện chưa có lịch chiếu cho phim này.
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-10 rounded-2xl"
      >
        <h2 className="text-4xl md:text-4xl font-extrabold mb-10 -mt-14 text-center text-black tracking-wide uppercase">
          Lịch Chiếu <span className="text-yellow-500">Phim</span>
        </h2>

        {/* --- Date Tabs (Đã chỉnh màu tối) --- */}
        {movieStatus === "NOW_PLAYING" && (
          <div className="flex justify-center gap-3 md:gap-4 mb-10 flex-wrap px-2">
            {fixedDates.map((date) => {
              const dateObj = dayjs(date);
              const isSelected = date === selectedDate;
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-5 py-3 rounded-xl transition-all duration-300 border ${
                    isSelected
                      ? "bg-yellow-500 border-zinc-800 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                      : "bg-white border-zinc-800 text-zinc-800 hover:border-zinc-600 hover:bg-yellow-500"
                  }`}
                >
                  <div className="text-xl font-bold leading-none mb-1">
                    {dateObj.format("DD/MM")}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wider">
                    {dateObj.isSame(dayjs(), "day")
                      ? "Hôm nay"
                      : dateObj.format("dddd")}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* --- Filter & List Header --- */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 max-w-5xl pt-4 md:px-10">
          <span className="text-black font-bold text-2xl border-l-4 border-yellow-500 pl-3">
            DANH SÁCH RẠP
          </span>
          {provinces.length > 0 && (
            <div className="w-full md:w-[260px] -mr-24">
              <CustomSelect
                options={provinces.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
                value={selectedProvinceId}
                onChange={setSelectedProvinceId}
                placeholder="Chọn tỉnh/thành phố"
                variant="dark"
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <div className="rounded-xl max-w-6xl mx-auto mb-16 space-y-4 px-4 md:px-10">
            {theaterShowtimesForDate.length === 0 ? (
              <div className="text-zinc-500 text-center py-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
                <p>Chưa có suất chiếu nào tại khu vực này.</p>
              </div>
            ) : (
              theaterShowtimesForDate.map((theater, idx) => (
                <motion.div
                  key={theater.theaterId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  // --- CARD RẠP (Tông vàng) ---
                  className="bg-yellow-500 border border-zinc-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="mb-4 border-b border-zinc-800 pb-4">
                    <h3 className="text-xl md:text-2xl font-bold text-black mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-black inline-block"></span>
                      {theater.theaterName}
                    </h3>
                    <p className="text-gray-800 text-sm ml-4">
                      {theater.theaterAddress}
                    </p>
                  </div>

                  <div>
                    {theater.showtimes.length === 0 ? (
                      <p className="text-gray-700 italic text-sm ml-4">
                        Hết suất chiếu hôm nay
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {theater.showtimes
                          .filter((st) => dayjs(st.startTime).isAfter(dayjs()))
                          .sort((a, b) =>
                            dayjs(a.startTime).diff(dayjs(b.startTime))
                          )
                          .map((st) => {
                            const isSelected =
                              selectedShowtime?.id === st.showtimeId;
                            return (
                              <button
                                key={st.showtimeId}
                                onClick={() => {
                                  const res: ShowtimeResponse = {
                                    id: st.showtimeId,
                                    movieId,
                                    theaterName: theater.theaterName,
                                    roomId: st.roomId,
                                    roomName: st.roomName,
                                    startTime: st.startTime,
                                    endTime: st.endTime,
                                  };
                                  setSelectedShowtime(res);
                                  onSelectShowtime?.(res);
                                }}
                                // --- NÚT GIỜ CHIẾU ---
                                className={`px-4 py-2 rounded-lg font-bold text-md transition-all duration-200 border ${
                                  isSelected
                                    ? "bg-black text-yellow-500 border-black shadow-lg transform scale-105"
                                    : "bg-transparent text-black border-black hover:bg-black hover:text-yellow-500"
                                }`}
                              >
                                {dayjs(st.startTime).format("HH:mm")}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Booking Sections */}
        {selectedShowtime && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-10 max-w-5xl mx-auto px-4"
          >
            <div className="pt-10">
              <h2
                ref={ticketSectionRef}
                className="text-4xl font-extrabold mb-8 text-center text-gray-800 scroll-mt-24 uppercase"
              >
                Chọn loại <span className="text-yellow-500">Vé</span>
              </h2>

              <SelectTicket
                seatType="NORMAL"
                onTicketChange={setSelectedTickets}
                selectedSeats={selectedSeats.map((s) => s.seatId)}
              />
            </div>

            <div className="mt-16 pb-36">
              {/* Header Container: Xếp dọc và căn giữa */}
              <div
                ref={seatSectionRef}
                className="flex flex-col items-center justify-center gap-4 mb-2 scroll-mt-24"
              >
                {/* Dòng 1: Tiêu đề */}
                <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-800 uppercase tracking-wide">
                  Sơ đồ <span className="text-yellow-500">Ghế</span>
                </h2>

                {/* Dòng 2: Tên phòng (Style Badge tối giản) */}
                <div className="flex items-center gap-2 px-5 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span className="text-zinc-800 font-medium text-md uppercase tracking-wider">
                    {selectedShowtime.roomName}
                  </span>
                </div>
              </div>

              {/* Vùng chọn ghế */}
              <div className="relative">
                <SelectSeat
                  showtimeId={selectedShowtime.id}
                  onSeatSelect={setSelectedSeats}
                  selectedTickets={selectedTickets}
                  onSeatLock={setSeatLockTTL}
                />
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* BookingSummaryBar */}
      <BookingSummaryBar
        movieTitle={movieTitle}
        cinemaName={`${selectedShowtime?.theaterName || ""} (${
          provinces.find((p) => p.id === selectedProvinceId)?.name || ""
        })`}
        totalPrice={totalPrice}
        ttl={seatLockTTL}
        isVisible={!!selectedShowtime}
        onSubmit={handleSubmitBooking}
        onTTLExpired={handleTTLExpired}
      />
    </>
  );
};

export default MovieShowtime;
