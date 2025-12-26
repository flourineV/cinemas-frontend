"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Edit2,
  Trash2,
  X,
  Popcorn,
  DollarSign,
} from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

import { fnbService } from "@/services/fnb/fnbService";
import type { FnbItemResponse, FnbItemRequest } from "@/types/fnb/fnb.type";
import { useDebounce } from "@/hooks/useDebounce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

const ITEMS_PER_PAGE = 10;

export default function FnbManagementTable(): React.JSX.Element {
  const [items, setItems] = useState<FnbItemResponse[]>([]);
  const [filteredItems, setFilteredItems] = useState<FnbItemResponse[]>([]);
  const [paging, setPaging] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingItem, setEditingItem] = useState<FnbItemResponse | null>(null);
  const [formData, setFormData] = useState<FnbItemRequest>({
    name: "",
    description: "",
    unitPrice: 0,
    imageUrl: "",
  });
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useBodyScrollLock(isModalOpen);

  const fetchItems = async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      else setIsRefreshing(true);

      const data = await fnbService.getAllFnbItems();
      setItems(data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Không thể tải danh sách bắp nước" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems(true);
  }, []);

  // Filter items client-side
  useEffect(() => {
    let filtered = [...items];

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchLower) ||
          item.nameEn?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredItems(filtered);
    setPaging({
      page: 1,
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1,
      total: filtered.length,
    });
  }, [items, debouncedSearch]);

  const paginatedItems = filteredItems.slice(
    (paging.page - 1) * ITEMS_PER_PAGE,
    paging.page * ITEMS_PER_PAGE
  );

  const goToNextPage = () => {
    if (paging.page < paging.totalPages) {
      setPaging((p) => ({ ...p, page: p.page + 1 }));
    }
  };

  const goToPrevPage = () => {
    if (paging.page > 1) {
      setPaging((p) => ({ ...p, page: p.page - 1 }));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Modal handlers
  const openAddModal = () => {
    setModalMode("add");
    setEditingItem(null);
    setFormData({ name: "", description: "", unitPrice: 0, imageUrl: "" });
    setCurrentImageUrl("");
    setNewImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: FnbItemResponse) => {
    setModalMode("edit");
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      unitPrice: item.unitPrice,
      imageUrl: item.imageUrl || "",
    });
    setCurrentImageUrl(item.imageUrl || "");
    setNewImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ name: "", description: "", unitPrice: 0, imageUrl: "" });
    setCurrentImageUrl("");
    setNewImageFile(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Swal.fire({ icon: "warning", title: "Vui lòng nhập tên sản phẩm" });
      return;
    }
    if (formData.unitPrice <= 0) {
      Swal.fire({ icon: "warning", title: "Giá phải lớn hơn 0" });
      return;
    }

    // Validate imageUrl for add mode
    if (modalMode === "add" && !newImageFile && !currentImageUrl) {
      Swal.fire({ icon: "warning", title: "Vui lòng chọn hình ảnh sản phẩm" });
      return;
    }

    try {
      setSaving(true);

      // Prepare request data
      const requestData: FnbItemRequest = {
        ...formData,
        // Use new image URL if uploaded, otherwise keep current imageUrl
        imageUrl: newImageFile
          ? "temp-url-will-be-replaced"
          : currentImageUrl || formData.imageUrl,
      };

      if (modalMode === "add") {
        await fnbService.createFnbItem(requestData);
        Swal.fire({
          icon: "success",
          title: "Đã thêm sản phẩm",
          timer: 1000,
          showConfirmButton: false,
        });
      } else if (editingItem) {
        await fnbService.updateFnbItem(editingItem.id, requestData);
        Swal.fire({
          icon: "success",
          title: "Đã cập nhật sản phẩm",
          timer: 1000,
          showConfirmButton: false,
        });
      }
      closeModal();
      fetchItems(false);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Không thể lưu sản phẩm" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirm = await Swal.fire({
      title: `Xóa "${name}"?`,
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;

    try {
      await fnbService.deleteFnbItem(id);
      Swal.fire({
        icon: "success",
        title: "Đã xóa sản phẩm",
        timer: 1000,
        showConfirmButton: false,
      });
      fetchItems(false);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Không thể xóa sản phẩm" });
    }
  };

  async function exportAllCSV() {
    try {
      const headers = ["ID", "Tên", "Tên (EN)", "Mô tả", "Giá"];
      const rows = filteredItems.map((item) => [
        item.id,
        item.name,
        item.nameEn || "",
        item.description || "",
        item.unitPrice,
      ]);

      const csvContent =
        "\uFEFF" +
        [headers, ...rows]
          .map((row) =>
            row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")
          )
          .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fnb_items_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: `Đã xuất ${filteredItems.length} sản phẩm (CSV)`,
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
      const wb = XLSX.utils.book_new();
      const wsData = [
        ["ID", "Tên", "Tên (EN)", "Mô tả", "Giá"],
        ...filteredItems.map((item) => [
          item.id,
          item.name,
          item.nameEn || "",
          item.description || "",
          item.unitPrice,
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, "Bắp nước");
      XLSX.writeFile(
        wb,
        `fnb_items_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      Swal.fire({
        icon: "success",
        title: `Đã xuất ${filteredItems.length} sản phẩm (Excel)`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire({ icon: "error", title: "Lỗi xuất file Excel" });
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-400 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="h-10 bg-gray-200 rounded-lg w-full md:flex-1 animate-pulse"></div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
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
              placeholder="Tìm theo tên sản phẩm..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg
                        bg-white border border-gray-400
                        text-gray-700 placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                        transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-3 py-2 text-sm 
                        border border-yellow-500 rounded-lg 
                        bg-yellow-500 text-black hover:bg-yellow-600
                        whitespace-nowrap shrink-0 font-medium"
            >
              <Plus size={16} /> Thêm sản phẩm
            </button>
            <button
              onClick={() => exportAllCSV()}
              className="flex items-center gap-2 px-3 py-2 text-sm 
                        border border-gray-400 rounded-lg 
                        bg-white text-gray-700 hover:bg-gray-50
                        whitespace-nowrap shrink-0"
            >
              <Download size={16} /> CSV
            </button>
            <button
              onClick={() => exportAllExcel()}
              className="flex items-center gap-2 px-3 py-2 text-sm 
                        border border-gray-400 rounded-lg 
                        bg-green-600 text-white hover:bg-green-700
                        whitespace-nowrap shrink-0"
            >
              <Download size={16} /> Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg relative border border-gray-400">
          {isRefreshing && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm pointer-events-none z-10 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          )}

          <table className="min-w-full divide-y divide-yellow-400/80 table-fixed">
            <thead className="sticky top-0 z-10 border-b border-gray-400 bg-gray-50">
              <tr>
                <th className="w-[80px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ảnh
                </th>
                <th className="w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên sản phẩm
                </th>
                <th className="w-[250px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="w-[120px] px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-400 relative bg-white">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-gray-500 italic text-sm"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-6 py-4 text-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover mx-auto"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mx-auto">
                          <Popcorn size={20} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.nameEn && (
                          <p className="text-xs text-gray-500">{item.nameEn}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="line-clamp-2">
                        {item.description || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-green-600">
                      {formatPrice(item.unitPrice)}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Xóa"
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
        <div className="flex justify-between items-center pt-4">
          <span className="text-sm text-gray-700">
            Trang {paging.page}/{paging.totalPages} • {paging.total} sản phẩm
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={paging.page <= 1}
              className={`p-2 rounded-md transition ${
                paging.page <= 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextPage}
              disabled={paging.page >= paging.totalPages}
              className={`p-2 rounded-md transition ${
                paging.page >= paging.totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-[99999] flex items-center justify-center px-4 py-6"
          style={{
            zIndex: 99999,
            margin: 0,
            padding: 0,
            width: "100vw",
            height: "100vh",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
            style={{
              zIndex: 1,
              margin: 0,
              padding: 0,
              width: "100%",
              height: "100%",
            }}
          />

          <div
            className="relative w-full max-w-md bg-white border border-gray-400 rounded-2xl shadow-2xl overflow-hidden mx-4 my-6"
            style={{ zIndex: 2 }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                {modalMode === "add" ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg
                            bg-white border border-gray-400
                            text-gray-700 placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                            transition"
                  placeholder="VD: Bắp rang bơ lớn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg
                            bg-white border border-gray-400
                            text-gray-700 placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                            transition resize-none"
                  placeholder="Mô tả sản phẩm..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitPrice: Number(e.target.value),
                      })
                    }
                    className="w-full pl-10 pr-3 py-2 text-sm rounded-lg
                              bg-white border border-gray-400
                              text-gray-700 placeholder-gray-400
                              focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                              transition"
                    placeholder="0"
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh sản phẩm
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-yellow-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewImageFile(file);
                      }
                    }}
                  />

                  {/* Hiển thị ảnh hiện tại hoặc ảnh mới được chọn */}
                  {currentImageUrl || newImageFile ? (
                    <div className="space-y-3">
                      <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={
                            newImageFile
                              ? URL.createObjectURL(newImageFile)
                              : currentImageUrl
                          }
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        {newImageFile ? "Ảnh mới được chọn" : "Ảnh hiện tại"}
                      </div>
                      <label
                        htmlFor="image-upload"
                        className="inline-block cursor-pointer text-yellow-600 font-medium text-sm hover:text-yellow-700"
                      >
                        {newImageFile ? "Chọn ảnh khác" : "Thay đổi ảnh"}
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Popcorn size={24} className="text-gray-400" />
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-yellow-600 font-medium">
                          Chọn ảnh
                        </span>{" "}
                        hoặc kéo thả vào đây
                      </div>
                      <div className="text-xs text-gray-400">
                        PNG, JPG, JPEG (tối đa 5MB)
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-black bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                )}
                {modalMode === "add" ? "Thêm" : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
