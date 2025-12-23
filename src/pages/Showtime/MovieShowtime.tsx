import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import "dayjs/locale/en";

// Services & Components
import { showtimeService } from "@/services/showtime/showtimeService";
import { provinceService } from "@/services/showtime/provinceService";
import { bookingService } from "@/services/booking/booking.service";
import { seatLockService } from "@/services/showtime/seatLockService";
import CustomSelect from "@/components/ui/CustomSelect";
import SelectSeat from "@/components/booking/SelectSeat";
import SelectTicket from "@/components/booking/SelectTicket";
import BookingSummaryBar from "@/components/booking/BookingSummaryBar";

// Context & Hooks
import { useGuestSessionContext } from "@/contexts/GuestSessionContext";
import { useSeatLockWebSocket } from "@/hooks/useSeatLockWebSocket";
import { useLanguage } from "@/contexts/LanguageContext";

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
  preselectedShowtimeId?: string | null;
  preselectedShowtime?: ShowtimeResponse | null;
}

const MovieShowtime: React.FC<MovieShowtimeProps> = ({
  movieId,
  movieTitle,
  movieStatus = "NOW_PLAYING",
  onSelectShowtime,
  preselectedShowtimeId,
  preselectedShowtime,
}) => {
  const { t, language } = useLanguage();
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

  // Set dayjs locale based on language
  useEffect(() => {
    dayjs.locale(language === "en" ? "en" : "vi");
  }, [language]);

  const handleTTLExpired = async () => {
    await Swal.fire({
      icon: "warning",
      title: t("booking.seatExpired"),
      text: t("booking.seatExpiredText"),
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
        console.log("🌍 [MovieShowtime] Provinces loaded:", res);
        setProvinces(res);
        if (res.length > 0) {
          console.log("🌍 [MovieShowtime] Selected first province:", res[0]);
          setSelectedProvinceId(res[0].id);
        }
      } catch (error) {
        console.error("❌ [MovieShowtime] Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchTheaterShowtimes = async () => {
      if (!selectedProvinceId) return;

      console.log("🎬 [MovieShowtime] Fetching showtimes for:", {
        movieId,
        selectedProvinceId,
      });

      try {
        setLoading(true);
        const data =
          await showtimeService.getTheaterShowtimesByMovieAndProvince(
            movieId,
            selectedProvinceId
          );

        console.log("✅ [MovieShowtime] Raw API response:", data);

        // Transform data: Response from getTheaterShowtimesByMovieAndProvince
        let theaters: TheaterShowtimesResponse[] = [];

        if (Array.isArray(data)) {
          // Direct array of theaters
          theaters = data.map((theater: any) => ({
            theaterId: theater.theaterId,
            theaterName: theater.theaterName,
            theaterNameEn: theater.theaterNameEn,
            theaterAddress: theater.theaterAddress,
            theaterAddressEn: theater.theaterAddressEn,
            showtimes: theater.showtimes.map((showtime: any) => ({
              showtimeId: showtime.showtimeId,
              roomId: showtime.roomId,
              roomName: showtime.roomName,
              roomNameEn: showtime.roomNameEn,
              startTime: Array.isArray(showtime.startTime)
                ? new Date(
                    showtime.startTime[0], // year
                    showtime.startTime[1] - 1, // month (0-indexed)
                    showtime.startTime[2], // day
                    showtime.startTime[3], // hour
                    showtime.startTime[4] // minute
                  ).toISOString()
                : showtime.startTime,
              endTime: Array.isArray(showtime.endTime)
                ? new Date(
                    showtime.endTime[0], // year
                    showtime.endTime[1] - 1, // month (0-indexed)
                    showtime.endTime[2], // day
                    showtime.endTime[3], // hour
                    showtime.endTime[4] // minute
                  ).toISOString()
                : showtime.endTime,
            })),
          }));
        }

        console.log("✅ [MovieShowtime] Transformed theaters:", theaters);
        console.log("✅ [MovieShowtime] Number of theaters:", theaters.length);

        setTheaterShowtimes(theaters);
      } catch (error: any) {
        console.error(
          "❌ [MovieShowtime] Error fetching theater showtimes:",
          error
        );
        console.error(
          "❌ [MovieShowtime] Error response:",
          error.response?.data
        );
        console.error(
          "❌ [MovieShowtime] Error status:",
          error.response?.status
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTheaterShowtimes();
  }, [movieId, selectedProvinceId]);

  // Track if we've processed the preselected showtime
  const [preselectedProcessed, setPreselectedProcessed] = useState(false);
  const [pendingShowtime, setPendingShowtime] =
    useState<ShowtimeResponse | null>(null);

  // --- Auto-select showtime from URL params or passed state ---
  // Step 1: Set province and date first when preselectedShowtime is provided
  useEffect(() => {
    if (!preselectedShowtime || preselectedProcessed) return;
    if (provinces.length === 0) return; // Wait for provinces to load

    console.log(
      "🎯 [MovieShowtime] Processing preselectedShowtime:",
      preselectedShowtime
    );

    // Set the date
    const showtimeDate = dayjs(preselectedShowtime.startTime).format(
      "YYYY-MM-DD"
    );
    console.log("📅 [MovieShowtime] Setting date:", showtimeDate);
    setSelectedDate(showtimeDate);

    // Store the showtime to be selected after province is set
    setPendingShowtime(preselectedShowtime);

    // If theaterId is provided, find and set the correct province
    const theaterId = (preselectedShowtime as any).theaterId;
    if (theaterId) {
      const findProvinceForTheater = async () => {
        try {
          const { theaterService } = await import(
            "@/services/showtime/theaterService"
          );
          const theaterInfo = await theaterService.getTheaterById(theaterId);
          if (theaterInfo?.provinceName) {
            const matchedProvince = provinces.find(
              (p) =>
                p.name === theaterInfo.provinceName ||
                p.nameEn === theaterInfo.provinceNameEn
            );
            if (matchedProvince) {
              console.log(
                "🏢 [MovieShowtime] Setting province:",
                matchedProvince.id
              );
              setSelectedProvinceId(matchedProvince.id);
            }
          }
        } catch (error) {
          console.error("Error fetching theater info:", error);
        }
      };
      findProvinceForTheater();
    }

    setPreselectedProcessed(true);
  }, [preselectedShowtime, provinces, preselectedProcessed]);

  // Step 2: After theaterShowtimes are loaded, select the pending showtime
  useEffect(() => {
    if (!pendingShowtime || loading) return;
    if (theaterShowtimes.length === 0) return;

    // Check if the theater with this showtime exists in the loaded data
    const theaterId = (pendingShowtime as any).theaterId;
    const theaterExists = theaterShowtimes.some(
      (t) => t.theaterId === theaterId
    );

    if (theaterExists || !theaterId) {
      console.log("🎬 [MovieShowtime] Theater found, setting selectedShowtime");
      setSelectedShowtime(pendingShowtime);
      onSelectShowtime?.(pendingShowtime);
      setPendingShowtime(null);
    } else {
      console.log(
        "⏳ [MovieShowtime] Theater not found yet, waiting for correct province data"
      );
    }
  }, [pendingShowtime, theaterShowtimes, loading]);

  // Fallback: fetch from API if only showtimeId is provided (no preselectedShowtime object)
  useEffect(() => {
    if (!preselectedShowtimeId || selectedShowtime || preselectedShowtime)
      return;

    const autoSelectShowtime = async () => {
      console.log(
        "🎯 [MovieShowtime] Auto-selecting showtime from API:",
        preselectedShowtimeId
      );

      try {
        const showtimeDetail = await showtimeService.getShowtimeById(
          preselectedShowtimeId
        );
        console.log(
          "✅ [MovieShowtime] Showtime detail fetched:",
          showtimeDetail
        );

        if (showtimeDetail) {
          const showtimeDate = dayjs(showtimeDetail.startTime).format(
            "YYYY-MM-DD"
          );
          console.log("📅 [MovieShowtime] Setting date:", showtimeDate);
          setSelectedDate(showtimeDate);
          setSelectedShowtime(showtimeDetail);
          onSelectShowtime?.(showtimeDetail);
        }
      } catch (error) {
        console.error(
          "❌ [MovieShowtime] Error fetching showtime detail:",
          error
        );
      }
    };

    autoSelectShowtime();
  }, [preselectedShowtimeId, preselectedShowtime]);

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

    // Filter theaters theo date (province đã được filter ở API level)
    return theaterShowtimes
      .map((theater) => ({
        ...theater,
        showtimes: theater.showtimes.filter(
          (st) => dayjs(st.startTime).format("YYYY-MM-DD") === selectedDate
        ),
      }))
      .filter((theater) => theater.showtimes.length > 0); // Chỉ giữ theaters có showtimes
  };
  const theaterShowtimesForDate = getTheaterShowtimesByDate();

  // --- UI Effects & Reset khi chọn showtime mới ---
  const prevShowtimeRef = useRef<ShowtimeResponse | null>(null);
  const prevSeatsRef = useRef<ShowtimeSeatResponse[]>([]);

  // Keep prevSeatsRef updated before showtime changes
  useEffect(() => {
    prevSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  useEffect(() => {
    const unlockAndReset = async () => {
      // Nếu có showtime cũ và đang có ghế được chọn, unlock trước
      if (
        prevShowtimeRef.current &&
        prevSeatsRef.current.length > 0 &&
        prevShowtimeRef.current.id !== selectedShowtime?.id
      ) {
        try {
          await seatLockService.releaseSeats({
            showtimeId: prevShowtimeRef.current.id,
            seatIds: prevSeatsRef.current.map((s) => s.seatId),
            reason: "Showtime changed",
          });
          console.log(
            "[MovieShowtime] Unlocked seats for previous showtime:",
            prevShowtimeRef.current.id
          );
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
  const prevProvinceRef = useRef<string>("");

  useEffect(() => {
    const unlockSeats = async () => {
      // Chỉ unlock nếu province thực sự thay đổi (không phải lần đầu)
      if (
        prevProvinceRef.current &&
        prevProvinceRef.current !== selectedProvinceId
      ) {
        if (
          selectedSeatsRef.current.length > 0 &&
          selectedShowtimeRef.current
        ) {
          try {
            await seatLockService.releaseSeats({
              showtimeId: selectedShowtimeRef.current.id,
              seatIds: selectedSeatsRef.current.map((s) => s.seatId),
              reason: "Province changed",
            });
            console.log(
              "[MovieShowtime] Unlocked seats due to province change"
            );
          } catch (error) {
            console.error("Error unlocking seats:", error);
          }
        }

        setSelectedShowtime(null);
        setSelectedTickets({});
        setSelectedSeats([]);
        setTotalPrice(0);
        setSeatLockTTL(null);
      }

      prevProvinceRef.current = selectedProvinceId;
    };

    unlockSeats();
  }, [selectedProvinceId]);

  // Unlock ghế khi chuyển ngày
  const prevDateRef = useRef<string>("");

  useEffect(() => {
    const unlockSeats = async () => {
      // Chỉ unlock nếu date thực sự thay đổi (không phải lần đầu)
      if (prevDateRef.current && prevDateRef.current !== selectedDate) {
        if (
          selectedSeatsRef.current.length > 0 &&
          selectedShowtimeRef.current
        ) {
          try {
            await seatLockService.releaseSeats({
              showtimeId: selectedShowtimeRef.current.id,
              seatIds: selectedSeatsRef.current.map((s) => s.seatId),
              reason: "Date changed",
            });
            console.log("[MovieShowtime] Unlocked seats due to date change");
          } catch (error) {
            console.error("Error unlocking seats:", error);
          }
        }

        setSelectedShowtime(null);
        setSelectedTickets({});
        setSelectedSeats([]);
        setTotalPrice(0);
        setSeatLockTTL(null);
      }

      prevDateRef.current = selectedDate;
    };

    unlockSeats();
  }, [selectedDate]);

  useEffect(() => {
    const calculateTotal = async () => {
      // Tính tổng số vé đã chọn
      const totalTickets = Object.values(selectedTickets).reduce(
        (a, b) => a + b,
        0
      );

      // Nếu chưa chọn vé nào thì total = 0
      if (totalTickets === 0) {
        setTotalPrice(0);
        return;
      }

      try {
        const { pricingService } = await import(
          "@/services/pricing/pricingService"
        );
        const allPrices = await pricingService.getAllSeatPrices();

        let total = 0;

        // Tính giá dựa trên số vé đã chọn (không cần chờ chọn ghế)
        Object.entries(selectedTickets).forEach(([key, count]) => {
          const parts = key.split("-");
          const seatType = parts[0];
          const ticketType = parts.slice(1).join("-");

          // Tìm giá tương ứng với loại ghế và loại vé
          const price = allPrices.find(
            (p) => p.seatType === seatType && p.ticketType === ticketType
          );

          if (price) {
            total += Number(price.basePrice) * count;
          }
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
      // Debounce: chỉ scroll sau khi người dùng dừng thao tác 2 giây
      const timeoutId = setTimeout(() => {
        seatSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 2000);

      // Cleanup: hủy timeout cũ nếu selectedTickets thay đổi lại
      return () => clearTimeout(timeoutId);
    }
  }, [selectedTickets]);

  // === CLEANUP: Unlock ghế khi component unmount ===
  const selectedSeatsRef = useRef<ShowtimeSeatResponse[]>([]);
  const selectedShowtimeRef = useRef<ShowtimeResponse | null>(null);

  // Keep refs updated
  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
    selectedShowtimeRef.current = selectedShowtime;
  }, [selectedSeats, selectedShowtime]);

  useEffect(() => {
    return () => {
      // Unlock ghế khi user navigate ra ngoài trang này
      const seats = selectedSeatsRef.current;
      const showtime = selectedShowtimeRef.current;

      if (seats.length > 0 && showtime) {
        const identity = {
          userId: localStorage.getItem("userId"),
          guestSessionId: localStorage.getItem("guestSessionId"),
        };

        console.log(
          "[MovieShowtime UNMOUNT] Unlocking seats:",
          seats.map((s) => s.seatId)
        );

        seats.forEach((seat) => {
          seatLockService
            .unlockSingleSeat(
              showtime.id,
              seat.seatId,
              identity.userId ?? undefined,
              identity.guestSessionId ?? undefined
            )
            .catch((error) => {
              console.error(`Failed to unlock seat ${seat.seatId}:`, error);
            });
        });
      }
    };
  }, []); // Empty dependency để chỉ chạy khi unmount

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
    if (!selectedShowtime) return alert(t("booking.noShowtimeSelected"));
    if (selectedSeats.length === 0) return alert(t("booking.noSeatSelected"));

    const totalTickets = Object.values(selectedTickets).reduce(
      (a, b) => a + b,
      0
    );
    if (totalTickets === 0) return alert(t("booking.noTicketSelected"));
    if (totalTickets !== selectedSeats.length)
      return Swal.fire(
        t("booking.error"),
        t("booking.ticketSeatMismatch"),
        "error"
      );

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
          title: t("booking.creatingTicket"),
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
        // Guest: hiện loading giống user để đồng bộ UX
        Swal.fire({
          title: t("booking.creatingTicket"),
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
          background: "#18181b",
          color: "#fff",
        });

        // Delay 1.5s để tạo cảm giác đang xử lý
        await new Promise((resolve) => setTimeout(resolve, 1500));

        Swal.close();

        const pendingData = {
          requestData: baseRequest,
          movieId,
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
        title: t("booking.error"),
        text: t("booking.cannotCreateOrder"),
        icon: "error",
        background: "#18181b",
        color: "#fff",
      });
    }
  };

  if (movieStatus === "UPCOMING" && theaterShowtimes.length === 0 && !loading) {
    return (
      <div className="p-6 pt-16 text-center text-zinc-400 text-xl italic">
        {t("booking.noScheduleYet")}
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
          {t("booking.scheduleTitle")}{" "}
          <span className="text-yellow-500">
            {t("booking.scheduleHighlight")}
          </span>
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
                      ? t("booking.today")
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
            {t("booking.theaterList")}
          </span>
          {provinces.length > 0 && (
            <div className="w-full md:w-[220px] -mr-24">
              <CustomSelect
                options={provinces.map((p) => ({
                  value: p.id,
                  label: language === "en" && p.nameEn ? p.nameEn : p.name,
                }))}
                value={selectedProvinceId}
                onChange={setSelectedProvinceId}
                placeholder={t("booking.selectProvince")}
                variant="gold"
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
              <div className="bg-yellow-500 border border-zinc-800 rounded-xl p-6 shadow-lg text-center">
                <p className="text-black font-medium">
                  {t("booking.noShowtimesArea")}
                </p>
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
                      {language === "en" && theater.theaterNameEn
                        ? theater.theaterNameEn
                        : theater.theaterName}
                    </h3>
                    <p className="text-gray-800 text-sm ml-4">
                      {language === "en" && theater.theaterAddressEn
                        ? theater.theaterAddressEn
                        : theater.theaterAddress}
                    </p>
                  </div>

                  <div>
                    {theater.showtimes.length === 0 ? (
                      <p className="text-gray-700 italic text-sm ml-4">
                        {t("booking.noShowtimesToday")}
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
                                    theaterNameEn: theater.theaterNameEn,
                                    roomId: st.roomId,
                                    roomName: st.roomName,
                                    roomNameEn: st.roomNameEn,
                                    startTime: st.startTime,
                                    endTime: st.endTime,
                                  };
                                  setSelectedShowtime(res);
                                  onSelectShowtime?.(res);
                                }}
                                // --- NÚT GIỜ CHIẾU ---
                                className={`px-4 py-2 rounded-lg font-bold text-md transition-all duration-200 border border-black ${
                                  isSelected
                                    ? "bg-black text-yellow-500 shadow-lg transform scale-105 border-black"
                                    : "bg-white text-black hover:bg-black hover:text-yellow-500 hover:border-black"
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
            <div className="pt-10" data-ticket-section>
              <h2
                ref={ticketSectionRef}
                className="text-4xl font-extrabold mb-8 text-center text-gray-800 scroll-mt-24 uppercase"
              >
                {t("booking.selectTicketType")}{" "}
                <span className="text-yellow-500">
                  {t("booking.ticketHighlight")}
                </span>
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
                  {t("booking.seatMap")}{" "}
                  <span className="text-yellow-500">
                    {t("booking.seatHighlight")}
                  </span>
                </h2>

                {/* Dòng 2: Tên phòng (Style Badge tối giản) */}
                <div className="flex items-center gap-2 px-5 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span className="text-zinc-800 font-medium text-md uppercase tracking-wider">
                    {language === "en" && selectedShowtime.roomNameEn
                      ? selectedShowtime.roomNameEn
                      : selectedShowtime.roomName}
                  </span>
                </div>
              </div>

              {/* Vùng chọn ghế */}
              <div className="relative">
                <SelectSeat
                  showtimeId={selectedShowtime.id}
                  onSeatSelect={setSelectedSeats}
                  shouldUnlockOnUnmount={false}
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
        cinemaName={`${language === "en" && selectedShowtime?.theaterNameEn ? selectedShowtime.theaterNameEn : selectedShowtime?.theaterName || ""} (${
          language === "en"
            ? provinces.find((p) => p.id === selectedProvinceId)?.nameEn ||
              provinces.find((p) => p.id === selectedProvinceId)?.name ||
              ""
            : provinces.find((p) => p.id === selectedProvinceId)?.name || ""
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
