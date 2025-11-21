import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { showtimeService } from "@/services/showtime/showtimeService";
import { provinceService } from "@/services/showtime/provinceService";
import { CustomSelect } from "@/components/ui/CustomSelect";
import type {
  ShowtimeResponse,
  TheaterShowtimesResponse,
} from "@/types/showtime/showtime.type";
import type { ProvinceResponse } from "@/types/showtime/province.type";
import SelectSeat from "@/components/booking/SelectSeat";
import SelectTicket from "@/components/booking/SelectTicket";
import BookingSummaryBar from "@/components/booking/BookingSummaryBar";
import { useGuestSessionContext } from "@/contexts/GuestSessionContext";
import dayjs from "dayjs";
import "dayjs/locale/vi";

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

  // Initialize guest session
  const { guestSessionId, isLoggedIn, getUserOrGuestId } =
    useGuestSessionContext();

  // Log session info for debugging
  useEffect(() => {
    if (isLoggedIn) {
      console.log("👤 User is logged in");
    } else {
      console.log("👻 Guest session ID:", guestSessionId);
    }
  }, [isLoggedIn, guestSessionId]);

  // Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await provinceService.getAllProvinces();
        setProvinces(res);
        if (res.length > 0) {
          setSelectedProvinceId(res[0].id);
        }
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch theater showtimes by movie and province
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

  // Generate fixed 5 days starting from today
  const getFixedDates = () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      dates.push(dayjs().add(i, "day").format("YYYY-MM-DD"));
    }
    return dates;
  };

  // Get all unique theaters and their showtimes for selected date
  const getTheaterShowtimesByDate = () => {
    if (!selectedDate) return [];

    return theaterShowtimes.map((theater) => {
      const filteredShowtimes = theater.showtimes.filter((st) => {
        const showtimeDate = dayjs(st.startTime).format("YYYY-MM-DD");
        return showtimeDate === selectedDate;
      });

      return {
        ...theater,
        showtimes: filteredShowtimes,
      };
    });
  };

  const fixedDates = getFixedDates();
  const theaterShowtimesForDate = getTheaterShowtimesByDate();

  // Set first date as default on mount
  useEffect(() => {
    if (!selectedDate && movieStatus === "NOW_PLAYING") {
      setSelectedDate(fixedDates[0]);
    }
  }, []);

  // Auto-scroll to ticket section when showtime is selected
  useEffect(() => {
    if (selectedShowtime && ticketSectionRef.current) {
      ticketSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedShowtime]);

  // Reset booking sections when province changes
  useEffect(() => {
    setSelectedShowtime(null);
    setSelectedTickets({});
    setSelectedSeats([]);
    setTotalPrice(0);
  }, [selectedProvinceId]);

  // Calculate total price when tickets change
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
          if (price) {
            total += Number(price.basePrice) * count;
          }
        });
        setTotalPrice(total);
      } catch (error) {
        console.error("Error calculating price:", error);
      }
    };

    calculateTotal();
  }, [selectedTickets]);

  // Auto-scroll to seat section after 3s when tickets are selected
  useEffect(() => {
    const totalTickets = Object.values(selectedTickets).reduce(
      (sum, count) => sum + count,
      0
    );
    if (totalTickets > 0 && seatSectionRef.current) {
      const timer = setTimeout(() => {
        seatSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedTickets]);

  // Early return for UPCOMING movies with no showtimes
  if (movieStatus === "UPCOMING" && theaterShowtimes.length === 0 && !loading) {
    return (
      <div className="p-6 pt-16 text-center">
        <p className="text-white text-xl">
          Hiện chưa có lịch chiếu cho phim này.
        </p>
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
      {/* Tabs chọn ngày - Chỉ hiển với NOW_PLAYING */}
      {movieStatus === "NOW_PLAYING" && (
        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          {fixedDates.map((date) => {
            const dateObj = dayjs(date);
            const isToday = dateObj.isSame(dayjs(), "day");
            const capitalize = (s: string) =>
              s.charAt(0).toUpperCase() + s.slice(1);
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
                  {isToday ? "Hôm nay" : capitalize(dateObj.format("dddd"))}
                </div>
              </button>
            );
          })}
        </div>
      )}
      {/* DANH SÁCH RẠP + Dropdown chọn tỉnh */}
      <div className="flex items-center justify-between mb-4 max-w-6xl mx-auto pt-10">
        <span className="text-yellow-300 font-extrabold text-3xl">
          DANH SÁCH RẠP
        </span>
        {provinces.length > 0 && (
          <div className="min-w-[220px]">
            <CustomSelect
              options={provinces.map((province) => ({
                value: province.id,
                label: province.name,
              }))}
              value={selectedProvinceId}
              onChange={(val) => setSelectedProvinceId(val)}
              placeholder="Chọn tỉnh/thành phố"
            />
          </div>
        )}
      </div>
      {/* Khung chứa THÔNG TIN RẠP + LỊCH CHIẾU */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
        </div>
      ) : (
        <div className="rounded-xl pt-10 shadow-lg max-w-6xl mx-auto mb-8">
          {theaterShowtimesForDate.length === 0 ? (
            <p className="text-white text-center">
              Hiện chưa có rạp chiếu phim này trong tỉnh này.
            </p>
          ) : (
            theaterShowtimesForDate.map((theater, index) => {
              return (
                <motion.div
                  key={theater.theaterId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-yellow-900/50 border border-yellow-600/30 pt-7 pl-10 pb-5 shadow-inner"
                >
                  <h3 className="text-2xl font-extrabold text-yellow-300 mb-1">
                    {theater.theaterName}
                  </h3>
                  <p className="text-white text-md mb-3 mt-4">
                    {theater.theaterAddress}
                  </p>

                  {/* Show showtimes or empty state */}
                  <div className="mb-4 pt-3">
                    {theater.showtimes.length === 0 ? (
                      <p className="text-gray-400 text-md italic">
                        Rạp này chưa có lịch chiếu trong ngày này
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {theater.showtimes
                          .filter((st) => {
                            // Chỉ hiển thị nếu startTime > thời gian hiện tại
                            return dayjs(st.startTime).isAfter(dayjs());
                          })
                          .sort(
                            (a, b) =>
                              dayjs(a.startTime).valueOf() -
                              dayjs(b.startTime).valueOf()
                          )
                          .map((st) => {
                            const isSelected =
                              selectedShowtime?.id === st.showtimeId;
                            return (
                              <button
                                key={st.showtimeId}
                                onClick={() => {
                                  // Convert ShowtimeInfo to ShowtimeResponse for backward compatibility
                                  const showtimeResponse: ShowtimeResponse = {
                                    id: st.showtimeId,
                                    movieId: movieId,
                                    theaterName: theater.theaterName,
                                    roomId: "", // Not provided by new API
                                    roomName: "", // Not provided by new API
                                    startTime: st.startTime,
                                    endTime: st.endTime,
                                  };
                                  setSelectedShowtime(showtimeResponse);
                                  onSelectShowtime?.(showtimeResponse);
                                }}
                                className={`px-4 py-2 rounded-md border transition-colors ${
                                  isSelected
                                    ? "bg-yellow-400 text-black border-yellow-400"
                                    : "text-white border-white hover:bg-yellow-400 hover:text-black hover:border-yellow-400 cursor-pointer"
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
              );
            })
          )}
        </div>
      )}
      {/* Hiển thị Booking khi đã chọn lịch chiếu */}
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
          <div className="pt-10 pb-36">
            <SelectSeat
              showtimeId={selectedShowtime.id}
              onSeatSelect={setSelectedSeats}
              selectedTickets={selectedTickets}
            />
          </div>
        </motion.div>
      )}

      {/* BookingSummaryBar - hiển thị khi đã chọn showtime */}
      <BookingSummaryBar
        movieTitle={movieTitle}
        cinemaName={`${selectedShowtime?.theaterName || ""} (${
          provinces.find((p) => p.id === selectedProvinceId)?.name || ""
        })`}
        totalPrice={totalPrice}
        isVisible={!!selectedShowtime}
      />
    </motion.div>
  );
};

export default MovieShowtime;
