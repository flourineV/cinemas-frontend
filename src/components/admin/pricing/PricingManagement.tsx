"use client";
import React, { useEffect, useState } from "react";
import { Search, Trash2, Edit2, Plus, DollarSign, X, Save } from "lucide-react";
import Swal from "sweetalert2";

import { pricingService } from "@/services/pricing/pricingService";
import type {
  SeatPriceResponse,
  SeatPriceRequest,
  SeatType,
  TicketType,
} from "@/types/pricing/pricing.type";
import {
  SEAT_TYPE_LABELS,
  TICKET_TYPE_LABELS,
} from "@/types/pricing/pricing.type";
import { useDebounce } from "@/hooks/useDebounce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

export default function PricingManagement(): React.JSX.Element {
  const [prices, setPrices] = useState<SeatPriceResponse[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<SeatPriceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<SeatPriceRequest | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useBodyScrollLock(isModalOpen);

  const fetchPrices = async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      else setIsRefreshing(true);

      const data = await pricingService.getAllSeatPrices();
      setPrices(data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Không thể tải danh sách giá vé" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices(true);
  }, []);

  // Filter prices
  useEffect(() => {
    let filtered = [...prices];

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.seatType.toLowerCase().includes(searchLower) ||
          p.ticketType.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredPrices(filtered);
  }, [prices, debouncedSearch]);

  const openModal = (price?: SeatPriceResponse) => {
    if (price) {
      setModalData({
        seatType: price.seatType,
        ticketType: price.ticketType,
        basePrice: price.basePrice,
        description: price.description,
        descriptionEn: price.descriptionEn,
      });
      setEditingId(price.id);
    } else {
      setModalData({
        seatType: "NORMAL",
        ticketType: "ADULT",
        basePrice: 0,
        description: "",
        descriptionEn: "",
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
    setEditingId(null);
  };

  const savePrice = async () => {
    if (!modalData) return;

    if (
      !modalData.seatType ||
      !modalData.ticketType ||
      modalData.basePrice <= 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng nhập đầy đủ thông tin hợp lệ",
      });
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await pricingService.updateSeatPrice(editingId, modalData);
        Swal.fire({
          icon: "success",
          title: "Đã cập nhật giá vé",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        await pricingService.createSeatPrice(modalData);
        Swal.fire({
          icon: "success",
          title: "Đã thêm giá vé mới",
          timer: 1000,
          showConfirmButton: false,
        });
      }
      closeModal();
      fetchPrices();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Lưu thất bại" });
    } finally {
      setSaving(false);
    }
  };

  const deletePrice = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Xóa giá vé?",
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;

    try {
      setDeletingId(id);
      await pricingService.deleteSeatPrice(id);
      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        timer: 1000,
        showConfirmButton: false,
      });
      fetchPrices();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Xóa thất bại" });
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-400 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="h-10 bg-gray-200 rounded-lg w-full md:flex-1 animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-400">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <th key={idx} className="px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400 bg-white">
              {Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr key={rowIdx}>
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
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-400 rounded-lg p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center w-full md:flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo loại ghế, loại vé hoặc mô tả..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg
                        bg-white border border-gray-400
                        text-gray-700 placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                        transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 text-sm 
                      bg-yellow-500 text-black font-medium rounded-lg 
                      hover:bg-yellow-600 transition-colors
                      whitespace-nowrap shrink-0"
          >
            <Plus size={16} /> Thêm giá vé
          </button>
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
                <th className="w-[150px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại ghế
                </th>
                <th className="w-[150px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại vé
                </th>
                <th className="w-[120px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá cơ bản
                </th>
                <th className="w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="w-[120px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-400 relative bg-white">
              {filteredPrices.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-gray-500 italic text-sm"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredPrices.map((price) => (
                  <tr
                    key={`${price.seatType}-${price.ticketType}`}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-green-600" />
                        <span className="font-medium">
                          {SEAT_TYPE_LABELS[price.seatType as SeatType] ||
                            price.seatType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {TICKET_TYPE_LABELS[price.ticketType as TicketType] ||
                        price.ticketType}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {formatCurrency(price.basePrice)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="line-clamp-2">{price.description}</span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(price)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deletePrice(price.id)}
                          disabled={deletingId === price.id}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                          title="Xóa"
                        >
                          {deletingId === price.id ? (
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

        {/* Summary */}
        <div className="pt-4">
          <span className="text-sm text-gray-600">
            Hiển thị {filteredPrices.length} mức giá
          </span>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && modalData && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-2xl bg-white border border-gray-400 rounded-2xl shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? "Chỉnh sửa giá vé" : "Thêm giá vé mới"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại ghế <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalData.seatType}
                    onChange={(e) =>
                      setModalData({
                        ...modalData,
                        seatType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    {Object.entries(SEAT_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại vé <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalData.ticketType}
                    onChange={(e) =>
                      setModalData({
                        ...modalData,
                        ticketType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    {Object.entries(TICKET_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá cơ bản (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={modalData.basePrice}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      basePrice: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-400 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Nhập giá vé"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả (Tiếng Việt)
                </label>
                <textarea
                  value={modalData.description}
                  onChange={(e) =>
                    setModalData({ ...modalData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-400 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                  rows={3}
                  placeholder="Mô tả về mức giá này..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả (Tiếng Anh)
                </label>
                <textarea
                  value={modalData.descriptionEn}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      descriptionEn: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-400 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                  rows={3}
                  placeholder="Description about this price..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={savePrice}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                ) : (
                  <Save size={16} />
                )}
                {editingId ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
