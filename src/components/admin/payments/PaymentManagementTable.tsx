"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  CreditCard,
  Ticket,
  X,
  User,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

import {
  paymentService,
  type PaymentTransactionResponse,
} from "@/services/payment/payment.service";
import type { PageResponse } from "@/types/PageResponse";
import { useDebounce } from "@/hooks/useDebounce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

const STATUS_LABELS: Record<string, string> = {
  ALL: "Tất cả",
  PENDING: "Đang chờ",
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SUCCESS: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

const ITEMS_PER_PAGE = 10;

export default function PaymentManagementTable(): React.JSX.Element {
  const [payments, setPayments] = useState<PaymentTransactionResponse[]>([]);
  const [paging, setPaging] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modal detail
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPayment, setModalPayment] =
    useState<PaymentTransactionResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Apply scroll lock when modal is open
  useBodyScrollLock(isModalOpen);

  const fetchPayments = async (page = 1, showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      else setIsRefreshing(true);

      const params: any = {
        page: page - 1,
        size: ITEMS_PER_PAGE,
        transactionRef: debouncedSearch || undefined,
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        sortBy: "createdAt",
        sortDir: "desc",
      };

      const pageResp: PageResponse<PaymentTransactionResponse> =
        await paymentService.getPayments(params);

      const items = pageResp.data ?? [];
      setPayments(items);
      setPaging({
        page: (pageResp.page ?? 0) + 1,
        totalPages: pageResp.totalPages ?? 1,
        total: pageResp.totalElements ?? items.length,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Không thể tải danh sách thanh toán" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments(1, true);
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchPayments(paging.page, false);
    }
  }, [selectedStatus, debouncedSearch]);

  useEffect(() => {
    if (!loading) {
      fetchPayments(paging.page, false);
    }
  }, [paging.page]);

  const goToNextPage = () => {
    if (paging.page < paging.totalPages && !isRefreshing) {
      setPaging((p) => ({ ...p, page: p.page + 1 }));
      setTimeout(() => {
        const element = document.getElementById("payment-management-table");
        if (element) {
          const headerHeight = 200;
          const elementTop = element.offsetTop - headerHeight;
          window.scrollTo({ top: elementTop, behavior: "smooth" });
        }
      }, 100);
    }
  };

  const goToPrevPage = () => {
    if (paging.page > 1 && !isRefreshing) {
      setPaging((p) => ({ ...p, page: p.page - 1 }));
      setTimeout(() => {
        const element = document.getElementById("payment-management-table");
        if (element) {
          const headerHeight = 200;
          const elementTop = element.offsetTop - headerHeight;
          window.scrollTo({ top: elementTop, behavior: "smooth" });
        }
      }, 100);
    }
  };

  async function openModal(id: string) {
    setIsModalOpen(true);
    setIsDetailLoading(true);
    try {
      const detail = await paymentService.getPaymentById(id);
      setModalPayment(detail);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Không thể tải chi tiết thanh toán" });
      setIsModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setModalPayment(null);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value) + "đ";
  };

  async function exportAllCSV() {
    try {
      const allPaymentsResponse = await paymentService.getPayments({
        page: 0,
        size: 10000,
      });
      const allPayments = allPaymentsResponse.data || [];

      const headers = [
        "Mã giao dịch",
        "Booking ID",
        "User ID",
        "Số tiền",
        "Phương thức",
        "Trạng thái",
        "Ngày tạo",
      ];

      const rows = allPayments.map((p) => [
        p.transactionRef,
        p.bookingId || "",
        p.userId || "Guest",
        p.amount,
        p.method || "",
        STATUS_LABELS[p.status] || p.status,
        dayjs(p.createdAt).format("DD/MM/YYYY HH:mm"),
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
      a.download = `all_payments_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: `Đã xuất ${allPayments.length} giao dịch (CSV)`,
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
      const allPaymentsResponse = await paymentService.getPayments({
        page: 0,
        size: 10000,
      });
      const allPayments = allPaymentsResponse.data || [];

      const wb = XLSX.utils.book_new();
      const wsData = [
        [
          "Mã giao dịch",
          "Booking ID",
          "User ID",
          "Số tiền",
          "Phương thức",
          "Trạng thái",
          "Ngày tạo",
        ],
        ...allPayments.map((p) => [
          p.transactionRef,
          p.bookingId || "",
          p.userId || "Guest",
          p.amount,
          p.method || "",
          STATUS_LABELS[p.status] || p.status,
          dayjs(p.createdAt).format("DD/MM/YYYY HH:mm"),
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

      XLSX.utils.book_append_sheet(wb, ws, "Danh sách thanh toán");
      XLSX.writeFile(
        wb,
        `all_payments_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      Swal.fire({
        icon: "success",
        title: `Đã xuất ${allPayments.length} giao dịch (Excel)`,
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
      <div className="bg-white border border-gray-400 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center w-full md:flex-1 relative">
            <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div className="flex space-x-2 mb-4">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
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
      <div className="bg-white border border-gray-400 rounded-lg p-6">
        {/* Header: search + export */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center w-full md:flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã giao dịch..."
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
            <button
              onClick={() => exportAllCSV()}
              className="flex items-center gap-2 px-3 py-2 text-sm 
                        border border-gray-400 rounded-lg 
                        bg-white text-gray-700 hover:bg-gray-50
                        whitespace-nowrap shrink-0"
            >
              <Download size={16} /> Export CSV
            </button>

            <button
              onClick={() => exportAllExcel()}
              className="flex items-center gap-2 px-3 py-2 text-sm 
                        border border-gray-400 rounded-lg 
                        bg-green-600 text-white hover:bg-green-700
                        whitespace-nowrap shrink-0"
            >
              <Download size={16} /> Export Excel
            </button>
          </div>
        </div>

        {/* Status filter bar - grouped buttons */}
        <div className="flex space-x-2 mb-4">
          <div className="flex border border-gray-400 rounded-lg p-0.5 bg-gray-50">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedStatus(key);
                  setPaging((p) => ({ ...p, page: 1 }));
                }}
                className={`px-4 py-1 text-sm font-medium rounded-lg transition-colors
                  ${
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
        <div
          id="payment-management-table"
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
                <th className="w-[180px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã giao dịch
                </th>
                <th className="w-[140px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="w-[120px] px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương thức
                </th>
                <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="w-[80px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-400 relative bg-white">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-500 italic text-sm"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className={`transition duration-150 ${
                      isRefreshing ? "opacity-60 pointer-events-none" : ""
                    } hover:bg-gray-50`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-yellow-600" />
                        <span className="font-medium truncate">
                          {p.transactionRef}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Ticket size={16} className="text-blue-600" />
                        <span className="truncate">
                          {p.bookingId?.slice(0, 8) || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                      {p.method || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          STATUS_COLORS[p.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(p.id)}
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
        <div className="flex justify-between items-center pt-4">
          <span className="text-sm text-gray-700">
            Trang {paging.page}/{paging.totalPages} • {paging.total} giao dịch
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
                Chi tiết thanh toán
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
              ) : modalPayment ? (
                <div className="space-y-6">
                  {/* Thông tin giao dịch */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Thông tin giao dịch
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">
                          Mã giao dịch
                        </p>
                        <p className="font-semibold text-gray-900">
                          {modalPayment.transactionRef}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            STATUS_COLORS[modalPayment.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {STATUS_LABELS[modalPayment.status] ||
                            modalPayment.status}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                        <p className="font-semibold text-gray-900">
                          {modalPayment.bookingId || "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">
                          Showtime ID
                        </p>
                        <p className="font-semibold text-gray-900">
                          {modalPayment.showtimeId || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin người dùng */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Thông tin người dùng
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">User ID</p>
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-blue-600" />
                          <p className="font-semibold text-gray-900">
                            {modalPayment.userId || "Khách vãng lai"}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">
                          Phương thức thanh toán
                        </p>
                        <p className="font-semibold text-gray-900">
                          {modalPayment.method || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ghế đã đặt */}
                  {modalPayment.seatIds && modalPayment.seatIds.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Ghế đã đặt ({modalPayment.seatIds.length} ghế)
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex flex-wrap gap-2">
                          {modalPayment.seatIds.map((seatId, idx) => (
                            <div
                              key={idx}
                              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium"
                            >
                              {seatId.slice(0, 8)}...
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chi tiết thanh toán */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Chi tiết thanh toán
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold text-gray-900">
                          Số tiền:
                        </span>
                        <span className="font-bold text-yellow-600">
                          {formatCurrency(modalPayment.amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thời gian */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Thời gian
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          <p className="font-semibold text-gray-900">
                            {modalPayment.createdAt
                              ? dayjs(modalPayment.createdAt).format(
                                  "DD/MM/YYYY HH:mm"
                                )
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">
                          Cập nhật lần cuối
                        </p>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          <p className="font-semibold text-gray-900">
                            {modalPayment.updatedAt
                              ? dayjs(modalPayment.updatedAt).format(
                                  "DD/MM/YYYY HH:mm"
                                )
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
