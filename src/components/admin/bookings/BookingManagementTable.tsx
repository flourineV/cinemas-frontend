"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import Swal from "sweetalert2";

import { bookingService } from "@/services/booking/booking.service";
import type { BookingResponse } from "@/types/booking/booking.type";
import type { PageResponse } from "@/types/PageResponse";
import { useDebounce } from "@/hooks/useDebounce";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { Badge } from "@/components/ui/Badge";
import { InputField } from "@/components/ui/FormFields";

const STATUS_LABELS: Record<string, string> = {
  ALL: "Tất cả",
  AWAITING_PAYMENT: "Đang chờ",
  CONFIRMED: "Đã xác nhận",
  EXPIRED: "Hết hạn",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

const ITEMS_PER_PAGE = 10;

export default function BookingManagementTable(): React.JSX.Element {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [paging, setPaging] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick(
    dropdownRef,
    () => setIsStatusDropdownOpen(false),
    isStatusDropdownOpen
  );

  // Modal detail
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalBooking, setModalBooking] = useState<BookingResponse | null>(
    null
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchBookings = async (page = 1, showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      else setIsRefreshing(true);

      const params: any = {
        page: page - 1, // backend page index
        size: ITEMS_PER_PAGE,
        bookingCode: debouncedSearch || undefined,
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
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

  useEffect(() => {
    fetchBookings(1, true);
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchBookings(paging.page, false);
    }
  }, [selectedStatus, debouncedSearch, paging.page]);

  const goToNextPage = () => {
    if (paging.page < paging.totalPages && !isRefreshing)
      setPaging((p) => ({ ...p, page: p.page + 1 }));
  };
  const goToPrevPage = () => {
    if (paging.page > 1 && !isRefreshing)
      setPaging((p) => ({ ...p, page: p.page - 1 }));
  };

  async function onDelete(id: string) {
    const confirm = await Swal.fire({
      title: "Xóa booking?",
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    });
    if (!confirm.isConfirmed) return;
    try {
      await bookingService.deleteBooking(id);
      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        timer: 900,
        showConfirmButton: false,
      });
      fetchBookings(paging.page);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Xóa thất bại" });
    }
  }

  async function openModal(id: string) {
    setIsModalOpen(true);
    setIsDetailLoading(true);
    try {
      const detail = await bookingService.getBookingById(id);
      setModalBooking(detail);
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
  }

  // Chú ý mapping các trường từ BookingResponse
  const getName = (b: BookingResponse) => {
    if (b.userId) {
      return b.fullName ?? "Chưa có tên user";
    }
    return b.guestName ?? "Chưa có tên guest";
  };
  const getShowtimeId = (b: BookingResponse) => b.showtimeId ?? "Chưa có id"; 
  const getMovieTitle = (b: BookingResponse) => b.movieTitle ?? "Chưa có tên"; 
  const getPrice = (b: BookingResponse) => b.finalPrice;
  const getPaymentMethod = (b: BookingResponse) => b.paymentMethod ?? "Chưa có";

  function exportCurrentCSV() {
    const headers = [
      "id",
      "bookingCode",
      "user",
      "showtime",
      "movie",
      "status",
      "paymentMethod",
      "price",
      "createdAt",
    ];
    const rows = bookings.map((b) => [
      b.bookingId,
      b.bookingCode,
      getName(b),
      getShowtimeId(b),
      getMovieTitle(b),
      b.status,
      getPaymentMethod(b),
      getPrice(b)
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
    a.download = `bookings_page_${paging.page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10">
        Đang tải danh sách booking...
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
              placeholder="Tìm kiếm booking code..."
              className="w-full pl-10 pr-4 py-2 text-base rounded-lg bg-black/30 border border-yellow-400/40 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 transition"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPaging((p) => ({ ...p, page: 1 }));
              }}
            />
          </div>

          <button
            onClick={() => exportCurrentCSV()}
            className="flex items-center gap-2 px-3.5 py-2 text-sm border border-yellow-400/40 rounded-lg bg-black/40 text-white hover:bg-black/50 whitespace-nowrap shrink-0"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {/* Status filter */}
        <div className="flex space-x-2 mb-4">
          <div className="flex border border-yellow-400/40 rounded-lg p-0.5 bg-black/40">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedStatus(key);
                  setPaging((p) => ({ ...p, page: 1 }));
                }}
                className={`px-4 py-1 text-base font-medium rounded-lg transition-colors ${
                  selectedStatus === key
                    ? "bg-black/60 text-yellow-300 shadow-sm font-semibold"
                    : "text-yellow-100/85 hover:bg-black/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg relative border border-yellow-400/40">
          {isRefreshing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm pointer-events-none z-10 rounded-lg">
              <Loader2 className="animate-spin w-6 h-6 text-yellow-300" />
            </div>
          )}

          <table className="min-w-full divide-y divide-yellow-400/80 table-fixed">
            <thead className="sticky top-0 z-10 border-b border-yellow-400/70">
              <tr className="bg-black/40 backdrop-blur-sm">
                <th className="px-6 py-3 text-left text-sm font-bold text-yellow-400 uppercase">
                  Mã booking
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-yellow-400 uppercase">
                  Tên khách hàng
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-yellow-400 uppercase">
                  Lịch chiếu
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-yellow-400 uppercase">
                  Phim
                </th>
                <th className="px-6 py-3 text-center text-sm font-bold text-yellow-400 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-center text-sm font-bold text-yellow-400 uppercase">
                  Phương thức thanh toán
                </th>
                <th className="px-6 py-3 text-right text-sm font-bold text-yellow-400 uppercase">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-center text-sm font-bold text-yellow-400 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-yellow-400/40">
              {bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-yellow-100 italic text-base"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr
                    key={b.bookingId}
                    className={`transition duration-150 ${isRefreshing ? "opacity-60 pointer-events-none" : ""} hover:bg-black/40`}
                  >
                    <td className="px-6 py-3 text-yellow-100">
                      {b.bookingCode}
                    </td>
                    <td className="px-6 py-3 text-yellow-100">{getName(b)}</td>
                    <td className="px-6 py-3 text-yellow-100">
                      {getShowtimeId(b)}
                    </td>
                    <td className="px-6 py-3 text-yellow-100">
                      {getMovieTitle(b)}
                    </td>

                    <td className="px-6 py-3 text-center">
                      <Badge
                        type="AccountStatus"
                        value={b.status}
                        raw={b.status}
                      />
                    </td>
                    <td className="px-6 py-3 text-center text-yellow-100">
                      {getPaymentMethod(b)}
                    </td>
                    <td className="px-6 py-3 text-right text-yellow-100">
                      {getPrice(b)}
                    </td>
                    <td className="px-6 py-3 text-center flex justify-center gap-2">
                      <button
                        onClick={() => openModal(b.bookingId)}
                        className="px-2 py-1 rounded text-base text-white flex items-center gap-1"
                      >
                        <Eye size={14} /> Xem
                      </button>
                      <button
                        onClick={() => onDelete(b.bookingId)}
                        className="px-2 py-1 rounded text-base text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
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
            Trang {paging.page}/{paging.totalPages} • {paging.total} booking
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={paging.page <= 1 || isRefreshing}
              className={`p-2 rounded-md transition ${paging.page <= 1 || isRefreshing ? "text-yellow-100/50 cursor-not-allowed" : "text-yellow-100 hover:bg-black/40"}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextPage}
              disabled={paging.page >= paging.totalPages || isRefreshing}
              className={`p-2 rounded-md transition ${paging.page >= paging.totalPages || isRefreshing ? "text-yellow-100/50 cursor-not-allowed" : "text-yellow-100 hover:bg-black/40"}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && modalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-3xl bg-black/60 border border-yellow-400/40 rounded-2xl p-6 shadow-2xl text-white z-10 overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold mb-3 text-yellow-400">
                Chi tiết booking
              </h3>
              <button
                onClick={closeModal}
                className="px-3 py-2 rounded-lg text-yellow-100 hover:bg-black/40"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Mã Booking"
                value={modalBooking.bookingCode}
                disabled
              />
              <InputField label="Tên khách hàng" value={getName(modalBooking)} disabled />
              <InputField
                label="Lịch chiếu"
                value={getShowtimeId(modalBooking)}
                disabled
              />
              <InputField
                label="Phim"
                value={getMovieTitle(modalBooking)}
                disabled
              />
              <InputField label="Trạng thái" value={modalBooking.status} disabled />
              <InputField
                label="Phương thức thanh toán"
                value={getPaymentMethod(modalBooking)}
                disabled
              />
              <InputField
                label="Tổng tiền"
                value={modalBooking.totalPrice}
                disabled
              />
              <InputField
                label="Giảm giá"
                value={modalBooking.discountAmount}
                disabled
              />
              <InputField
                label="Thành tiền"
                value={modalBooking.finalPrice}
                disabled
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
