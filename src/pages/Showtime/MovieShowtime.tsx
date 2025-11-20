import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { showtimeService } from "@/services/showtime/showtimeService";
import { provinceService } from "@/services/showtime/provinceService";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import type {
  ShowtimeResponse,
  MovieShowtimeResponse,
  ShowtimeDetailResponse,
} from "@/types/showtime/showtime.type";
import type { ProvinceResponse } from "@/types/showtime/province.type";
import SelectSeat from "@/components/booking/SelectSeat";
import SelectTicket from "@/components/booking/SelectTicket";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

interface MovieShowtimeProps {
  movieId: string;
  onSelectShowtime?: (showtime: ShowtimeResponse) => void;
}

const MovieShowtime: React.FC<MovieShowtimeProps> = ({
  movieId,
  onSelectShowtime,
}) => {
  const [showtimeData, setShowtimeData] =
    useState<MovieShowtimeResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedShowtime, setSelectedShowtime] =
    useState<ShowtimeResponse | null>(null);
  const [detailedShowtimes, setDetailedShowtimes] = useState<
    ShowtimeDetailResponse[]
  >([]);

  // Lấy data lịch chiếu từ API
  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        setLoading(true);
        const res = await showtimeService.getShowtimesByMovie(movieId);
        setShowtimeData(res);
        // Set ngày đầu tiên làm mặc định
        if (res.availableDates.length > 0) {
          setSelectedDate(res.availableDates[0]);
        }
      } catch (error) {
        console.error("Error fetching showtimes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShowtimes();
  }, [movieId]);

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

  // Fetch detailed showtimes to get province info
  useEffect(() => {
    const fetchDetailedShowtimes = async () => {
      if (!showtimeData || !selectedDate) return;
      try {
        const showtimesForDate =
          showtimeData.showtimesByDate[selectedDate] || [];
        const detailedPromises = showtimesForDate.map((st) =>
          showtimeService.getShowtimeById(st.id)
        );
        const detailed = await Promise.all(detailedPromises);
        setDetailedShowtimes(detailed as ShowtimeDetailResponse[]);
      } catch (error) {
        console.error("Error fetching detailed showtimes:", error);
      }
    };
    fetchDetailedShowtimes();
  }, [showtimeData, selectedDate]);

  // Group showtimes by theater, filtered by province
  const getShowtimesByTheater = () => {
    if (!showtimeData || !selectedDate || !selectedProvinceId) return {};

    const showtimesForDate = showtimeData.showtimesByDate[selectedDate] || [];
    const grouped: { [theaterName: string]: ShowtimeResponse[] } = {};

    showtimesForDate.forEach((showtime) => {
      // Tìm detailed showtime tương ứng để lấy provinceId
      const detailed = detailedShowtimes.find((d) => d.id === showtime.id);
      if (detailed && detailed.provinceId === selectedProvinceId) {
        if (!grouped[showtime.theaterName]) {
          grouped[showtime.theaterName] = [];
        }
        grouped[showtime.theaterName].push(showtime);
      }
    });

    return grouped;
  };

  const theaterGroups = getShowtimesByTheater();
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (loading) {
    return (
      <div className="p-6 pt-24 text-center">
        <p className="text-white text-xl">Đang tải lịch chiếu...</p>
      </div>
    );
  }

  if (!showtimeData || showtimeData.availableDates.length === 0) {
    return (
      <div className="p-6 pt-24 text-center">
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
      className="p-6 pt-16 rounded-2xl shadow-md"
    >
      <h2 className="text-4xl font-extrabold mb-14 text-center text-yellow-300">
        LỊCH CHIẾU
      </h2>

      {/* Tabs chọn ngày */}
      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        {showtimeData.availableDates.map((date) => {
          const dateObj = dayjs(date);
          const isToday = dateObj.isSame(dayjs(), "day");
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
              <div className="text-xl font-bold">{dateObj.format("DD/MM")}</div>
              <div className="text-sm">
                {isToday ? "Hôm nay" : capitalize(dateObj.format("dddd"))}
              </div>
            </button>
          );
        })}
      </div>

      {/* DANH SÁCH RẠP + Dropdown chọn tỉnh */}
      <div className="flex items-center justify-between mb-4 max-w-6xl mx-auto">
        <span className="text-yellow-300 font-extrabold text-3xl mt-7">
          DANH SÁCH RẠP
        </span>
        {provinces.length > 0 && (
          <CustomDropdown
            options={provinces.map((province) => ({
              value: province.id,
              label: province.name,
            }))}
            value={selectedProvinceId}
            onChange={(val) => setSelectedProvinceId(val)}
            placeholder="Chọn tỉnh/thành phố"
            className="min-w-[200px]"
          />
        )}
      </div>

      {/* Khung chứa THÔNG TIN RẠP + LỊCH CHIẾU */}
      <div className="rounded-xl p-6 shadow-lg max-w-6xl mx-auto mb-8">
        {Object.keys(theaterGroups).length === 0 ? (
          <p className="text-white text-center">
            Hiện chưa có lịch chiếu trong ngày này.
          </p>
        ) : (
          Object.entries(theaterGroups).map(([theaterName, showtimes]) => {
            // Group by room within each theater
            const roomGroups: { [roomName: string]: ShowtimeResponse[] } = {};
            showtimes.forEach((st) => {
              if (!roomGroups[st.roomName]) {
                roomGroups[st.roomName] = [];
              }
              roomGroups[st.roomName].push(st);
            });

            return (
              <div
                key={theaterName}
                className="bg-purple-900/50 border border-yellow-600/30 rounded-lg p-5 mb-5 shadow-inner"
              >
                <h3 className="text-xl font-bold text-yellow-400 mb-1">
                  {theaterName}
                </h3>
                <p className="text-white text-sm mb-3">
                  Tầng 6, TTTM Satra Võ Văn Kiệt, 1466 Võ Văn Kiệt, Phường 1,
                  Quận 6, TPHCM
                </p>

                {/* Show showtimes grouped by room type */}
                {Object.entries(roomGroups).map(([roomName, roomShowtimes]) => (
                  <div key={roomName} className="mb-4">
                    <h4 className="text-white font-semibold mb-2">
                      {roomName}
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {roomShowtimes
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
                          const isSelected = selectedShowtime?.id === st.id;
                          return (
                            <button
                              key={st.id}
                              onClick={() => {
                                setSelectedShowtime(st);
                                onSelectShowtime?.(st);
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
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Hiển thị Booking khi đã chọn lịch chiếu */}
      {selectedShowtime && (
        <div className="mt-10 max-w-6xl mx-auto">
          <div className="bg-purple-900/30 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">
              Thông tin suất chiếu đã chọn
            </h2>
            <p className="text-white">
              <strong>Rạp:</strong> {selectedShowtime.theaterName}
            </p>
            <p className="text-white">
              <strong>Phòng:</strong> {selectedShowtime.roomName}
            </p>
            <p className="text-white">
              <strong>Giờ chiếu:</strong>{" "}
              {dayjs(selectedShowtime.startTime).format("HH:mm, DD/MM/YYYY")}
            </p>
          </div>
          {/* Chọn loại vé */}
          <h2 className="text-4xl font-extrabold mb-6 text-center text-white">
            CHỌN LOẠI VÉ
          </h2>
          <SelectTicket
            seatType="NORMAL" // mặc định loại ghế là NORMAL khi chọn loại vé
            onTicketChange={() => {}}
          />
          {/* Sơ đồ chỗ ngồi */}
          <h2 className="text-4xl font-extrabold mb-6 mt-12 text-center text-white">
            CHỌN GHẾ
          </h2>
          <SelectSeat
            showtimeId={selectedShowtime.id}
            onSeatSelect={() => {}}
          />{" "}
        </div>
      )}
    </motion.div>
  );
};

export default MovieShowtime;
