import React, { useEffect, useState } from "react";
import { theaterService } from "@/services/showtime/theaterService";
import { showtimeService } from "@/services/showtime/showtimeService";
import { provinceService } from "@/services/showtime/provinceService";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import type { ShowtimeResponse } from "@/types/showtime/showtime.type";
import type { ProvinceResponse } from "@/types/showtime/province.type";
import { BookingStep } from "@/pages/Booking/BookingStep"; 
import { MOCK_PROVINCES, MOCK_THEATERS, MOCK_SHOWTIMES } from "@/pages/Showtime/MockDataShowtime";
import dayjs from "dayjs";

interface MovieShowtimeProps {
  movieId: string;
  onSelectShowtime?: (showtime: ShowtimeResponse) => void;
}

const MovieShowtime: React.FC<MovieShowtimeProps> = ({ movieId, onSelectShowtime }) => {
  const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [showtimes, setShowtimes] = useState<ShowtimeResponse[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<ShowtimeResponse | null>(null);

  // Mock data - muốn thấy giao diện thì bỏ comment phần này
  useEffect(() => {
    setProvinces(MOCK_PROVINCES);
    setTheaters(MOCK_THEATERS.filter((t) => t.provinceName === MOCK_PROVINCES[0].name));
    setShowtimes(MOCK_SHOWTIMES);
    setSelectedProvince(MOCK_PROVINCES[0].id);
  }, []);
  // Lọc rạp theo tỉnh khi selectedProvince thay đổi
  useEffect(() => {
    if (!selectedProvince) return;
    const filteredTheaters = MOCK_THEATERS.filter(
        (t) => t.provinceName === provinces.find(p => p.id === selectedProvince)?.name
    );
    setTheaters(filteredTheaters);
  }, [selectedProvince, provinces]);

  // Lấy data tỉnh
  useEffect(() => {
    const fetchProvinces = async () => {
      const res = await provinceService.getAllProvinces();
      setProvinces(res);
      if (res.length > 0) setSelectedProvince(res[0].id);
    };
    fetchProvinces();
  }, []);

  // Lấy data rạp
  useEffect(() => {
    if (!selectedProvince) return;
    const fetchTheaters = async () => {
      const res = await theaterService.getTheatersByProvince(selectedProvince);
      setTheaters(res);
    };
    fetchTheaters();
  }, [selectedProvince]);

  // Lấy data lịch chiếu
  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        setLoading(true);
        const res = await showtimeService.getShowtimesByMovie(movieId);
        setShowtimes(res);
      } finally {
        setLoading(false);
      }
    };
    fetchShowtimes();
  }, [movieId]);

  // Lọc lịch chiếu theo rạp và ngày
  const getShowtimesByTheaterAndDate = (theaterId: string) => {
    const dateStr = selectedDate.format("YYYY-MM-DD");
    return showtimes.filter(
      (st) =>
        st.theaterName === theaters.find((t) => t.id === theaterId)?.name &&
        dayjs(st.startTime).format("YYYY-MM-DD") === dateStr
    );
  };

  // Lấy danh sách các ngày có lịch chiếu
  const availableDates = Array.from(
    new Set(
        showtimes.map((st) => dayjs(st.startTime).format("YYYY-MM-DD"))
    )
  )
    .map((dateStr) => dayjs(dateStr))
    .sort((a, b) => a.valueOf() - b.valueOf());

  // Nếu selectedDate chưa có hoặc không nằm trong availableDates, set default
  useEffect(() => {
    if (!selectedDate || !availableDates.some((d) => d.isSame(selectedDate, "day"))) {
        if (availableDates.length > 0) setSelectedDate(availableDates[0]);
    }
  }, [availableDates]);

  // Lọc rạp theo tỉnh và theo ngày
  const theatersWithShowtimes = theaters.filter((t) =>
    getShowtimesByTheaterAndDate(t.id).length > 0
  );

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="p-6 pt-24 rounded-2xl shadow-md">
      <h2 className="text-4xl font-extrabold mb-6 text-center text-white">
        LỊCH CHIẾU
      </h2>

      {/* Tabs chọn ngày */}
      <div className="flex justify-center gap-4 mb-10">
        {availableDates.map((date, index) => (
            <button
            key={index}
            onClick={() => setSelectedDate(date)}
            className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors ${
                date.isSame(selectedDate, "day")
                ? "bg-yellow-300 text-black"
                : "border border-yellow-100/80 text-yellow-400 hover:bg-yellow-300 hover:text-black"
            }`}
            >
            {date.format("DD/MM")} <br /> {capitalize(date.format("dddd"))}
            </button>
        ))}
      </div>

      {/* Dòng DANH SÁCH RẠP + Dropdown chọn tỉnh */}
      <div className="flex items-center justify-between mb-4 max-w-3xl mx-auto">
        <span className="text-white font-bold text-3xl">DANH SÁCH RẠP</span>
        <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="bg-transparent border border-yellow-400/60 text-white font-semibold px-4 py-2 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
        >
            {provinces.map((p) => (
            <option 
                key={p.id} 
                value={p.id} 
                className="bg-transparent text-black"
            >
                {p.name}
            </option>
            ))}
        </select>
      </div>

      {/* Khung chứa THÔNG TIN RẠP + LỊCH CHIẾU */}
      <div className="rounded-xl p-6 shadow-lg max-w-3xl mx-auto mb-8">
        {theatersWithShowtimes.length === 0 ? (
          <p className="text-white text-center">Hiện chưa có lịch chiếu trong khu vực này.</p>
        ) : (
          theatersWithShowtimes.map((theater) => {
            const theaterShowtimes = getShowtimesByTheaterAndDate(theater.id);
            return (
              <div
                key={theater.id}
                className="bg-gray-900/70 border border-yellow-600/30 rounded-lg p-5 mb-5 shadow-inner transition-transform hover:scale-[1.01]"
              >
                <h3 className="text-xl font-bold text-yellow-400 mb-1">
                  {theater.name} ({theater.provinceName})
                </h3>
                <p className="text-white text-sm mb-3">{theater.address}</p>
                {loading ? (
                  <p className="text-white">Đang tải...</p>
                ) : theaterShowtimes.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {theaterShowtimes.map((st) => {
                      const isPast = dayjs(st.endTime).isBefore(dayjs()); // kiểm tra đã kết thúc
                      return (
                        <span
                            key={st.id}
                            onClick={() => {
                              if (isPast) return;
                              setSelectedShowtime(st); // chọn lịch chiếu
                              onSelectShowtime?.(st); // truyền showtime ra ngoài để báo cho MovieDetailPage biết
                            }}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                        isPast
                                            ? "text-gray-500 border border-gray-400/50 cursor-not-allowed bg-[#2a2a2a]"
                                            : "text-yellow-100 border border-yellow-400 hover:bg-yellow-400 hover:text-black cursor-pointer"
                                        }`} >
                            {dayjs(st.startTime).format("HH:mm")}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-yellow-100">Hiện chưa có lịch chiếu</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Hiển thị Booking Step khi đã chọn lịch chiếu */}
      {selectedShowtime && (
        <div className="mt-10 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white">
            Chọn vé cho lịch chiếu: {dayjs(selectedShowtime.startTime).format("HH:mm, DD/MM/YYYY")}
          </h2>
          <BookingStep />
        </div>
      )}
    </div>
  );
};

export default MovieShowtime;
