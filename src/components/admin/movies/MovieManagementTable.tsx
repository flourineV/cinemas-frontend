// src/components/admin/MovieManagementTable.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Download,
} from "lucide-react";
import Swal from "sweetalert2";

import { movieManagementService } from "@/services/movie/movieManagementService";
import type {
  MovieSummary,
  MovieDetail,
  MovieStatus,
} from "@/types/movie/movie.type";
import type { GetMoviesParams } from "@/types/movie/stats.type";
import type { PageResponse } from "@/types/PageResponse";
import { useDebounce } from "@/hooks/useDebounce";
import { GENRES_OPTIONS } from "@/constants/MovieGenres";

const ITEMS_PER_PAGE = 10;

interface MovieManagementTableProps {
  status: MovieStatus;
  title: string;
}

export default function MovieManagementTable({
  status,
  title,
}: MovieManagementTableProps): React.JSX.Element {
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [paging, setPaging] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // search + debounce
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  // genres filter
  const [selectedGenre, setSelectedGenre] = useState<string>("Tất cả");

  // modal state: previewMovie = MovieSummary shown immediately;
  // modalMovie = MovieDetail, loaded lazily when entering edit mode
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMovie, setPreviewMovie] = useState<MovieSummary | null>(null);
  const [modalMovie, setModalMovie] = useState<MovieDetail | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

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
        status,
        genres:
          selectedGenre && selectedGenre !== "Tất cả"
            ? selectedGenre
            : undefined,
        sortBy: "title",
        sortType: "ASC",
      };

      // movieManagementService.adminList trả PageResponse<MovieSummary>
      const pageResp: PageResponse<MovieSummary> =
        await movieManagementService.adminList(params);

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
    fetchMovies(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedGenre]);

  useEffect(() => {
    if (!loading) {
      fetchMovies(paging.page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paging.page]);

  const goToNextPage = () => {
    if (paging.page < paging.totalPages && !isRefreshing)
      setPaging((p) => ({ ...p, page: p.page + 1 }));
  };
  const goToPrevPage = () => {
    if (paging.page > 1 && !isRefreshing)
      setPaging((p) => ({ ...p, page: p.page - 1 }));
  };

  // actions
  async function onDelete(id: string) {
    const confirm = await Swal.fire({
      title: "Xóa phim?",
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      background: "#0b1020",
      color: "#fff",
    });
    if (!confirm.isConfirmed) return;
    try {
      await movieManagementService.deleteMovie(id);
      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        timer: 900,
        showConfirmButton: false,
        background: "#0b1020",
        color: "#fff",
      });
      fetchMovies(paging.page);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Xóa thất bại",
        background: "#0b1020",
        color: "#fff",
      });
    }
  }

  // open modal quickly using MovieSummary (no API call)
  function openModalWithSummary(summary: MovieSummary) {
    setPreviewMovie(summary);
    setModalMovie(null); // clear any previously loaded detail
    setIsEditMode(false);
    setIsModalOpen(true);
    setIsDetailLoading(false);
  }

  function closeModal() {
    setIsModalOpen(false);
    setPreviewMovie(null);
    setModalMovie(null);
    setIsEditMode(false);
    setIsDetailLoading(false);
  }

  // when user wants to edit, fetch full MovieDetail lazily (if not already)
  async function openEditMode() {
    if (!previewMovie) return;
    if (modalMovie) {
      setIsEditMode(true);
      return;
    }

    try {
      setIsDetailLoading(true);
      const detail = await movieManagementService.getByUuid(
        String(previewMovie.id)
      );
      setModalMovie(detail);
      setIsEditMode(true);
    } catch (err) {
      console.error("load detail error", err);
      Swal.fire({ icon: "error", title: "Không thể tải chi tiết phim" });
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function submitMovieUpdate() {
    // if editing, modalMovie must contain details
    if (!modalMovie) return;
    try {
      await movieManagementService.updateMovie(modalMovie.id, modalMovie);
      Swal.fire({
        icon: "success",
        title: "Cập nhật phim thành công",
        timer: 900,
        showConfirmButton: false,
        background: "#0b1020",
        color: "#fff",
      });
      setIsEditMode(false);
      // refresh list and update previewMovie if open
      fetchMovies(paging.page);
      // reflect updated title/status in preview if present
      setPreviewMovie((prev) =>
        prev && modalMovie
          ? {
              ...prev,
              title: modalMovie.title,
              posterUrl: modalMovie.posterUrl,
              time: modalMovie.time,
              genres: modalMovie.genres,
              status: (modalMovie as any).status,
            }
          : prev
      );
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Cập nhật thất bại",
        background: "#0b1020",
        color: "#fff",
      });
    }
  }

  async function changeStatus(id: string, newStatus: string) {
    const confirm = await Swal.fire({
      title: "Xác nhận đổi trạng thái?",
      text: `Đổi trạng thái phim thành "${newStatus}"`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đổi",
      background: "#0b1020",
      color: "#fff",
    });
    if (!confirm.isConfirmed) return;

    try {
      await movieManagementService.changeStatus(id, newStatus);
      Swal.fire({
        icon: "success",
        title: "Đổi trạng thái thành công",
        timer: 900,
        showConfirmButton: false,
        background: "#0b1020",
        color: "#fff",
      });
      fetchMovies(paging.page);

      // if previewing the same movie, update preview quickly
      if (previewMovie && String(previewMovie.id) === String(id)) {
        setPreviewMovie({ ...previewMovie, status: status as any });
      }

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
        background: "#0b1020",
        color: "#fff",
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
      "startDate",
      "endDate",
    ];
    const rows = movies.map((m) => [
      m.id,
      m.tmdbId,
      m.title,
      m.status ?? "",
      m.time,
      (m.genres || []).join("|"),
      m.startDate ?? "",
      m.endDate ?? "",
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
    a.download = `movies_${status.toLowerCase()}_page_${paging.page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // skeleton
  if (loading) {
    return (
      <div className="bg-black/60 backdrop-blur-md border border-yellow-400/40 rounded-2xl p-6 shadow-2xl text-white">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4">
          {title}
        </h2>
        <div className="text-center text-gray-400 py-10">
          Đang tải danh sách phim...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-black/60 backdrop-blur-md border border-yellow-400/40 rounded-2xl p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center w-full md:flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
            <input
              type="text"
              placeholder="Tìm kiếm tiêu đề, TMDB id..."
              className="w-full pl-10 pr-4 py-2 text-base rounded-lg bg-black/30 border border-yellow-400/40 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 transition"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPaging((p) => ({ ...p, page: 1 }));
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                setPaging((p) => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 text-sm font-medium bg-black/40 border border-yellow-400/40 rounded-lg text-white hover:bg-black/50 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            >
              {GENRES_OPTIONS.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>

            <button
              onClick={() => exportCurrentCSV()}
              className="flex items-center gap-2 px-3.5 py-2 text-sm border border-yellow-400/40 rounded-lg bg-black/40 text-white hover:bg-black/50 whitespace-nowrap shrink-0"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg relative border border-yellow-400/40">
          {isRefreshing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm pointer-events-none z-10 rounded-lg">
              <Loader2 className="animate-spin w-6 h-6 text-yellow-300" />
            </div>
          )}

          <table
            className="min-w-full divide-y divide-yellow-400/80 table-fixed"
            style={{ tableLayout: "fixed", width: "100%" }}
          >
            <thead className="sticky top-0 z-10 border-b border-yellow-400/70">
              <tr className="bg-yellow-500/20 text-yellow-300">
                <th className="w-[240px] px-6 py-3 text-left text-sm font-bold text-yellow-400 uppercase">
                  Phim
                </th>
                <th className="w-[90px] px-6 py-3 text-center text-sm font-bold text-yellow-400 uppercase">
                  TMDB
                </th>
                <th className="w-[110px] px-6 py-3 text-center text-sm font-bold text-yellow-400 uppercase">
                  Thời lượng
                </th>
                <th className="w-[140px] px-6 py-3 text-center text-sm font-bold text-yellow-400 uppercase">
                  Thể loại
                </th>
                <th className="w-[190px] px-6 py-3 text-center text-sm font-bold text-yellow-400 uppercase">
                  Thời gian chiếu
                </th>
                <th className="w-[160px] px-6 py-3 text-right text-sm font-bold text-yellow-400 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-yellow-400/40 relative">
              {movies.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-yellow-100 italic text-base"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                movies.map((m) => (
                  <tr
                    key={String(m.id)}
                    className={`transition duration-150 ${
                      isRefreshing ? "opacity-60 pointer-events-none" : ""
                    } hover:bg-black/40`}
                  >
                    <td className="px-6 py-3 text-base text-yellow-100 text-left truncate">
                      <div className="flex flex-col">
                        <span className="font-semibold text-yellow-300 truncate text-base">
                          {m.title}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-3 text-center text-base text-yellow-100 truncate">
                      {m.tmdbId}
                    </td>

                    <td className="px-6 py-3 text-center text-base text-yellow-100 truncate">
                      {m.time ? `${m.time}ʼ` : "-"}
                    </td>

                    <td className="px-6 py-3 text-center text-base text-yellow-100">
                      {(m.genres || []).map((g, i) => (
                        <div key={i}>{g}</div>
                      ))}
                    </td>

                    <td className="px-6 py-3 text-center text-base text-yellow-100 truncate">
                      {m.startDate
                        ? m.endDate
                          ? `${new Date(m.startDate).toLocaleDateString("vi-VN")} - ${new Date(
                              m.endDate
                            ).toLocaleDateString("vi-VN")}`
                          : `${new Date(m.startDate).toLocaleDateString("vi-VN")} - ...`
                        : "-"}
                    </td>

                    <td className="px-6 py-3 text-right text-base font-medium">
                      <div className="flex items-right justify-end gap-2">
                        <button
                          title=""
                          onClick={() => openModalWithSummary(m)}
                          className="px-2 py-1 rounded text-base text-white flex items-center gap-2"
                        >
                          <Edit2 size={20} />
                        </button>

                        <button
                          title="Xóa"
                          onClick={() => onDelete(String(m.id))}
                          className="px-2 py-1 rounded text-base text-red-400"
                        >
                          <Trash2 size={20} />
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
          <span className="text-base text-yellow-100">
            Trang {paging.page}/{paging.totalPages} • {paging.total} phim
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={paging.page <= 1 || isRefreshing}
              className={`p-2 rounded-md transition ${
                paging.page <= 1 || isRefreshing
                  ? "text-yellow-100/50 cursor-not-allowed"
                  : "text-yellow-100 hover:bg-black/40"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={goToNextPage}
              disabled={paging.page >= paging.totalPages || isRefreshing}
              className={`p-2 rounded-md transition ${
                paging.page >= paging.totalPages || isRefreshing
                  ? "text-yellow-100/50 cursor-not-allowed"
                  : "text-yellow-100 hover:bg-black/40"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: preview + edit (lazy load detail) */}
      {isModalOpen && (previewMovie || modalMovie) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-2xl bg-black/60 border border-yellow-400/40 rounded-2xl p-6 shadow-2xl text-white z-10">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold mb-3 text-yellow-400">
                {isEditMode ? "Chỉnh sửa phim" : "Chi tiết phim"}
              </h3>
              <div className="flex gap-2">
                {!isEditMode && (
                  <button
                    onClick={openEditMode}
                    className="px-3 py-2 rounded-lg bg-yellow-400 text-black font-medium hover:bg-yellow-300"
                  >
                    Sửa
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="px-3 py-2 rounded-lg text-yellow-100 hover:bg-black/40"
                >
                  Đóng
                </button>
              </div>
            </div>

            {/* form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm text-white/80">Tiêu đề</label>
                <input
                  value={
                    isEditMode
                      ? (modalMovie?.title ?? "")
                      : (previewMovie?.title ?? "")
                  }
                  disabled={!isEditMode}
                  onChange={(e) =>
                    setModalMovie((prev) =>
                      prev ? { ...prev, title: e.target.value } : prev
                    )
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-yellow-400/30 text-white"
                />
              </div>

              {/* TMDB ID */}
              <div>
                <label className="block text-sm text-white/80">TMDB ID</label>
                <input
                  value={String(
                    isEditMode
                      ? (modalMovie?.tmdbId ?? "")
                      : (previewMovie?.tmdbId ?? "")
                  )}
                  disabled
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-yellow-400/30 text-white"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm text-white/80">
                  Thời lượng (phút)
                </label>
                <input
                  type="number"
                  value={
                    isEditMode
                      ? (modalMovie?.time ?? "")
                      : (previewMovie?.time ?? "")
                  }
                  disabled={!isEditMode}
                  onChange={(e) =>
                    setModalMovie((prev) =>
                      prev
                        ? { ...prev, time: Number(e.target.value) || 0 }
                        : prev
                    )
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-yellow-400/30 text-white"
                />
              </div>

              {/* Release date */}
              <div>
                <label className="block text-sm text-white/80">
                  Ngày phát hành
                </label>
                <input
                  type="date"
                  value={
                    isEditMode
                      ? (modalMovie as any)?.releaseDate
                        ? (modalMovie as any).releaseDate.split("T")[0]
                        : ""
                      : (previewMovie as any)?.releaseDate
                        ? (previewMovie as any).releaseDate.split("T")[0]
                        : ""
                  }
                  disabled={!isEditMode}
                  onChange={(e) =>
                    setModalMovie((prev) =>
                      prev ? { ...prev, releaseDate: e.target.value } : prev
                    )
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-yellow-400/30 text-white"
                />
              </div>

              {/* Genres */}
              <div className="md:col-span-2">
                <label className="block text-sm text-white/80">
                  Thể loại (phân cách bằng dấu phẩy)
                </label>
                <input
                  value={
                    isEditMode
                      ? (modalMovie?.genres || []).join(", ")
                      : (previewMovie?.genres || []).join(", ")
                  }
                  disabled={!isEditMode}
                  onChange={(e) =>
                    setModalMovie((prev) =>
                      prev
                        ? {
                            ...prev,
                            genres: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }
                        : prev
                    )
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-yellow-400/30 text-white"
                />
              </div>

              {/* Overview */}
              <div className="md:col-span-2">
                <label className="block text-sm text-white/80">Mô tả</label>
                <textarea
                  value={
                    isEditMode
                      ? (modalMovie?.overview ?? "")
                      : (previewMovie?.title ?? "")
                  }
                  disabled={!isEditMode}
                  onChange={(e) =>
                    setModalMovie((prev) =>
                      prev ? { ...prev, overview: e.target.value } : prev
                    )
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-yellow-400/30 text-white h-24"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              {isEditMode ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                    }}
                    className="px-3 py-2 rounded-lg text-yellow-100 hover:bg-black/40"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={submitMovieUpdate}
                    className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-medium hover:bg-yellow-300"
                  >
                    Lưu
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      changeStatus(
                        String(previewMovie?.id ?? modalMovie?.id ?? ""),
                        String(
                          (previewMovie as any)?.status ??
                            (modalMovie as any)?.status
                        ) === "nowPlaying"
                          ? "archived"
                          : "nowPlaying"
                      )
                    }
                    className="px-3 py-2 rounded-lg bg-yellow-400 text-black font-medium hover:bg-yellow-300"
                  >
                    Đổi trạng thái
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
