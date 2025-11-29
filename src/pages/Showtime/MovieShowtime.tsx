import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import "dayjs/locale/vi";

// Services & Components
import { showtimeService } from "@/services/showtime/showtimeService";
import { provinceService } from "@/services/showtime/provinceService";
import { bookingService } from "@/services/booking/bookingService";
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
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
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
    });
    setSelectedSeats([]);
    setSeatLockTTL(null);
  };

  useSeatLockWebSocket({
    showtimeId: selectedShowtime?.id || null,
    onSeatLockUpdate: handleSeatLockUpdate,
    enabled: !!selectedShowtime,
  });

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

  // --- UI Effects ---
  useEffect(() => {
    if (selectedShowtime && ticketSectionRef.current) {
      ticketSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedShowtime]);

  useEffect(() => {
    setSelectedShowtime(null);
    setSelectedTickets({});
    setSelectedSeats([]);
    setTotalPrice(0);
  }, [selectedProvinceId]);

  useEffect(() => {
    const calculateTotal = async () => {
      try {
        const { pricingService } = await import(
          "@/services/pricing/pricingService"
        );
        const allPrices = await pricingService.getAllSeatPrices();
        let total = 0;
        Object.entries(selectedTickets).forEach(([key, count]) => {
          const [seatType, ticketType] = key.split("-");
          const price = allPrices.find(
            (p) => p.seatType === seatType && p.ticketType === ticketType
          );
          if (price) total += Number(price.basePrice) * count;
        });
        setTotalPrice(total);
      } catch (error) {
        console.error(error);
      }
    };
    calculateTotal();
  }, [selectedTickets]);

  useEffect(() => {
    const totalTickets = Object.values(selectedTickets).reduce(
      (a, b) => a + b,
      0
    );
    if (totalTickets > 0 && seatSectionRef.current) {
      setTimeout(() => {
        seatSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 2000);
    }
  }, [selectedTickets]);

  // === LOGIC XỬ LÝ SUBMIT (ĐẶT VÉ) ===
  const prepareBookingRequest = (): CreateBookingRequest => {
    const seatDetails: SeatSelectionDetail[] = [];
    const ticketTypeIds: string[] = [];

    // Map loại vé từ key (Format key: "SEAT_TYPE-TICKET_ID")
    Object.entries(selectedTickets).forEach(([key, count]) => {
      const parts = key.split("-");
      const ticketTypeId = parts[parts.length - 1];
      for (let i = 0; i < count; i++) {
        ticketTypeIds.push(ticketTypeId);
      }
    });

    // Map từng ghế với loại vé
    selectedSeats.forEach((seatId, index) => {
      seatDetails.push({
        seatId: seatId,
        ticketTypeId: ticketTypeIds[index] || undefined,
      });
    });

    return {
      showtimeId: selectedShowtime!.id,
      selectedSeats: seatDetails,
      guestSessionId: !isLoggedIn ? guestSessionId : undefined,
    };
  };

  const handleSubmitBooking = async () => {
    // 1. Validate cơ bản
    if (!selectedShowtime) return alert("Bạn chưa chọn lịch chiếu!");
    if (selectedSeats.length === 0) return alert("Bạn chưa chọn ghế!");

    const totalTickets = Object.values(selectedTickets).reduce(
      (a, b) => a + b,
      0
    );
    if (totalTickets === 0) return alert("Bạn chưa chọn loại vé!");
    if (totalTickets !== selectedSeats.length)
      return Swal.fire("Lỗi", "Số lượng vé và ghế không khớp!", "error");

    // 2. CHỦ ĐỘNG KIỂM TRA LOCAL STORAGE (Bỏ qua Context)
    let userIdFromStorage = null;
    try {
      const authStorageStr = localStorage.getItem("auth-storage");
      if (authStorageStr) {
        const parsed = JSON.parse(authStorageStr);
        // Cấu trúc Zustand Persist: { state: { user: { id: "..." } } }
        userIdFromStorage = parsed?.state?.user?.id;
      }
    } catch (e) {
      console.error("Lỗi parse auth-storage:", e);
    }

    console.log("🆔 [Check Login] UserID found:", userIdFromStorage);

    const baseRequest = prepareBookingRequest();

    try {
      // 3. SỬA ĐIỀU KIỆN IF: Chỉ cần có userId trong storage là chạy luồng User
      if (userIdFromStorage) {
        // === LUỒNG USER: GỌI API NGAY ===
        Swal.fire({
          title: "Đang khởi tạo vé...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        // Gọi API tạo Booking
        const booking = await bookingService.createBooking({
          ...baseRequest,
          userId: userIdFromStorage, // Dùng ID vừa lấy được
          guestSessionId: undefined, // Đảm bảo không gửi guestSessionId
        });

        Swal.close();

        // Chuyển trang & mang theo Booking ID
        navigate("/checkout", {
          state: { booking, ttl: seatLockTTL, ttlTimestamp: Date.now() },
        });
      } else {
        // === LUỒNG KHÁCH: CHUYỂN TRANG ĐIỀN THÔNG TIN ===
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
      Swal.fire("Lỗi", "Không thể tạo đơn hàng. Vui lòng thử lại.", "error");
    }
  };

  if (movieStatus === "UPCOMING" && theaterShowtimes.length === 0 && !loading) {
    return (
      <div className="p-6 pt-16 text-center text-white text-xl">
        Hiện chưa có lịch chiếu.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-16 rounded-2xl shadow-md"
    >
      <h2 className="text-4xl font-extrabold mb-14 text-center text-yellow-300">
        LỊCH CHIẾU
      </h2>

      {/* Date Tabs */}
      {movieStatus === "NOW_PLAYING" && (
        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          {fixedDates.map((date) => {
            const dateObj = dayjs(date);
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-6 py-3 rounded-md text-lg font-semibold transition-colors ${
                  date === selectedDate
                    ? "bg-yellow-300 text-black"
                    : "border border-yellow-100/80 text-yellow-400 hover:bg-yellow-300 hover:text-black"
                }`}
              >
                <div className="text-xl font-bold">
                  {dateObj.format("DD/MM")}
                </div>
                <div className="text-sm">
                  {dateObj.isSame(dayjs(), "day")
                    ? "Hôm nay"
                    : dateObj.format("dddd")}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter & List */}
      <div className="flex items-center justify-between mb-4 max-w-6xl mx-auto pt-10">
        <span className="text-yellow-300 font-extrabold text-3xl">
          DANH SÁCH RẠP
        </span>
        {provinces.length > 0 && (
          <div className="min-w-[220px]">
            <CustomSelect
              options={provinces.map((p) => ({ value: p.id, label: p.name }))}
              value={selectedProvinceId}
              onChange={setSelectedProvinceId}
              placeholder="Chọn tỉnh/thành phố"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
        </div>
      ) : (
        <div className="rounded-xl pt-10 shadow-lg max-w-6xl mx-auto mb-8">
          {theaterShowtimesForDate.length === 0 ? (
            <p className="text-white text-center">
              Chưa có rạp chiếu tại khu vực này.
            </p>
          ) : (
            theaterShowtimesForDate.map((theater, idx) => (
              <motion.div
                key={theater.theaterId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-yellow-900/50 border border-yellow-600/30 pt-7 pl-10 pb-5 shadow-inner"
              >
                <h3 className="text-2xl font-extrabold text-yellow-300 mb-1">
                  {theater.theaterName}
                </h3>
                <p className="text-white text-md mb-3 mt-4">
                  {theater.theaterAddress}
                </p>
                <div className="mb-4 pt-3">
                  {theater.showtimes.length === 0 ? (
                    <p className="text-gray-400 italic">Chưa có lịch chiếu</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {theater.showtimes
                        .filter((st) => dayjs(st.startTime).isAfter(dayjs()))
                        .sort((a, b) =>
                          dayjs(a.startTime).diff(dayjs(b.startTime))
                        )
                        .map((st) => (
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
                            className={`px-4 py-2 rounded-md border transition-colors ${selectedShowtime?.id === st.showtimeId ? "bg-yellow-400 text-black border-yellow-400" : "text-white border-white hover:bg-yellow-400 hover:text-black"}`}
                          >
                            {dayjs(st.startTime).format("HH:mm")}
                          </button>
                        ))}
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
          className="mt-24 max-w-6xl mx-auto"
        >
          <h2
            ref={ticketSectionRef}
            className="text-4xl font-extrabold mb-6 text-center text-yellow-300 scroll-mt-24"
          >
            CHỌN LOẠI VÉ
          </h2>
          <div className="pt-10">
            <SelectTicket
              seatType="NORMAL"
              onTicketChange={setSelectedTickets}
              selectedSeats={selectedSeats}
            />
          </div>

          <h2
            ref={seatSectionRef}
            className="text-4xl font-extrabold mb-6 mt-12 text-center text-yellow-300 pt-20"
          >
            CHỌN GHẾ
          </h2>
          <p className="text-2xl text-yellow-200 font-light text-center">
            {selectedShowtime.roomName}
          </p>
          <div className="pt-10 pb-36">
            <SelectSeat
              showtimeId={selectedShowtime.id}
              onSeatSelect={setSelectedSeats}
              selectedTickets={selectedTickets}
              onSeatLock={setSeatLockTTL}
            />
          </div>
        </motion.div>
      )}

      <BookingSummaryBar
        movieTitle={movieTitle}
        cinemaName={`${selectedShowtime?.theaterName || ""} (${provinces.find((p) => p.id === selectedProvinceId)?.name || ""})`}
        totalPrice={totalPrice}
        ttl={seatLockTTL}
        isVisible={!!selectedShowtime}
        onSubmit={handleSubmitBooking}
        onTTLExpired={handleTTLExpired}
      />
    </motion.div>
  );
};

export default MovieShowtime;
