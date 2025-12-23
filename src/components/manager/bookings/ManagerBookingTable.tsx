"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Ticket,
  Film,
  User,
  X,
  Calendar,
  Building2,
} from "lucide-react";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

import { bookingService } from "@/services/booking/booking.service";
import { movieManagementService } from "@/services/movie/movieManagementService";
import { paymentService } from "@/services/payment/payment.service";
import { managerService, userProfileService } from "@/services/userprofile";
import type { BookingResponse } from "@/types/booking/booking.type";
import type { PageResponse } from "@/types/PageResponse";
import { useDebounce } from "@/hooks/useDebounce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { useAuthStore } from "@/stores/authStore";
import OverviewBookingCards from "@/components/admin/bookings/OverviewBookingCards";

const STATUS_LABELS: Record<string, string> = {
  ALL: "Tất cả",
  PENDING: "Đang chờ",
  AWAITING_PAYMENT: "Chờ thanh toán",
  CONFIRMED: "Đã đặt",
  EXPIRED: "Hết hạn",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-800",
  AWAITING_PAYMENT: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  EXPIRED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-blue-100 text-blue-800",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  ZALOPAY: "ZaloPay",
  VNPAY: "VNPay",
  MOMO: "MoMo",
};

const ITEMS_PER_PAGE = 10;

