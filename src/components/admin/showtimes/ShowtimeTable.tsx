import React, { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Trash2,
  Film,
  Building2,
} from "lucide-react";
import Swal from "sweetalert2";
import dayjs from "dayjs";
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
        startOfDay: startOfDayFilter ? dayjs(startOfDayFilter).format("YYYY-MM-DDTHH:mm") : undefined,
        endOfDay: endOfDayFilter ? dayjs(endOfDayFilter).format("YYYY-MM-DDTHH:mm") : undefined,
        fromTime: fromTimeFilter || undefined,
        toTime: toTimeFilter || undefined,
      };

      const pageResp = await showtimeService.adminSearch(
        criteria,
        page,
        ITEMS_PER_PAGE,
        "startTime",
        "desc"
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
        background: "#0b1020",
        color: "#fff",
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
    if (paging.page < paging.totalPages && !isRefreshing)
      setPaging((p) => ({ ...p, page: p.page + 1 }));
  };

  const goToPrevPage = () => {
    if (paging.page > 1 && !isRefreshing)
      setPaging((p) => ({ ...p, page: p.page - 1 }));
  };

  const deleteShowtime = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Xóa lịch chiếu?",
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      background: "#0b1020",
      color: "#fff",
    });
    if (!confirm.isConfirmed) return;

    try {
      await showtimeService.deleteShowtime(id);
      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        timer: 900,
        showConfirmButton: false,
        background: "#0b1020",
        color: "#fff",
      });
      fetchShowtimes(paging.page);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Xóa thất bại",
        background: "#0b1020",
        color: "#fff",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10">
        Đang tải danh sách lịch chiếu...
      </div>
    );
  }

  return (
    <div className="bg-black/60 backdrop-blur-md border border-yellow-400/40 rounded-2xl p-6 shadow-2xl text-white">
      {/* Filters Row 1: Search, Province, Theater, Room */}
      <div className="flex flex-col md:flex-row gap-3 mb-3">
        <div className="flex items-center flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
          <input
            type="text"
            placeholder="Tìm theo Showtime ID..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-black/30 border border-yellow-400/40 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-yellow-400"
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
            type="datetime-local"
            className="w-full px-3 py-2 text-sm rounded-lg bg-black/30 border border-yellow-400/40 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
            value={startOfDayFilter}
            onChange={(e) => {
              setStartOfDayFilter(e.target.value);
              setPaging((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Ngày giờ bắt đầu"
          />
        </div>

        {/* End of Day */}
        <div className="flex items-center relative flex-1">
          <label className="sr-only">End of Day</label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 text-sm rounded-lg bg-black/30 border border-yellow-400/40 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
            value={endOfDayFilter}
            onChange={(e) => {
              setEndOfDayFilter(e.target.value);
              setPaging((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Ngày giờ kết thúc"
          />
        </div>

        {/* From Time */}
        <div className="flex items-center relative flex-1">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
          <input
            type="time"
            className="w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-black/30 border border-yellow-400/40 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
            value={fromTimeFilter}
            onChange={(e) => {
              setFromTimeFilter(e.target.value);
              setPaging((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Giờ bắt đầu"
          />
        </div>

        {/* To Time */}
        <div className="flex items-center relative flex-1">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
          <input
            type="time"
            className="w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-black/30 border border-yellow-400/40 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
            value={toTimeFilter}
            onChange={(e) => {
              setToTimeFilter(e.target.value);
              setPaging((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Giờ kết thúc"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-yellow-400/40 relative">
        {isRefreshing && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          </div>
        )}

        <table className="w-full text-sm">
          <thead className="bg-yellow-500/20 text-yellow-300 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Phim</th>
              <th className="px-4 py-3 text-left">Rạp</th>
              <th className="px-4 py-3 text-left">Phòng</th>
              <th className="px-4 py-3 text-left">Thời gian bắt đầu</th>
              <th className="px-4 py-3 text-left">Thời gian kết thúc</th>
              <th className="px-4 py-3 text-center">Ghế</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yellow-400/20">
            {showtimes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Không có lịch chiếu nào
                </td>
              </tr>
            ) : (
              showtimes.map((st) => (
                <tr
                  key={st.id}
                  className="hover:bg-yellow-400/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Film size={16} className="text-yellow-400" />
                      <span className="font-medium">{st.movieTitle}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-blue-400" />
                      <div>
                        <div className="font-medium">{st.theaterName}</div>
                        <div className="text-xs text-gray-400">
                          {st.provinceName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{st.roomName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-300">
                      <Clock size={14} />
                      {dayjs(st.startTime).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-300">
                      <Clock size={14} />
                      {dayjs(st.endTime).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-xs">
                      <div className="text-green-400">
                        Trống: {st.availableSeats}
                      </div>
                      <div className="text-red-400">
                        Đã đặt: {st.bookedSeats}
                      </div>
                      <div className="text-gray-400">Tổng: {st.totalSeats}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => deleteShowtime(st.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
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

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-400">
          Trang {paging.page} / {paging.totalPages} - Tổng {paging.total} lịch
          chiếu
        </p>
        <div className="flex gap-2">
          <button
            onClick={goToPrevPage}
            disabled={paging.page === 1 || isRefreshing}
            className="p-2 rounded-lg bg-black/40 border border-yellow-400/40 text-white hover:bg-black/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToNextPage}
            disabled={paging.page >= paging.totalPages || isRefreshing}
            className="p-2 rounded-lg bg-black/40 border border-yellow-400/40 text-white hover:bg-black/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
