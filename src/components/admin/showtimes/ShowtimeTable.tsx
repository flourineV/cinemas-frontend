import React, { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Film,
  Building2,
  Download,
} from "lucide-react";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { showtimeService } from "@/services/showtime/showtimeService";
import { provinceService } from "@/services/showtime/provinceService";
import { theaterService } from "@/services/showtime/theaterService";
import { roomService } from "@/services/showtime/roomService";
import { movieManagementService } from "@/services/movie/movieManagementService";
import type { ShowtimeDetailResponse } from "@/types/showtime/showtime.type";
import { useDebounce } from "@/hooks/useDebounce";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import DateInput from "@/components/ui/DateInput";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      // Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPrevPage = () => {
    if (paging.page > 1 && !isRefreshing) {
      setPaging((p) => ({ ...p, page: p.page - 1 }));
      // Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Add useEffect to fetch when page changes
  useEffect(() => {
    if (!loading) {
      fetchShowtimes(paging.page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paging.page]);

  const deleteShowtime = async (id: string, bookedSeats: number) => {
    const confirmText =
      bookedSeats > 0
        ? `Xóa lịch chiếu này sẽ phải hoàn tiền cho ${bookedSeats} người đã đặt vé. Bạn có chắc chắn muốn xóa?`
        : "Hành động này không thể hoàn tác";

    const confirm = await Swal.fire({
      title: "Xóa lịch chiếu?",
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;

    try {
      setDeletingId(id);
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
    } finally {
      setDeletingId(null);
    }
  };

  async function exportAllCSV() {
    try {
      const criteria = {
        provinceId: provinceFilter || undefined,
        theaterId: theaterFilter || undefined,
        roomId: roomFilter || undefined,
        movieId: movieFilter || undefined,
      };

      const allShowtimesResp = await showtimeService.adminSearch(
        criteria,
        1,
        10000,
        "startTime",
        "asc"
      );
      const allShowtimes = allShowtimesResp.data || [];

      const headers = [
        "Phim",
        "Rạp",
        "Tỉnh/Thành",
        "Phòng",
        "Thời gian bắt đầu",
        "Thời gian kết thúc",
        "Ghế trống",
        "Ghế đã đặt",
        "Tổng ghế",
      ];

      const rows = allShowtimes.map((st) => [
        st.movieTitle,
        st.theaterName,
        st.provinceName,
        st.roomName,
        dayjs(st.startTime).format("DD/MM/YYYY HH:mm"),
        dayjs(st.endTime).format("DD/MM/YYYY HH:mm"),
        st.availableSeats,
        st.bookedSeats,
        st.totalSeats,
      ]);

      const csvContent =
        "\uFEFF" +
        [headers, ...rows]
          .map((r) =>
            r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")
          )
          .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `all_showtimes_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: `Đã xuất ${allShowtimes.length} lịch chiếu (CSV)`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi xuất file",
        text: "Không thể xuất dữ liệu. Vui lòng thử lại.",
      });
    }
  }

  async function exportAllExcel() {
    try {
      const criteria = {
        provinceId: provinceFilter || undefined,
        theaterId: theaterFilter || undefined,
        roomId: roomFilter || undefined,
        movieId: movieFilter || undefined,
      };

      const allShowtimesResp = await showtimeService.adminSearch(
        criteria,
        1,
        10000,
        "startTime",
        "asc"
      );
      const allShowtimes = allShowtimesResp.data || [];

      const wb = XLSX.utils.book_new();
      const wsData = [
        [
          "Phim",
          "Rạp",
          "Tỉnh/Thành",
          "Phòng",
          "Thời gian bắt đầu",
          "Thời gian kết thúc",
          "Ghế trống",
          "Ghế đã đặt",
          "Tổng ghế",
        ],
        ...allShowtimes.map((st) => [
          st.movieTitle,
          st.theaterName,
          st.provinceName,
          st.roomName,
          dayjs(st.startTime).format("DD/MM/YYYY HH:mm"),
          dayjs(st.endTime).format("DD/MM/YYYY HH:mm"),
          st.availableSeats,
          st.bookedSeats,
          st.totalSeats,
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const colWidths = wsData[0].map((_, colIndex) => {
        const maxLength = Math.max(
          ...wsData.map((row) => String(row[colIndex] || "").length)
        );
        return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
      });
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Danh sách lịch chiếu");
      XLSX.writeFile(
        wb,
        `all_showtimes_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      Swal.fire({
        icon: "success",
        title: `Đã xuất ${allShowtimes.length} lịch chiếu (Excel)`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi xuất file Excel",
        text: "Không thể xuất dữ liệu. Vui lòng thử lại.",
      });
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-md">
        {/* Filters skeleton */}
        <div className="flex flex-col md:flex-row gap-3 mb-3">
          <div className="h-10 bg-gray-200 rounded-lg flex-1 animate-pulse"></div>
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Table skeleton */}
        <div className="overflow-x-auto rounded-lg border border-gray-400">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 7 }).map((_, idx) => (
                  <th key={idx} className="px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400 bg-white">
              {Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {Array.from({ length: 7 }).map((_, colIdx) => (
                    <td key={colIdx} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination skeleton */}
        <div className="flex justify-between items-center pt-4">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-md">
      {/* Filters Row 1: Search + Export buttons */}
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

        <button
          type="button"
          onClick={() => exportAllCSV()}
          className="flex items-center gap-2 px-3 py-2 text-sm 
                    border border-gray-400 rounded-lg 
                    bg-white text-gray-700 hover:bg-gray-50
                    whitespace-nowrap shrink-0"
        >
          <Download size={16} /> Export CSV
        </button>

        <button
          type="button"
          onClick={() => exportAllExcel()}
          className="flex items-center gap-2 px-3 py-2 text-sm 
                    border border-gray-400 rounded-lg 
                    bg-green-600 text-white hover:bg-green-700
                    whitespace-nowrap shrink-0"
        >
          <Download size={16} /> Export Excel
        </button>
      </div>

      {/* Filters Row 2: Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div>
          <CustomDropdown
            options={[
              { value: "", label: "Tất cả phim" },
              ...filterMovies.map((m: any) => ({
                value: m.id,
                label: m.title,
              })),
            ]}
            value={movieFilter}
            onChange={(value) => {
              setMovieFilter(value);
              setPaging((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Tất cả phim"
            fullWidth
          />
        </div>

        <div>
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
            fullWidth
          />
        </div>

        <div>
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
            fullWidth
          />
        </div>

        <div>
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
            fullWidth
          />
        </div>
      </div>

      {/* Filters Row 3: Date and Time inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Từ ngày
          </label>
          <DateInput
            value={startOfDayFilter}
            onChange={(value) => {
              setStartOfDayFilter(value);
              setPaging((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Từ ngày"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Từ giờ
          </label>
          <input
            type="time"
            value={fromTimeFilter}
            onChange={(e) => {
              setFromTimeFilter(e.target.value);
              setPaging((p) => ({ ...p, page: 1 }));
            }}
            className="w-full px-2 py-2 text-sm rounded-lg bg-white border border-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Đến ngày
          </label>
          <DateInput
            value={endOfDayFilter}
            onChange={(value) => {
              setEndOfDayFilter(value);
              setPaging((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Đến ngày"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Đến giờ
          </label>
          <input
            type="time"
            value={toTimeFilter}
            onChange={(e) => {
              setToTimeFilter(e.target.value);
              setPaging((p) => ({ ...p, page: 1 }));
            }}
            className="w-full px-2 py-2 text-sm rounded-lg bg-white border border-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
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
              <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bắt đầu
              </th>
              <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kết thúc
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
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">
                        {dayjs(st.startTime).format("DD/MM/YYYY")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {dayjs(st.startTime).format("HH:mm")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">
                        {dayjs(st.endTime).format("DD/MM/YYYY")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {dayjs(st.endTime).format("HH:mm")}
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
                        onClick={() => deleteShowtime(st.id, st.bookedSeats)}
                        disabled={deletingId === st.id}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Xóa lịch chiếu"
                      >
                        {deletingId === st.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
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
