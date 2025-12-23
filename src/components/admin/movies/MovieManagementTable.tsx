//scr/components/admin/MovieManagementTable.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Trash2,
  Archive,
  ChevronLeft,
  ChevronRight,
  Eye,
  ChevronDown,
  Download,
  X,
  Film,
  Star,
} from "lucide-react";

import Swal from "sweetalert2";
import * as XLSX from "xlsx";

import { movieManagementService } from "@/services/movie/movieManagementService";
import { movieService } from "@/services/movie/movieService";
import type { MovieSummary, MovieDetail } from "@/types/movie/movie.type";
import type { GetMoviesParams } from "@/types/movie/stats.type";
import type { PageResponse } from "@/types/PageResponse";
import { useDebounce } from "@/hooks/useDebounce";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { Badge } from "@/components/ui/Badge";
import { getPosterUrl } from "@/utils/getPosterUrl";
import OverviewMovieCards from "./OverviewMovieCards";
import AddMovieForm from "./AddMovieForm";
import AdminMovieComments from "./AdminMovieComments";

const ITEMS_PER_PAGE = 10;

// Component cho từng bảng riêng biệt
interface MovieTableProps {
  status: string;
}

function MovieTable({ status }: MovieTableProps) {
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [paging, setPaging] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // search + debounce + filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const genreDropdownRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick(
    genreDropdownRef,
    () => setIsGenreDropdownOpen(false),
    isGenreDropdownOpen
  );

  const allGenres = Array.from(
    new Set(movies.flatMap((m) => m.genres || []))
  ).sort();

  const filteredMovies =
    selectedGenre === "ALL"
      ? movies
      : movies.filter((m) => (m.genres || []).includes(selectedGenre));

  // modal state: chỉ dùng MovieDetail
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalMovie, setModalMovie] = useState<MovieDetail | null>(null);
  const [editMovie, setEditMovie] = useState<MovieDetail | null>(null);
  const [isSavingMovie, setIsSavingMovie] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "comments">("info");

  // Apply scroll lock when modal is open
  useBodyScrollLock(isModalOpen);

  // fetch movies
  const fetchMovies = async (page = 1, showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      else setIsRefreshing(true);

      const params: GetMoviesParams = {
        page,
        size: ITEMS_PER_PAGE,
        keyword:
          debouncedSearch && debouncedSearch.length > 0
            ? debouncedSearch
            : undefined,
        status: status !== "ALL" ? status : undefined,
        sortBy: "popularity",
        sortType: "DESC",
      };

      console.log("📽️ Fetching movies with params:", params);

      // movieManagementService.adminList trả PageResponse<MovieSummary>
      const pageResp: PageResponse<MovieSummary> =
        await movieManagementService.adminList(params);

      console.log("📽️ Movies response:", pageResp);

      const items = pageResp.data ?? [];
      const pageNum = pageResp.page ?? page;
      const totalPages = pageResp.totalPages ?? 1;
      const totalElements = pageResp.totalElements ?? items.length ?? 0;

      setMovies(items);
      setPaging({
        page: pageNum,
        totalPages: totalPages,
        total: totalElements,
      });
    } catch (err) {
      console.error("fetchMovies error", err);
      Swal.fire({ icon: "error", title: "Không thể tải danh sách phim" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Wait for token to be available before fetching
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchMovies(1, true);
    } else {
      console.warn("No access token found, skipping movie fetch");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!loading && token) {
      fetchMovies(paging.page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, paging.page]);

  const goToNextPage = () => {
    if (paging.page < paging.totalPages && !isRefreshing) {
      setPaging((p) => ({ ...p, page: p.page + 1 }));
      // Scroll to section title when changing page
      setTimeout(() => {
        const element = document.getElementById(`movie-table-${status}`);
        if (element) {
          const headerHeight = 200; // Account for fixed header + section title
          const elementTop = element.offsetTop - headerHeight;
          window.scrollTo({ top: elementTop, behavior: "smooth" });
        }
      }, 100);
    }
  };
  const goToPrevPage = () => {
    if (paging.page > 1 && !isRefreshing) {
      setPaging((p) => ({ ...p, page: p.page - 1 }));
      // Scroll to section title when changing page
      setTimeout(() => {
        const element = document.getElementById(`movie-table-${status}`);
        if (element) {
          const headerHeight = 200; // Account for fixed header + section title
          const elementTop = element.offsetTop - headerHeight;
          window.scrollTo({ top: elementTop, behavior: "smooth" });
        }
      }, 100);
    }
  };

  // actions
  async function onDelete(id: string) {
    const confirm = await Swal.fire({
      title: "Xóa phim?",
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;
    try {
      await movieManagementService.deleteMovie(id);
      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        timer: 900,
        showConfirmButton: false,
      });
      fetchMovies(paging.page);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Xóa thất bại",
      });
    }
  }

  // open modal: Movie Detail
  async function openModal(id: string) {
    setIsModalOpen(true);
    try {
      // Try using the same API as MovieDetailPage first
      const detail = await movieService.getMovieDetail(id);
      console.log("Movie detail loaded (movieService):", detail);
      console.log("Overview:", detail.overview);
      console.log("Overview length:", detail.overview?.length);
      setModalMovie(detail);
      setEditMovie(detail); // Initialize edit data
    } catch (err) {
      console.error(
        "Failed with movieService, trying movieManagementService:",
        err
      );
      try {
        // Fallback to management service
        const detail = await movieManagementService.getByUuid(id);
        console.log("Movie detail loaded (movieManagementService):", detail);
        setModalMovie(detail);
        setEditMovie(detail);
      } catch (err2) {
        console.error(err2);
        Swal.fire({ icon: "error", title: "Không thể tải chi tiết phim" });
        setIsModalOpen(false);
      }
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setIsEditMode(false);
    setModalMovie(null);
    setEditMovie(null);
    setIsSavingMovie(false);
    setActiveTab("info");
  }

  // toggle edit mode
  function toggleEditMode() {
    if (isEditMode) {
      // Cancel edit - reset to original data
      setEditMovie(modalMovie);
    }
    setIsEditMode(!isEditMode);
  }

  function updateEditMovie<K extends keyof MovieDetail>(
    key: K,
    value: MovieDetail[K]
  ) {
    setEditMovie((prev) => (prev ? { ...prev, [key]: value } : null));
  }

  async function submitMovieUpdate() {
    if (!editMovie) return;

    setIsSavingMovie(true);
    try {
      const updatedMovie = await movieManagementService.updateMovie(
        editMovie.id,
        editMovie
      );
      setModalMovie(updatedMovie);
      setEditMovie(updatedMovie);
      setIsEditMode(false);

      Swal.fire({
        icon: "success",
        title: "Cập nhật phim thành công",
        timer: 2000,
        showConfirmButton: false,
      });

      // refresh list
      fetchMovies(paging.page);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Cập nhật thất bại",
        text: "Không thể cập nhật thông tin phim.",
      });
    } finally {
      setIsSavingMovie(false);
    }
  }

  async function changeStatus(id: string, currentStatus: string) {
    const targetStatus =
      currentStatus === "NOW_PLAYING" || currentStatus === "UPCOMING"
        ? "ARCHIVED"
        : currentStatus; // nếu đang ARCHIVED, giữ nguyên, không đổi

    const warningText =
      targetStatus === "ARCHIVED"
        ? "\n⚠️ Lưu ý: Nếu đổi sang ARCHIVED, các lịch chiếu hiện có sẽ bị xóa!"
        : "";

    const confirm = await Swal.fire({
      title: "Xác nhận đổi trạng thái?",
      text: `Đổi trạng thái phim từ "${currentStatus}" → "${targetStatus}"${warningText}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đổi",
    });

    if (!confirm.isConfirmed) return;

    try {
      // đổi trạng thái
      await movieManagementService.changeStatus(id, targetStatus);

      // nếu đang chuyển sang ARCHIVED, suspend showtimes
      if (targetStatus === "ARCHIVED") {
        await movieManagementService.suspendShowtimes(id, "Movie archived");
      }

      Swal.fire({
        icon: "success",
        title: "Đổi trạng thái thành công",
        timer: 900,
        showConfirmButton: false,
      });
      fetchMovies(paging.page);

      // if modalMovie loaded and same id, refresh detail
      if (modalMovie && String(modalMovie.id) === String(id)) {
        const refreshed = await movieManagementService.getByUuid(id);
        setModalMovie(refreshed);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Đổi trạng thái thất bại",
      });
    }
  }

  function exportCurrentCSV() {
    const headers = [
      "id",
      "tmdbId",
      "title",
      "status",
      "time",
      "genres",
      "releaseDate",
    ];
    const rows = movies.map((m) => [
      m.id,
      m.tmdbId,
      m.title,
      String((m as any).status ?? ""),
      m.time,
      (m.genres || []).join("|"),
      (m as any).releaseDate ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movies_${status.toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCurrentExcel() {
    // Tạo workbook
    const wb = XLSX.utils.book_new();

    // Tạo worksheet data
    const wsData = [
      [
        "ID",
        "TMDB ID",
        "Tên phim",
        "Trạng thái",
        "Thời lượng",
        "Thể loại",
        "Ngày phát hành",
      ],
      ...movies.map((m) => [
        m.id,
        m.tmdbId,
        m.title,
        String((m as any).status ?? ""),
        m.time ? `${m.time} phút` : "",
        (m.genres || []).join(", "),
        (m as any).releaseDate ?? "",
      ]),
    ];

    // Tạo worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Tự động điều chỉnh độ rộng cột
    const colWidths = [
      { wch: 15 }, // ID
      { wch: 12 }, // TMDB ID
      { wch: 30 }, // Tên phim
      { wch: 15 }, // Trạng thái
      { wch: 12 }, // Thời lượng
      { wch: 25 }, // Thể loại
      { wch: 15 }, // Ngày phát hành
    ];
    ws["!cols"] = colWidths;

    // Thêm worksheet vào workbook
    const sheetName =
      status === "NOW_PLAYING"
        ? "Đang chiếu"
        : status === "UPCOMING"
          ? "Sắp chiếu"
          : "Lưu trữ";
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Xuất file
    XLSX.writeFile(
      wb,
      `movies_${status.toLowerCase()}_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  }

  // skeleton
  if (loading) {
    return (
      <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-md">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center w-full md:flex-1 relative">
            <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Table skeleton */}
        <div className="overflow-x-auto rounded-lg border border-gray-400">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <th key={idx} className="px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400 bg-white">
              {Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: 5 }).map((_, colIdx) => (
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
    <>
      <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-md">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {/* SEARCH: now flex-1 so it takes the remaining space */}
          <div className="flex items-center w-full md:flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tiêu đề, TMDB id..."
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

          <div className="flex items-center gap-2">
            <div className="relative" ref={genreDropdownRef}>
              <button
                onClick={() => setIsGenreDropdownOpen((s) => !s)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium bg-white border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <span className="whitespace-nowrap">
                  {selectedGenre === "ALL" ? "Tất cả thể loại" : selectedGenre}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isGenreDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isGenreDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white border border-gray-400 z-20">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedGenre("ALL");
                        setIsGenreDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        selectedGenre === "ALL"
                          ? "text-yellow-600 bg-yellow-50 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Tất cả thể loại
                    </button>

                    {allGenres.map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setSelectedGenre(g);
                          setIsGenreDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          selectedGenre === g
                            ? "text-yellow-600 bg-yellow-50 font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => exportCurrentCSV()}
              className="flex items-center gap-2 px-3 py-2 text-sm 
             border border-gray-400 rounded-lg 
             bg-white text-gray-700 hover:bg-gray-50
             whitespace-nowrap shrink-0"
            >
              <Download size={16} /> Export CSV
            </button>

            <button
              onClick={() => exportCurrentExcel()}
              className="flex items-center gap-2 px-3 py-2 text-sm 
             border border-gray-400 rounded-lg 
             bg-green-600 text-white hover:bg-green-700
             whitespace-nowrap shrink-0"
            >
              <Download size={16} /> Export Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div
          id={`movie-table-${status}`}
          className="overflow-x-auto rounded-lg relative border border-gray-400"
        >
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
                <th className="w-[220px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên phim
                </th>
                <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TMDB ID
                </th>
                <th className="w-[120px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời lượng
                </th>
                <th className="w-[140px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thể loại
                </th>
                <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Popularity
                </th>
                <th className="w-[140px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="w-[180px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-400 relative bg-white">
              {movies.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-gray-500 italic text-sm"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredMovies.map((m) => (
                  <tr
                    key={String(m.id)}
                    className={`transition duration-150 ${
                      isRefreshing ? "opacity-60 pointer-events-none" : ""
                    } hover:bg-gray-50`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 text-left">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 truncate">
                          {m.title}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {m.posterUrl ? "Has poster" : "No poster"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {m.tmdbId}
                    </td>

                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {m.time ? `${m.time}ʼ` : "-"}
                    </td>

                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      <div className="truncate">
                        {(m.genres || []).join(", ")}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span className="font-medium">
                          {m.popularity?.toFixed(0) || "0"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Badge
                        type="MovieStatus"
                        value={String((m as any).status ?? "-")}
                        raw={(m as any).status ?? undefined}
                      />
                    </td>

                    <td className="px-6 py-3 text-center text-base font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(String(m.id))}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>

                        {status !== "ARCHIVED" && (
                          <button
                            onClick={() => {
                              const currentStatus = (m as any).status;
                              changeStatus(String(m.id), currentStatus);
                            }}
                            className="p-2 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
                            title="Chuyển sang lưu trữ"
                          >
                            <Archive size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => onDelete(String(m.id))}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Xóa phim"
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

        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 gap-3">
          <span className="text-sm text-gray-700">
            Trang {paging.page}/{paging.totalPages} • {paging.total} phim
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

      {/* Modal: preview + edit (lazy load detail) */}
      {isModalOpen && modalMovie && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-4xl bg-white border border-gray-400 rounded-lg p-6 shadow-xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="space-y-8">
              {/* Header with movie info */}
              <div className="relative flex items-start gap-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                {/* Close button */}
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>

                {/* Movie poster */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-28 rounded-lg bg-gradient-to-tr from-yellow-400 via-yellow-500 to-yellow-600 p-1">
                    <div className="w-full h-full rounded-lg bg-white flex items-center justify-center overflow-hidden border-2 border-white">
                      {modalMovie.posterUrl ? (
                        <img
                          src={getPosterUrl(modalMovie.posterUrl)}
                          alt="Movie Poster"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Film className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Movie info */}
                <div className="flex-1 pr-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {modalMovie.title || "Chưa có tên"}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    TMDB ID: {modalMovie.tmdbId}
                  </p>
                  <div className="flex items-center gap-4">
                    <Badge
                      type="MovieStatus"
                      value={modalMovie.status}
                      raw={modalMovie.status}
                    />
                    <span className="text-sm text-gray-500">
                      {modalMovie.time
                        ? `${modalMovie.time} phút`
                        : "Chưa có thời lượng"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "info"
                      ? "border-yellow-500 text-yellow-600 bg-yellow-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Thông tin phim
                </button>
                <button
                  onClick={() => setActiveTab("comments")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "comments"
                      ? "border-yellow-500 text-yellow-600 bg-yellow-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Đánh giá & Bình luận
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "info" ? (
                <>
                  {/* Movie Details */}
                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-3">
                      Thông tin phim
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          TMDB ID
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {modalMovie.tmdbId}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Trạng thái
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {modalMovie.status}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tên phim
                        </label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={editMovie?.title || ""}
                            onChange={(e) =>
                              updateEditMovie("title", e.target.value)
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                            placeholder="Nhập tên phim"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {modalMovie.title || "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Thời lượng (phút)
                        </label>
                        {isEditMode ? (
                          <input
                            type="number"
                            value={editMovie?.time || ""}
                            onChange={(e) =>
                              updateEditMovie("time", Number(e.target.value))
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                            placeholder="Nhập thời lượng"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {modalMovie.time
                              ? `${modalMovie.time} phút`
                              : "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Quốc gia
                        </label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={editMovie?.country || ""}
                            onChange={(e) =>
                              updateEditMovie("country", e.target.value)
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                            placeholder="Nhập quốc gia"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {modalMovie.country || "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ngôn ngữ
                        </label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={(editMovie?.spokenLanguages || []).join(
                              ", "
                            )}
                            onChange={(e) =>
                              updateEditMovie(
                                "spokenLanguages",
                                e.target.value
                                  .split(",")
                                  .map((s: string) => s.trim())
                              )
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                            placeholder="Nhập ngôn ngữ (phân cách bằng dấu phẩy)"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {(modalMovie.spokenLanguages || []).join(", ") ||
                              "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Đội ngũ (Crew)
                        </label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={(editMovie?.crew || []).join(", ")}
                            onChange={(e) =>
                              updateEditMovie(
                                "crew",
                                e.target.value
                                  .split(",")
                                  .map((s: string) => s.trim())
                              )
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                            placeholder="Nhập đội ngũ (phân cách bằng dấu phẩy)"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {(modalMovie.crew || []).join(", ") ||
                              "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Diễn viên (Cast)
                        </label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={(editMovie?.cast || []).join(", ")}
                            onChange={(e) =>
                              updateEditMovie(
                                "cast",
                                e.target.value
                                  .split(",")
                                  .map((s: string) => s.trim())
                              )
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                            placeholder="Nhập diễn viên (phân cách bằng dấu phẩy)"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {(modalMovie.cast || []).join(", ") ||
                              "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ngày phát hành
                        </label>
                        {isEditMode ? (
                          <input
                            type="date"
                            value={editMovie?.releaseDate?.split("T")[0] || ""}
                            onChange={(e) =>
                              updateEditMovie("releaseDate", e.target.value)
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {modalMovie.releaseDate
                              ? new Date(
                                  modalMovie.releaseDate
                                ).toLocaleDateString("vi-VN")
                              : "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Độ phổ biến
                        </label>
                        {isEditMode ? (
                          <input
                            type="number"
                            step="0.1"
                            value={editMovie?.popularity || ""}
                            onChange={(e) =>
                              updateEditMovie(
                                "popularity",
                                Number(e.target.value)
                              )
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                            placeholder="Nhập độ phổ biến"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {modalMovie.popularity || "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ngày bắt đầu
                        </label>
                        {isEditMode ? (
                          <input
                            type="date"
                            value={editMovie?.startDate?.split("T")[0] || ""}
                            onChange={(e) =>
                              updateEditMovie("startDate", e.target.value)
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {modalMovie.startDate
                              ? new Date(
                                  modalMovie.startDate
                                ).toLocaleDateString("vi-VN")
                              : "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ngày kết thúc
                        </label>
                        {isEditMode ? (
                          <input
                            type="date"
                            value={editMovie?.endDate?.split("T")[0] || ""}
                            onChange={(e) =>
                              updateEditMovie("endDate", e.target.value)
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {modalMovie.endDate
                              ? new Date(modalMovie.endDate).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Thể loại
                        </label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={(editMovie?.genres || []).join(", ")}
                            onChange={(e) =>
                              updateEditMovie(
                                "genres",
                                e.target.value
                                  .split(",")
                                  .map((s: string) => s.trim())
                              )
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                            placeholder="Nhập thể loại (phân cách bằng dấu phẩy)"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {(modalMovie.genres || []).join(", ") ||
                              "Chưa cập nhật"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-3">
                      Thông tin bổ sung
                    </h5>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Mô tả
                        </label>
                        {isEditMode ? (
                          <textarea
                            value={editMovie?.overview || ""}
                            onChange={(e) =>
                              updateEditMovie("overview", e.target.value)
                            }
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-black"
                            placeholder="Nhập mô tả phim"
                            rows={4}
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                            {modalMovie.overview && modalMovie.overview.trim()
                              ? modalMovie.overview
                              : "Chưa có mô tả phim"}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Trailer URL
                          </label>
                          {isEditMode ? (
                            <input
                              type="url"
                              value={editMovie?.trailer || ""}
                              onChange={(e) =>
                                updateEditMovie("trailer", e.target.value)
                              }
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                              placeholder="Nhập URL trailer"
                            />
                          ) : (
                            <p className="mt-1 text-sm text-gray-900">
                              {modalMovie.trailer || "Chưa cập nhật"}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Poster URL
                          </label>
                          {isEditMode ? (
                            <input
                              type="url"
                              value={editMovie?.posterUrl || ""}
                              onChange={(e) =>
                                updateEditMovie("posterUrl", e.target.value)
                              }
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                              placeholder="Nhập URL poster"
                            />
                          ) : (
                            <p className="mt-1 text-sm text-gray-900">
                              {modalMovie.posterUrl || "Chưa cập nhật"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Comments Tab */
                <div className="h-96">
                  <AdminMovieComments movieId={modalMovie.id} />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              {isEditMode ? (
                <>
                  <button
                    onClick={toggleEditMode}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    disabled={isSavingMovie}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={submitMovieUpdate}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                    disabled={isSavingMovie}
                  >
                    {isSavingMovie ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleEditMode}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    Chỉnh sửa
                  </button>
                  {status !== "ARCHIVED" && (
                    <button
                      onClick={() => {
                        const currentStatus = modalMovie.status;
                        changeStatus(String(modalMovie.id), currentStatus);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Archive size={16} />
                      Lưu trữ
                    </button>
                  )}
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Đóng
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function MovieManagementTable(): React.JSX.Element {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMovieAdded = () => {
    // Trigger refresh for all movie tables
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-7">
      {/* Movie Stats Overview */}
      <OverviewMovieCards />

      <h3 className="text-2xl font-semibold text-gray-800">
        Thêm phim từ TMDB
      </h3>
      {/* Add Movie Form */}
      <AddMovieForm onSuccess={handleMovieAdded} />

      {/* Bảng 1: Now Playing */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Phim Đang Chiếu
        </h3>
        <MovieTable
          status="NOW_PLAYING"
          key={`now-playing-${refreshTrigger}`}
        />
      </div>

      {/* Bảng 2: Upcoming */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Phim Sắp Chiếu
        </h3>
        <MovieTable status="UPCOMING" key={`upcoming-${refreshTrigger}`} />
      </div>

      {/* Bảng 3: Archived */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Phim Lưu Trữ
        </h3>
        <MovieTable status="ARCHIVED" key={`archived-${refreshTrigger}`} />
      </div>
    </div>
  );
}
