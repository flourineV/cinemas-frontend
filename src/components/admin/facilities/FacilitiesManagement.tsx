import React, { useEffect, useState } from "react";
import { Search, Trash2, Eye, Loader2, Plus } from "lucide-react";
import Swal from "sweetalert2";

import { provinceService } from "@/services/showtime/provinceService";
import { theaterService } from "@/services/showtime/theaterService";
import type {
  ProvinceResponse,
  ProvinceRequest,
} from "@/types/showtime/province.type";
import type {
  TheaterResponse,
  TheaterRequest,
} from "@/types/showtime/theater.type";
import { InputField } from "@/components/ui/FormFields";


export default function FacilitiesManagement(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"province" | "theater">("province");

  // ================= Provinces =================
  const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
  const [provincePaging, setProvincePaging] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [provinceLoading, setProvinceLoading] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState("");
  const [provinceModalOpen, setProvinceModalOpen] = useState(false);
  const [provinceModalData, setProvinceModalData] = useState<ProvinceRequest | null>(null);
  const [editingProvinceId, setEditingProvinceId] = useState<string | null>(null);

  // ================= Theaters =================
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [theaterPaging, setTheaterPaging] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [theaterLoading, setTheaterLoading] = useState(false);
  const [theaterSearch, setTheaterSearch] = useState("");
  const [theaterModalOpen, setTheaterModalOpen] = useState(false);
  const [theaterModalData, setTheaterModalData] = useState<TheaterRequest | null>(null);
  const [editingTheaterId, setEditingTheaterId] = useState<string | null>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");

  // ================= Fetching =================
  const fetchProvinces = async () => {
    try {
      setProvinceLoading(true);
      const data = await provinceService.getAllProvinces();
      setProvinces(data);
      setProvincePaging({ ...provincePaging, total: data.length, totalPages: 1 });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Không thể tải danh sách tỉnh" });
    } finally {
      setProvinceLoading(false);
    }
  };

  const fetchTheaters = async () => {
    if (!selectedProvinceId) {
      setTheaters([]);
      return;
    }
    try {
      setTheaterLoading(true);
      const data = await theaterService.getTheatersByProvince(selectedProvinceId);
      setTheaters(data);
      setTheaterPaging({ ...theaterPaging, total: data.length, totalPages: 1 });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Không thể tải danh sách rạp" });
    } finally {
      setTheaterLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    fetchTheaters();
  }, [selectedProvinceId]);

  // ================= CRUD Province =================
  const openProvinceModal = (province?: ProvinceResponse) => {
    if (province) {
      setProvinceModalData({ name: province.name });
      setEditingProvinceId(province.id);
    } else {
      setProvinceModalData({ name: "" });
      setEditingProvinceId(null);
    }
    setProvinceModalOpen(true);
  };

  const saveProvince = async () => {
    if (!provinceModalData?.name) return;
    try {
      if (editingProvinceId) {
        await provinceService.updateProvince(editingProvinceId, provinceModalData);
        Swal.fire({ icon: "success", title: "Đã cập nhật tỉnh" });
      } else {
        await provinceService.createProvince(provinceModalData);
        Swal.fire({ icon: "success", title: "Đã thêm tỉnh" });
      }
      setProvinceModalOpen(false);
      fetchProvinces();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Lưu tỉnh thất bại" });
    }
  };

  const deleteProvince = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Xóa tỉnh?",
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    });
    if (!confirm.isConfirmed) return;
    try {
      await provinceService.deleteProvince(id);
      Swal.fire({ icon: "success", title: "Đã xóa" });
      fetchProvinces();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Xóa tỉnh thất bại" });
    }
  };

  // ================= CRUD Theater =================
  const openTheaterModal = (theater?: TheaterResponse) => {
    if (!selectedProvinceId) {
      Swal.fire({ icon: "warning", title: "Vui lòng chọn tỉnh trước" });
      return;
    }
    if (theater) {
      setTheaterModalData({
        name: theater.name,
        address: theater.address,
        provinceId: selectedProvinceId,
        description: theater.description || "",
      });
      setEditingTheaterId(theater.id);
    } else {
      setTheaterModalData({ 
        name: "",
        address: "",
        provinceId: selectedProvinceId || "",
        description: "",
      });
      setEditingTheaterId(null);
    }
    setTheaterModalOpen(true);
  };

  const saveTheater = async () => {
    if (!theaterModalData?.name || !theaterModalData?.address) return;
    try {
      if (editingTheaterId) {
        await theaterService.updateTheater(editingTheaterId, theaterModalData);
        Swal.fire({ icon: "success", title: "Đã cập nhật rạp" });
      } else {
        await theaterService.createTheater(theaterModalData);
        Swal.fire({ icon: "success", title: "Đã thêm rạp" });
      }
      setTheaterModalOpen(false);
      fetchTheaters();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Lưu rạp thất bại" });
    }
  };

  const deleteTheater = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Xóa rạp?",
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    });
    if (!confirm.isConfirmed) return;
    try {
      await theaterService.deleteTheater(id);
      Swal.fire({ icon: "success", title: "Đã xóa" });
      fetchTheaters();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Xóa rạp thất bại" });
    }
  };

  return (
    <div className="bg-black/60 backdrop-blur-md border border-yellow-400/40 rounded-2xl p-6 shadow-2xl text-white">
      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        <div className="flex border border-yellow-400/40 rounded-lg p-0.5 bg-black/40">
          <button
            onClick={() => setActiveTab("province")}
            className={`px-4 py-1 text-base font-medium rounded-lg transition-colors
              ${activeTab === "province"
                ? "bg-black/60 text-yellow-300 shadow-sm font-semibold"
                : "text-yellow-100/85 hover:bg-black/50"
              }`}
          >
            Tỉnh
          </button>
          <button
            onClick={() => setActiveTab("theater")}
            className={`px-4 py-1 text-base font-medium rounded-lg transition-colors
              ${activeTab === "theater"
                ? "bg-black/60 text-yellow-300 shadow-sm font-semibold"
                : "text-yellow-100/85 hover:bg-black/50"
              }`}
          >
            Rạp
          </button>
        </div>
      </div>

      {/* Province Tab */}
      {activeTab === "province" && (
        <div>
          <div className="flex justify-between items-center mb-4 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="text"
                placeholder="Tìm tỉnh..."
                className="w-full pl-10 pr-4 py-2 text-base rounded-lg bg-black/30 border border-yellow-400/40 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                value={provinceSearch}
                onChange={(e) => setProvinceSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => openProvinceModal()}
              className="flex items-center gap-2 px-3.5 py-2 text-sm border border-yellow-400/40 rounded-lg bg-black/40 text-white hover:bg-black/50"
            >
              <Plus size={16} /> Thêm tỉnh
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg relative border border-yellow-400/40">
            {provinceLoading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10 rounded-lg">
                <Loader2 className="animate-spin w-6 h-6 text-yellow-300" />
              </div>
            )}

            <table className="min-w-full divide-y divide-yellow-400/80 table-fixed">
              <thead className="sticky top-0 z-10 border-b border-yellow-400/70 bg-black/40">
                <tr className="bg-black/40 backdrop-blur-sm">
                  <th className="px-6 py-3 text-left text-sm font-bold text-yellow-400 uppercase">
                    Tên tỉnh
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-bold text-yellow-400 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-400/40">
                {provinces.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-10 text-yellow-100 italic text-base">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  provinces
                    .filter((p) => p.name.toLowerCase().includes(provinceSearch.toLowerCase()))
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-black/40 transition">
                        <td className="px-6 py-3 text-yellow-100">{p.name}</td>
                        <td className="px-6 py-3 text-center flex justify-center gap-2">
                          <button
                            onClick={() => openProvinceModal(p)}
                            className="px-2 py-1 rounded text-base text-white flex items-center gap-1"
                          >
                            <Eye size={14} /> Sửa
                          </button>
                          <button
                            onClick={() => deleteProvince(p.id)}
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
        </div>
      )}

      {/* Theater Tab */}
      {activeTab === "theater" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-1 gap-2">
              <select
                className="flex-shrink-0 px-3 py-2 rounded-lg bg-black/30 border border-yellow-400/40 text-white"
                value={selectedProvinceId}
                onChange={(e) => setSelectedProvinceId(e.target.value)}
              >
                <option value="">Chọn tỉnh</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                <input
                  type="text"
                  placeholder="Tìm rạp..."
                  className="w-full pl-10 pr-4 py-2 text-base rounded-lg bg-black/30 border border-yellow-400/40 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  value={theaterSearch}
                  onChange={(e) => setTheaterSearch(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={() => openTheaterModal()}
              className="flex-shrink-0 flex items-center ml-2 gap-2 px-3.5 py-2 text-sm border border-yellow-400/40 rounded-lg bg-black/40 text-white hover:bg-black/50"
            >
              <Plus size={16} /> Thêm rạp
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg relative border border-yellow-400/40">
            {theaterLoading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10 rounded-lg">
                <Loader2 className="animate-spin w-6 h-6 text-yellow-300" />
              </div>
            )}

            <table className="min-w-full divide-y divide-yellow-400/80 table-fixed">
              <thead className="sticky top-0 z-10 border-b border-yellow-400/70 bg-black/40">
                <tr className="bg-black/40 backdrop-blur-sm">
                  <th className="px-6 py-3 text-left text-sm font-bold text-yellow-400 uppercase">
                    Tên rạp
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-yellow-400 uppercase">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-bold text-yellow-400 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-400/40">
                {theaters.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-10 text-yellow-100 italic text-base">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  theaters
                    .filter((t) => t.name.toLowerCase().includes(theaterSearch.toLowerCase()))
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-black/40 transition">
                        <td className="px-6 py-3 text-yellow-100">{t.name}</td>
                        <td className="px-6 py-3 text-yellow-100">{t.address}</td>
                        <td className="px-6 py-3 text-center flex justify-center gap-2">
                          <button
                            onClick={() => openTheaterModal(t)}
                            className="px-2 py-1 rounded text-base text-white flex items-center gap-1"
                          >
                            <Eye size={14} /> Sửa
                          </button>
                          <button
                            onClick={() => deleteTheater(t.id)}
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
        </div>
      )}

      {/* Modals */}
      {provinceModalOpen && provinceModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setProvinceModalOpen(false)} />
          <div className="relative w-full max-w-md bg-black/60 border border-yellow-400/40 rounded-2xl p-6 shadow-2xl text-white z-10">
            <h3 className="text-xl font-bold mb-4 text-yellow-400">
              {editingProvinceId ? "Sửa tỉnh" : "Thêm tỉnh"}
            </h3>
            <InputField
              label="Tên tỉnh"
              value={provinceModalData.name}
              onChange={(val) => setProvinceModalData({ ...provinceModalData, name: val })}
            />
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setProvinceModalOpen(false)}
                className="px-3 py-2 rounded-lg bg-black/40 hover:bg-black/50"
              >
                Hủy
              </button>
              <button
                onClick={saveProvince}
                className="px-3 py-2 rounded-lg bg-yellow-400 text-black font-semibold"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {theaterModalOpen && theaterModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setTheaterModalOpen(false)} />
          <div className="relative w-full max-w-md bg-black/60 border border-yellow-400/40 rounded-2xl p-6 shadow-2xl text-white z-10">
            <h3 className="text-xl font-bold mb-4 text-yellow-400">
              {editingTheaterId ? "Sửa rạp" : "Thêm rạp"}
            </h3>
            <InputField
              label="Tên rạp"
              value={theaterModalData.name}
              onChange={(val) => setTheaterModalData({ ...theaterModalData, name: val })}
            />
            <InputField
              label="Địa chỉ"
              value={theaterModalData.address}
              onChange={(val) => setTheaterModalData({ ...theaterModalData, address: val })}
            />
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setTheaterModalOpen(false)}
                className="px-3 py-2 rounded-lg bg-black/40 hover:bg-black/50"
              >
                Hủy
              </button>
              <button
                onClick={saveTheater}
                className="px-3 py-2 rounded-lg bg-yellow-400 text-black font-semibold"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
