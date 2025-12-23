"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  ChevronDown,
  Download,
  X,
  Film,
  Star,
  Edit2,
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
import OverviewMovieCards from "@/components/admin/movies/OverviewMovieCards";

const ITEMS_PER_PAGE = 10;

const STATUS_LABELS: Record<string, string> = {
  ALL: "Tất cả",
  NOW_PLAYING: "Đang chiếu",
  UPCOMING: "Sắp chiếu",
  ARCHIVED: "Lưu trữ",
};

export default function ManagerMovieTable(): React.JSX.Element {
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [paging, setPaging] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // search + debounce + filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

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

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalMovie, setModalMovie] = useState<MovieDetail | null>(null);
  const [editMovie, setEditMovie] = useState<MovieDetail | null>(null);
  const [isSavingMovie, setIsSavingMovie] = useState(false);

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
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        sortBy: "popularity",
        sortType: "DESC",
      };

      const pageResp: PageResponse<MovieSummary> =
        await movieManagementService.adminList(params);

      const items = pageResp.data ?? [];
      setMovies(items);
      setPaging({
        page: pageResp.page ?? page,
        totalPages: pageResp.totalPages ?? 1,
        total: pageResp.totalElements ?? items.length ?? 0,
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
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchMovies(1, true);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!loading && token) {
      fetchMovies(paging.page, false);
    }
  }, [selectedStatus, debouncedSearch, paging.page]);

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

  // open modal
  async function openModal(id: string) {
    setIsModalOpen(true);
    try {
      const detail = await movieService.getMovieDetail(id);
      setModalMovie(detail);
      setEditMovie(detail);
    } catch (err) {
      console.error(
        "Failed with movieService, trying movieManagementService:",
        err
      );
      try {
        const detail = await movieManagementService.getByUuid(id);
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
  }

  function toggleEditMode() {
    if (isEditMode) {
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

  function exportCurrentCSV() {
    const headers = [
      "ID",
      "TMDB ID",
      "Tên phim",
      "Trạng thái",
      "Thời lượng",
      "Thể loại",
      "Ngày phát hành",
    ];
    const rows = movies.map((m) => [
      m.id,
      m.tmdbId,
      m.title,
      String((m as any).status ?? ""),
      m.time ? `${m.time} phút` : "",
      (m.genres || []).join(", "),
      (m as any).releaseDate ?? "",
    ]);
    const csv =
      "\uFEFF" +
      [headers, ...rows]
        .map((r) =>
          r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movies_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCurrentExcel() {
    const wb = XLSX.utils.book_new();
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
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 30 },
      { wch: 15 },
      { wch: 12 },
      { wch: 25 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách phim");
    XLSX.writeFile(wb, `movies_${new Date().toISOString().split("T")[0]}.xlsx`);
  }

  // skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-400 rounded-lg p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="h-10 bg-gray-200 rounded-lg w-full md:w-1/3 animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
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
                    {Array.from({ length: 6 }).map((_, colIdx) => (
                      <td key={colIdx} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Overview Cards */}
        <OverviewMovieCards />

        <div className="bg-white border border-gray-400 rounded-lg p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center w-full md:flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tiêu đề, TMDB id..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white border border-gray-400 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
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
                    {selectedGenre === "ALL"
                      ? "Tất cả thể loại"
                      : selectedGenre}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isGenreDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isGenreDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white border border-gray-400 z-20 max-h-60 overflow-y-auto">
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
                onClick={exportCurrentCSV}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-400 rounded-lg bg-white text-gray-700 hover:bg-gray-50 whitespace-nowrap shrink-0"
              >
                <Download size={16} /> Export CSV
              </button>

              <button
                onClick={exportCurrentExcel}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-400 rounded-lg bg-green-600 text-white hover:bg-green-700 whitespace-nowrap shrink-0"
              >
                <Download size={16} /> Export Excel
              </button>
            </div>
          </div>

          {/* Status filter bar */}
          <div className="flex space-x-2 mb-4">
            <div className="flex border border-gray-400 rounded-lg p-0.5 bg-gray-50">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedStatus(key);
                    setPaging((p) => ({ ...p, page: 1 }));
                  }}
                  className={`px-4 py-1 text-base font-medium rounded-lg transition-colors ${
                    selectedStatus === key
                      ? "bg-yellow-500 text-white shadow-sm font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg relative border border-gray-400">
            {isRefreshing && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm pointer-events-none z-10 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              </div>
            )}

            <table className="min-w-full divide-y divide-gray-400 table-fixed">
              <thead className="sticky top-0 z-10 border-b border-gray-400 bg-gray-50">
                <tr>
                  <th className="w-[220px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên phim
                  </th>
                  <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TMDB ID
                  </th>
                  <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời lượng
                  </th>
                  <th className="w-[140px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thể loại
                  </th>
                  <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Popularity
                  </th>
                  <th className="w-[120px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-400 relative bg-white">
                {filteredMovies.length === 0 ? (
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
      </div>

      {/* Modal: preview + edit */}
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

          <div className="relative w-full max-w-4xl bg-white border border-gray-400 rounded-lg p-6 shadow-xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="space-y-8">
              {/* Header with movie info */}
              <div className="relative flex items-start gap-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>

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
                      value={String((modalMovie as any).status ?? "-")}
                      raw={(modalMovie as any).status ?? undefined}
                    />
                    {modalMovie.time && (
                      <span className="text-sm text-gray-600">
                        {modalMovie.time} phút
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Movie details */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-lg font-semibold text-gray-800">
                    Thông tin phim
                  </h5>
                  <button
                    onClick={toggleEditMode}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isEditMode
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-yellow-500 text-black hover:bg-black hover:text-yellow-500"
                    }`}
                  >
                    <Edit2 size={14} />
                    {isEditMode ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {modalMovie.time || "Chưa cập nhật"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Thể loại
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {(modalMovie.genres || []).join(", ") || "Chưa cập nhật"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày phát hành
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {(modalMovie as any).releaseDate
                        ? new Date(
                            (modalMovie as any).releaseDate
                          ).toLocaleDateString("vi-VN")
                        : "Chưa cập nhật"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Mô tả
                    </label>
                    {isEditMode ? (
                      <textarea
                        value={editMovie?.overview || ""}
                        onChange={(e) =>
                          updateEditMovie("overview", e.target.value)
                        }
                        rows={4}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                        {modalMovie.overview || "Chưa cập nhật"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Đóng
              </button>
              {isEditMode && (
                <button
                  onClick={submitMovieUpdate}
                  disabled={isSavingMovie}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-black hover:text-yellow-500 transition disabled:opacity-50"
                >
                  {isSavingMovie && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  )}
                  Lưu thay đổi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
