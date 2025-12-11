import React, { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Trash2,
  Film,
  Building2,
} from "lucide-react";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { showtimeService } from "@/services/showtime/showtimeService";
import { provinceService } from "@/services/showtime/provinceService";
import { theaterService } from "@/services/showtime/theaterService";
import { roomService } from "@/services/showtime/roomService";
import { movieManagementService } from "@/services/movie/movieManagementService";
import type { ShowtimeDetailResponse } from "@/types/showtime/showtime.type";
import { useDebounce } from "@/hooks/useDebounce";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

const ITEMS_PER_PAGE = 10;

interface ShowtimeTableProps {
  refreshTrigger?: number;
}

export default function ShowtimeTable({
  refreshTrigger,
}: ShowtimeTableProps): React.JSX.Element {
  const [showtimes, setShowtimes] = useState<ShowtimeDetailResponse[]>([]);
  const [paging, setPaging] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [provinceFilter, setProvinceFilter] = useState<string>("");
  const [theaterFilter, setTheaterFilter] = useState<string>("");
  const [roomFilter, setRoomFilter] = useState<string>("");
  const [movieFilter, setMovieFilter] = useState<string>("");
  const [startOfDayFilter, setStartOfDayFilter] = useState<string>("");
  const [endOfDayFilter, setEndOfDayFilter] = useState<string>("");
  const [fromTimeFilter, setFromTimeFilter] = useState<string>("");
  const [toTimeFilter, setToTimeFilter] = useState<string>("");

  const [filterTheaters, setFilterTheaters] = useState<any[]>([]);
  const [filterRooms, setFilterRooms] = useState<any[]>([]);
  const [filterMovies, setFilterMovies] = useState<any[]>([]);

  const [provinces, setProvinces] = useState<any[]>([]);

  const fetchShowtimes = async (page = 1, showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      else setIsRefreshing(true);

      const criteria = {
        provinceId: provinceFilter || undefined,
        theaterId: theaterFilter || undefined,
        roomId: roomFilter || undefined,
        movieId: movieFilter || undefined,
        showtimeId: debouncedSearch || undefined,
        startOfDay: startOfDayFilter ? startOfDayFilter : undefined,
        endOfDay: endOfDayFilter ? endOfDayFilter : undefined,
        fromTime: fromTimeFilter || undefined, // HH:mm format
        toTime: toTimeFilter || undefined, // HH:mm format
      };

      const pageResp = await showtimeService.adminSearch(
        criteria,
        page,
        ITEMS_PER_PAGE,
        "startTime",
        "asc"
      );

      setShowtimes(pageResp.data ?? []);
      setPaging({
        page: pageResp.page ?? page,
        totalPages: pageResp.totalPages ?? 1,
        total: pageResp.totalElements ?? 0,
      });
    } catch (err) {
      console.error("fetchShowtimes error", err);
      Swal.fire({
        icon: "error",
        title: "Không thể tải danh sách lịch chiếu",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const provincesRes = await provinceService.getAllProvinces();
        setProvinces(provincesRes);

        // Load all movies for filter
        const moviesRes = await movieManagementService.adminList({
          page: 1,
          size: 1000,
          status: "NOW_PLAYING",
        });
        setFilterMovies(moviesRes.data ?? []);
      } catch (err) {
        console.error("Error loading dropdown data", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchShowtimes(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchShowtimes(paging.page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    provinceFilter,
    theaterFilter,
    roomFilter,
    movieFilter,
    startOfDayFilter,
    endOfDayFilter,
    fromTimeFilter,
    toTimeFilter,
    debouncedSearch,
  ]);

  useEffect(() => {
    if (refreshTrigger) {
      fetchShowtimes(paging.page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  useEffect(() => {
    if (provinceFilter) {
      loadTheatersForFilter(provinceFilter);
    } else {
      setFilterTheaters([]);
      setTheaterFilter("");
      setFilterRooms([]);
      setRoomFilter("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceFilter]);

  useEffect(() => {
    if (theaterFilter) {
      loadRoomsForFilter(theaterFilter);
    } else {
      setFilterRooms([]);
      setRoomFilter("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theaterFilter]);

  const loadTheatersForFilter = async (provinceId: string) => {
    try {
      const theatersRes =
        await theaterService.getTheatersByProvince(provinceId);
      setFilterTheaters(theatersRes);
    } catch (err) {
      console.error("Error loading filter theaters", err);
    }
  };

  const loadRoomsForFilter = async (theaterId: string) => {
    try {
      const roomsRes = await roomService.getRoomsByTheaterId(theaterId);
      setFilterRooms(roomsRes);
    } catch (err) {
      console.error("Error loading filter rooms", err);
    }
  };

  const goToNextPage = () => {
    if (paging.page < paging.totalPages && !isRefreshing) {
      setPaging((p) => ({ ...p, page: p.page + 1 }));
    }
  };

  const goToPrevPage = () => {
    if (paging.page > 1 && !isRefreshing) {
      setPaging((p) => ({ ...p, page: p.page - 1 }));
    }
  };

  // Add useEffect to fetch when page changes
  useEffect(() => {
    if (!loading) {
      fetchShowtimes(paging.page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paging.page]);

  const deleteShowtime = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Xóa lịch chiếu?",
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;

    try {
      await showtimeService.deleteShowtime(id);
      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        timer: 900,
        showConfirmButton: false,
      });
      fetchShowtimes(paging.page);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Xóa thất bại",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-md">
      {/* Filters Row 1: Search, Province, Theater, Room */}
      <div className="flex flex-col md:flex-row gap-3 mb-3">
        <div className="flex items-center flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo Showtime ID..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg
                      bg-white border border-gray-400
                      text-gray-700 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                      transition"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPaging((p) => ({ ...p, page: 1 }));
            }}
          />
        </div>

        <CustomDropdown
          options={[
            { value: "", label: "Tất cả tỉnh/thành" },
            ...provinces.map((p) => ({ value: p.id, label: p.name })),
          ]}
          value={provinceFilter}
          onChange={(value) => {
            setProvinceFilter(value);
            setTheaterFilter("");
            setRoomFilter("");
            setPaging((p) => ({ ...p, page: 1 }));
          }}
          placeholder="Tất cả tỉnh/thành"
        />

        <CustomDropdown
          options={[
            { value: "", label: "Tất cả rạp" },
            ...filterTheaters.map((t) => ({ value: t.id, label: t.name })),
          ]}
          value={theaterFilter}
          onChange={(value) => {
            setTheaterFilter(value);
            setRoomFilter("");
            setPaging((p) => ({ ...p, page: 1 }));
          }}
          placeholder="Tất cả rạp"
          disabled={!provinceFilter}
        />

        <CustomDropdown
          options={[
            { value: "", label: "Tất cả phòng" },
            ...filterRooms.map((r) => ({ value: r.id, label: r.name })),
          ]}
          value={roomFilter}
          onChange={(value) => {
            setRoomFilter(value);
            setPaging((p) => ({ ...p, page: 1 }));
          }}
          placeholder="Tất cả phòng"
          disabled={!theaterFilter}
        />
      </div>

      {/* Filters Row 2: Movie, Date, Time */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <CustomDropdown
          options={[
            { value: "", label: "Tất cả phim" },
            ...filterMovies.map((m: any) => ({ value: m.id, label: m.title })),
          ]}
          value={movieFilter}
          onChange={(value) => {
            setMovieFilter(value);
            setPaging((p) => ({ ...p, page: 1 }));
          }}
          placeholder="Tất cả phim"
        />

        {/* Start of Day */}
        <div className="flex items-center relative flex-1">
          <label className="sr-only">Start of Day</label>
          <input
            type="date"
            className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
            value={startOfDayFilter}
            onChange={(e) => {
              setStartOfDayFilter(e.target.value); // YYYY-MM-DD
              setPaging((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Ngày giờ bắt đầu"
          />
        </div>

        {/* End of Day */}
        <div className="flex items-center relative flex-1">
          <label className="sr-only">End of Day</label>
          <input
            type="date"
            className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
            value={endOfDayFilter}
            onChange={(e) => {
              setEndOfDayFilter(e.target.value); // YYYY-MM-DD
              setPaging((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Ngày giờ kết thúc"
          />
        </div>

        {/* From Time */}
        <div className="flex items-center relative flex-1">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <TimePicker
            className="w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-white border border-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
            value={fromTimeFilter || undefined}
            onChange={(value) => {
              setFromTimeFilter(value || "");
              setPaging((p) => ({ ...p, page: 1 }));
            }}
            format="HH:mm"
            clearIcon={null}
            clockIcon={null}
          />
        </div>

        {/* To Time */}
        <div className="flex items-center relative flex-1">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <TimePicker
            className="w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-white border border-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
            value={toTimeFilter || undefined}
            onChange={(value) => {
              setToTimeFilter(value || "");
              setPaging((p) => ({ ...p, page: 1 }));
            }}
            format="HH:mm"
            clearIcon={null}
            clockIcon={null}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-400 relative">
        {isRefreshing && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm pointer-events-none z-10 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          </div>
        )}

        <table
          className="min-w-full divide-y divide-yellow-400/80 table-fixed"
          style={{ tableLayout: "fixed", width: "100%" }}
        >
          <thead className="sticky top-0 z-10 border-b border-gray-400 bg-gray-50">
            <tr>
              <th className="w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phim
              </th>
              <th className="w-[180px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rạp
              </th>
              <th className="w-[100px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phòng
              </th>
              <th className="w-[140px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian bắt đầu
              </th>
              <th className="w-[140px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian kết thúc
              </th>
              <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ghế
              </th>
              <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-400 relative bg-white">
            {showtimes.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-gray-500 italic text-sm"
                >
                  Không có lịch chiếu nào
                </td>
              </tr>
            ) : (
              showtimes.map((st) => (
                <tr
                  key={st.id}
                  className={`transition duration-150 ${
                    isRefreshing ? "opacity-60 pointer-events-none" : ""
                  } hover:bg-gray-50`}
                >
                  <td className="px-6 py-4 text-sm text-gray-900 text-left">
                    <div className="flex items-center gap-2">
                      <Film size={16} className="text-yellow-600" />
                      <span className="font-medium truncate">
                        {st.movieTitle}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-left">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-blue-600" />
                      <div>
                        <div className="font-medium truncate">
                          {st.theaterName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {st.provinceName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-left">
                    {st.roomName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-left">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-gray-500" />
                      <span className="text-xs">
                        {dayjs(st.startTime).format("DD/MM/YYYY HH:mm")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-left">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-gray-500" />
                      <span className="text-xs">
                        {dayjs(st.endTime).format("DD/MM/YYYY HH:mm")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-xs">
                      <div className="text-green-600 font-medium">
                        Trống: {st.availableSeats}
                      </div>
                      <div className="text-red-600 font-medium">
                        Đã đặt: {st.bookedSeats}
                      </div>
                      <div className="text-gray-500">Tổng: {st.totalSeats}</div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center text-base font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => deleteShowtime(st.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Xóa lịch chiếu"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center pt-4 gap-3">
        <span className="text-sm text-gray-700">
          Trang {paging.page}/{paging.totalPages} • {paging.total} lịch chiếu
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevPage}
            disabled={paging.page <= 1 || isRefreshing}
            className={`p-2 rounded-md transition ${
              paging.page <= 1 || isRefreshing
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={goToNextPage}
            disabled={paging.page >= paging.totalPages || isRefreshing}
            className={`p-2 rounded-md transition ${
              paging.page >= paging.totalPages || isRefreshing
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