export default function ManagerBookingTable(): React.JSX.Element {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [paging, setPaging] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manager's theater info
  const [managedTheaterName, setManagedTheaterName] = useState<string>("");
  const [loadingTheater, setLoadingTheater] = useState(true);

  // Search & filters
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [movieFilter, setMovieFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Dropdown data
  const [movies, setMovies] = useState<any[]>([]);

  // Modal detail
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalBooking, setModalBooking] = useState<BookingResponse | null>(
    null
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [modalPaymentMethod, setModalPaymentMethod] = useState<string | null>(
    null
  );

  useBodyScrollLock(isModalOpen);

  // Load manager's theater
  useEffect(() => {
    loadManagerTheater();
  }, [user]);

  const loadManagerTheater = async () => {
    if (!user?.id) return;

    setLoadingTheater(true);
    try {
      const profile = await userProfileService.getProfileByUserId(user.id);
      const managerInfo = await managerService.getManagerByUser(profile.id);
      setManagedTheaterName(managerInfo.managedCinemaName);
    } catch (error) {
      console.error("Error loading manager theater:", error);
      Swal.fire({
        icon: "error",
        title: "Không thể tải thông tin rạp",
        text: "Vui lòng thử lại sau",
      });
    } finally {
      setLoadingTheater(false);
    }
  };

  // Load movies for filter
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const res = await movieManagementService.adminList({
          page: 1,
          size: 1000,
        });
        setMovies(res.data ?? []);
      } catch (err) {
        console.error("Error loading movies:", err);
      }
    };
    loadMovies();
  }, []);

  // Fetch bookings when theater is loaded
  useEffect(() => {
    if (managedTheaterName) {
      fetchBookings(1, true);
    }
  }, [managedTheaterName]);

  // Refetch when filters change
  useEffect(() => {
    if (!loading && managedTheaterName) {
      fetchBookings(1, false);
    }
  }, [selectedStatus, debouncedSearch, movieFilter, fromDate, toDate]);

  const fetchBookings = async (page = 1, showSkeleton = false) => {
    if (!managedTheaterName) return;

    try {
      if (showSkeleton) setLoading(true);
      else setIsRefreshing(true);

      const params: any = {
        page: page - 1,
        size: ITEMS_PER_PAGE,
        bookingCode: debouncedSearch || undefined,
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        movieId: movieFilter || undefined,
        theaterName: managedTheaterName, // Filter by manager's theater
        fromDate: fromDate ? `${fromDate}T00:00:00` : undefined,
        toDate: toDate ? `${toDate}T23:59:59` : undefined,
        sortBy: "createdAt",
        sortDir: "desc",
      };

      const pageResp: PageResponse<BookingResponse> =
        await bookingService.getBookings(params);

      const items = pageResp.data ?? [];
      setBookings(items);
      setPaging({
        page: (pageResp.page ?? 0) + 1,
        totalPages: pageResp.totalPages ?? 1,
        total: pageResp.totalElements ?? items.length,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Không thể tải danh sách booking" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const goToNextPage = () => {
    if (paging.page < paging.totalPages && !isRefreshing) {
      setPaging((p) => ({ ...p, page: p.page + 1 }));
      fetchBookings(paging.page + 1, false);
    }
  };

  const goToPrevPage = () => {
    if (paging.page > 1 && !isRefreshing) {
      setPaging((p) => ({ ...p, page: p.page - 1 }));
      fetchBookings(paging.page - 1, false);
    }
  };

  async function openModal(id: string) {
    setIsModalOpen(true);
    setIsDetailLoading(true);
    setModalPaymentMethod(null);
    try {
      const detail = await bookingService.getBookingById(id);
      setModalBooking(detail);

      if (detail.status === "CONFIRMED" && detail.bookingId) {
        try {
          const paymentResp = await paymentService.getPayments({
            page: 0,
            size: 1,
            bookingId: detail.bookingId,
            status: "SUCCESS",
          });
          if (paymentResp.data && paymentResp.data.length > 0) {
            setModalPaymentMethod(paymentResp.data[0].method);
          }
        } catch (paymentErr) {
          console.log("Could not fetch payment info:", paymentErr);
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Không thể tải chi tiết booking" });
      setIsModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setModalBooking(null);
    setModalPaymentMethod(null);
  }

  const getName = (b: BookingResponse) => {
    if (b.userId) return b.fullName ?? "Chưa có tên";
    return b.guestName ?? "Khách vãng lai";
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value) + "đ";

  async function exportAllCSV() {
    try {
      const allBookingsResponse = await bookingService.getBookings({
        page: 0,
        size: 10000,
        theaterName: managedTheaterName,
        movieId: movieFilter || undefined,
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        fromDate: fromDate ? `${fromDate}T00:00:00` : undefined,
        toDate: toDate ? `${toDate}T23:59:59` : undefined,
      });
      const allBookings = allBookingsResponse.data || [];

      const headers = [
        "Mã booking",
        "Khách hàng",
        "Phim",
        "Phòng",
        "Suất chiếu",
        "Trạng thái",
        "Thành tiền",
      ];
      const rows = allBookings.map((b) => [
        b.bookingCode,
        getName(b),
        b.movieTitle || "",
        b.roomName || "",
        b.showDateTime ? dayjs(b.showDateTime).format("DD/MM/YYYY HH:mm") : "",
        STATUS_LABELS[b.status] || b.status,
        b.finalPrice,
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
      a.download = `bookings_${managedTheaterName}_${dayjs().format("YYYY-MM-DD")}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: `Đã xuất ${allBookings.length} booking`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire({ icon: "error", title: "Lỗi xuất file" });
    }
  }

  async function exportAllExcel() {
    try {
      const allBookingsResponse = await bookingService.getBookings({
        page: 0,
        size: 10000,
        theaterName: managedTheaterName,
        movieId: movieFilter || undefined,
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        fromDate: fromDate ? `${fromDate}T00:00:00` : undefined,
        toDate: toDate ? `${toDate}T23:59:59` : undefined,
      });
      const allBookings = allBookingsResponse.data || [];

      const wb = XLSX.utils.book_new();
      const wsData = [
        [
          "Mã booking",
          "Khách hàng",
          "Phim",
          "Phòng",
          "Suất chiếu",
          "Trạng thái",
          "Thành tiền",
        ],
        ...allBookings.map((b) => [
          b.bookingCode,
          getName(b),
          b.movieTitle || "",
          b.roomName || "",
          b.showDateTime
            ? dayjs(b.showDateTime).format("DD/MM/YYYY HH:mm")
            : "",
          STATUS_LABELS[b.status] || b.status,
          b.finalPrice,
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = [
        { wch: 12 },
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 },
        { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, "Đặt vé");
      XLSX.writeFile(
        wb,
        `bookings_${managedTheaterName}_${dayjs().format("YYYY-MM-DD")}.xlsx`
      );

      Swal.fire({
        icon: "success",
        title: `Đã xuất ${allBookings.length} booking`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire({ icon: "error", title: "Lỗi xuất file Excel" });
    }
  }

  // Loading skeleton
  if (loadingTheater || loading) {
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
          <div className="h-10 bg-gray-200 rounded-lg w-full md:w-1/3 animate-pulse mb-4"></div>
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
        <OverviewBookingCards />

        <div className="bg-white border border-gray-400 rounded-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Đặt vé tại {managedTheaterName}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportAllCSV}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-400 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
              >
                <Download size={16} /> CSV
              </button>
              <button
                onClick={exportAllExcel}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-400 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                <Download size={16} /> Excel
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center w-full md:w-auto md:flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo mã booking..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white border border-gray-400 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <CustomDropdown
              options={[
                { value: "", label: "Tất cả phim" },
                ...movies.map((m) => ({ value: m.id, label: m.title })),
              ]}
              value={movieFilter}
              onChange={setMovieFilter}
              placeholder="Tất cả phim"
            />

            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-400 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-400 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Status filter bar */}
          <div className="flex space-x-2 mb-4 overflow-x-auto">
            <div className="flex border border-gray-400 rounded-lg p-0.5 bg-gray-50">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedStatus(key)}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
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
                  <th className="w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mã booking
                  </th>
                  <th className="w-[150px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Khách hàng
                  </th>
                  <th className="w-[180px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phim
                  </th>
                  <th className="w-[100px] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="w-[100px] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Tổng tiền
                  </th>
                  <th className="w-[80px] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-400 bg-white">
                {bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-10 text-gray-500 italic text-sm"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr
                      key={b.bookingId}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Ticket size={16} className="text-yellow-600" />
                          <span className="font-medium">{b.bookingCode}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-blue-600" />
                          <span className="truncate">{getName(b)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Film size={16} className="text-purple-600" />
                          <span className="truncate">
                            {b.movieTitle || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[b.status] || "bg-gray-100 text-gray-800"}`}
                        >
                          {STATUS_LABELS[b.status] || b.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(b.finalPrice)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => openModal(b.bookingId)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center pt-4">
            <span className="text-sm text-gray-700">
              Trang {paging.page}/{paging.totalPages} • {paging.total} booking
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

      {/* Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-3xl bg-white border border-gray-400 rounded-2xl shadow-2xl z-10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                Chi tiết đặt vé
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {isDetailLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                </div>
              ) : modalBooking ? (
                <div className="space-y-6">
                  {/* Thông tin cơ bản */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Thông tin đặt vé
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Mã booking</p>
                        <p className="font-semibold text-gray-900">
                          {modalBooking.bookingCode}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[modalBooking.status] || "bg-gray-100 text-gray-800"}`}
                        >
                          {STATUS_LABELS[modalBooking.status] ||
                            modalBooking.status}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Khách hàng</p>
                        <p className="font-semibold text-gray-900">
                          {getName(modalBooking)}
                        </p>
                      </div>
                      {modalPaymentMethod && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Phương thức thanh toán
                          </p>
                          <p className="font-semibold text-gray-900">
                            {PAYMENT_METHOD_LABELS[modalPaymentMethod] ||
                              modalPaymentMethod}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thông tin suất chiếu */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Thông tin suất chiếu
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Phim</p>
                        <p className="font-semibold text-gray-900">
                          {modalBooking.movieTitle || "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">
                          Phòng chiếu
                        </p>
                        <p className="font-semibold text-gray-900">
                          {modalBooking.roomName || "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Suất chiếu</p>
                        <p className="font-semibold text-gray-900">
                          {modalBooking.showDateTime
                            ? dayjs(modalBooking.showDateTime).format(
                                "DD/MM/YYYY HH:mm"
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ghế đã đặt */}
                  {modalBooking.seats && modalBooking.seats.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Ghế đã đặt
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {modalBooking.seats.map((seat) => (
                          <span
                            key={seat.seatId}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                          >
                            {seat.seatNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Thanh toán */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Thanh toán
                    </h4>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Tổng tiền</span>
                        <span className="font-medium">
                          {formatCurrency(modalBooking.totalPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Giảm giá</span>
                        <span className="font-medium text-green-600">
                          -{formatCurrency(modalBooking.discountAmount)}
                        </span>
                      </div>
                      <div className="border-t border-yellow-300 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-800">
                            Thành tiền
                          </span>
                          <span className="font-bold text-xl text-yellow-600">
                            {formatCurrency(modalBooking.finalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">Không có dữ liệu</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
