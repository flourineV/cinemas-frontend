"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Edit2,
  Plus,
  MapPin,
  Building2,
  DoorOpen,
  Coffee,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

import { provinceService } from "@/services/showtime/provinceService";
import { theaterService } from "@/services/showtime/theaterService";
import { roomService } from "@/services/showtime/roomService";
import { fnbService } from "@/services/fnb/fnbService";
import type {
  ProvinceResponse,
  ProvinceRequest,
} from "@/types/showtime/province.type";
import type {
  TheaterResponse,
  TheaterRequest,
} from "@/types/showtime/theater.type";
import type { RoomResponse, RoomRequest } from "@/types/showtime/room.type";
import type { FnbItemResponse, FnbItemRequest } from "@/types/fnb/fnb.type";
import { useDebounce } from "@/hooks/useDebounce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

type TabType = "province" | "theater" | "room" | "fnb";

const TAB_LABELS: Record<TabType, string> = {
  province: "Tỉnh/Thành",
  theater: "Rạp chiếu",
  room: "Phòng chiếu",
  fnb: "Bắp nước",
};

export default function FacilitiesManagement(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>("province");

  // ================= Provinces =================
  const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
  const [provinceLoading, setProvinceLoading] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState("");
  const debouncedProvinceSearch = useDebounce(provinceSearch, 300);
  const [provinceModalOpen, setProvinceModalOpen] = useState(false);
  const [provinceModalData, setProvinceModalData] =
    useState<ProvinceRequest | null>(null);
  const [editingProvinceId, setEditingProvinceId] = useState<string | null>(
    null
  );
  const [savingProvince, setSavingProvince] = useState(false);
  const [deletingProvinceId, setDeletingProvinceId] = useState<string | null>(
    null
  );

  // ================= Theaters =================
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [theaterLoading, setTheaterLoading] = useState(false);
  const [theaterSearch, setTheaterSearch] = useState("");
  const debouncedTheaterSearch = useDebounce(theaterSearch, 300);
  const [theaterModalOpen, setTheaterModalOpen] = useState(false);
  const [theaterModalData, setTheaterModalData] =
    useState<TheaterRequest | null>(null);
  const [editingTheaterId, setEditingTheaterId] = useState<string | null>(null);
  const [selectedProvinceForTheater, setSelectedProvinceForTheater] =
    useState<string>("");
  const [savingTheater, setSavingTheater] = useState(false);
  const [deletingTheaterId, setDeletingTheaterId] = useState<string | null>(
    null
  );

  // ================= Rooms =================
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomSearch, setRoomSearch] = useState("");
  const debouncedRoomSearch = useDebounce(roomSearch, 300);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomModalData, setRoomModalData] = useState<RoomRequest | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [selectedProvinceForRoom, setSelectedProvinceForRoom] =
    useState<string>("");
  const [selectedTheaterForRoom, setSelectedTheaterForRoom] =
    useState<string>("");
  const [theatersForRoom, setTheatersForRoom] = useState<TheaterResponse[]>([]);
  const [savingRoom, setSavingRoom] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

  // ================= FnB Items =================
  const [fnbItems, setFnbItems] = useState<FnbItemResponse[]>([]);
  const [fnbLoading, setFnbLoading] = useState(false);
  const [fnbSearch, setFnbSearch] = useState("");
  const debouncedFnbSearch = useDebounce(fnbSearch, 300);
  const [fnbModalOpen, setFnbModalOpen] = useState(false);
  const [fnbModalData, setFnbModalData] = useState<FnbItemRequest | null>(null);
  const [editingFnbId, setEditingFnbId] = useState<string | null>(null);
  const [savingFnb, setSavingFnb] = useState(false);
  const [deletingFnbId, setDeletingFnbId] = useState<string | null>(null);

  useBodyScrollLock(
    provinceModalOpen || theaterModalOpen || roomModalOpen || fnbModalOpen
  );

  // ================= Fetch Functions =================
  const fetchProvinces = async () => {
    try {
      setProvinceLoading(true);
      const data = await provinceService.getAllProvinces();
      setProvinces(data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Không thể tải danh sách tỉnh" });
    } finally {
      setProvinceLoading(false);
    }
  };

  const fetchTheaters = async () => {
    try {
      setTheaterLoading(true);
      let data: TheaterResponse[];
      if (selectedProvinceForTheater) {
        data = await theaterService.getTheatersByProvince(
          selectedProvinceForTheater
        );
      } else {
        data = await theaterService.getAllTheaters();
      }
      setTheaters(data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Không thể tải danh sách rạp" });
    } finally {
      setTheaterLoading(false);
    }
  };

  const fetchRooms = async () => {
    if (!selectedTheaterForRoom) {
      setRooms([]);
      return;
    }
    try {
      setRoomLoading(true);
      const data = await roomService.getRoomsByTheaterId(
        selectedTheaterForRoom
      );
      setRooms(data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Không thể tải danh sách phòng" });
    } finally {
      setRoomLoading(false);
    }
  };

  const fetchFnbItems = async () => {
    try {
      setFnbLoading(true);
      const data = await fnbService.getAllFnbItems();
      setFnbItems(data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Không thể tải danh sách bắp nước" });
    } finally {
      setFnbLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (activeTab === "theater") fetchTheaters();
  }, [activeTab, selectedProvinceForTheater]);

  useEffect(() => {
    if (activeTab === "room" && selectedProvinceForRoom) {
      theaterService
        .getTheatersByProvince(selectedProvinceForRoom)
        .then(setTheatersForRoom);
    }
  }, [selectedProvinceForRoom]);

  useEffect(() => {
    if (activeTab === "room") fetchRooms();
  }, [activeTab, selectedTheaterForRoom]);

  useEffect(() => {
    if (activeTab === "fnb") fetchFnbItems();
  }, [activeTab]);

  // ================= Province CRUD =================
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
    if (!provinceModalData?.name.trim()) {
      Swal.fire({ icon: "warning", title: "Vui lòng nhập tên tỉnh" });
      return;
    }
    try {
      setSavingProvince(true);
      if (editingProvinceId) {
        await provinceService.updateProvince(
          editingProvinceId,
          provinceModalData
        );
        Swal.fire({
          icon: "success",
          title: "Đã cập nhật",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        await provinceService.createProvince(provinceModalData);
        Swal.fire({
          icon: "success",
          title: "Đã thêm",
          timer: 1000,
          showConfirmButton: false,
        });
      }
      setProvinceModalOpen(false);
      fetchProvinces();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Lưu thất bại" });
    } finally {
      setSavingProvince(false);
    }
  };

  const deleteProvince = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Xóa tỉnh?",
      text: "Tất cả rạp và phòng thuộc tỉnh này cũng sẽ bị xóa",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;
    try {
      setDeletingProvinceId(id);
      await provinceService.deleteProvince(id);
      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        timer: 1000,
        showConfirmButton: false,
      });
      fetchProvinces();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Xóa thất bại" });
    } finally {
      setDeletingProvinceId(null);
    }
  };

  // ================= Theater CRUD =================
  const openTheaterModal = (theater?: TheaterResponse) => {
    if (theater) {
      setTheaterModalData({
        name: theater.name,
        address: theater.address,
        provinceId: selectedProvinceForTheater || "",
        description: theater.description || "",
      });
      setEditingTheaterId(theater.id);
    } else {
      setTheaterModalData({
        name: "",
        address: "",
        provinceId: selectedProvinceForTheater || "",
        description: "",
      });
      setEditingTheaterId(null);
    }
    setTheaterModalOpen(true);
  };

  const saveTheater = async () => {
    if (!theaterModalData?.name.trim() || !theaterModalData?.address.trim()) {
      Swal.fire({ icon: "warning", title: "Vui lòng nhập đầy đủ thông tin" });
      return;
    }
    if (!theaterModalData.provinceId) {
      Swal.fire({ icon: "warning", title: "Vui lòng chọn tỉnh" });
      return;
    }
    try {
      setSavingTheater(true);
      if (editingTheaterId) {
        await theaterService.updateTheater(editingTheaterId, theaterModalData);
        Swal.fire({
          icon: "success",
          title: "Đã cập nhật",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        await theaterService.createTheater(theaterModalData);
        Swal.fire({
          icon: "success",
          title: "Đã thêm",
          timer: 1000,
          showConfirmButton: false,
        });
      }
      setTheaterModalOpen(false);
      fetchTheaters();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Lưu thất bại" });
    } finally {
      setSavingTheater(false);
    }
  };

  const deleteTheater = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Xóa rạp?",
      text: "Tất cả phòng thuộc rạp này cũng sẽ bị xóa",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;
    try {
      setDeletingTheaterId(id);
      await theaterService.deleteTheater(id);
      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        timer: 1000,
        showConfirmButton: false,
      });
      fetchTheaters();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Xóa thất bại" });
    } finally {
      setDeletingTheaterId(null);
    }
  };

  // ================= Room CRUD =================
  const openRoomModal = (room?: RoomResponse) => {
    if (!selectedTheaterForRoom) {
      Swal.fire({ icon: "warning", title: "Vui lòng chọn rạp trước" });
      return;
    }
    if (room) {
      setRoomModalData({
        theaterId: selectedTheaterForRoom,
        name: room.name,
        seatCount: room.seatCount,
      });
      setEditingRoomId(room.id);
    } else {
      setRoomModalData({
        theaterId: selectedTheaterForRoom,
        name: "",
        seatCount: 0,
      });
      setEditingRoomId(null);
    }
    setRoomModalOpen(true);
  };

  const saveRoom = async () => {
    if (!roomModalData?.name.trim()) {
      Swal.fire({ icon: "warning", title: "Vui lòng nhập tên phòng" });
      return;
    }
    if (!roomModalData.seatCount || roomModalData.seatCount <= 0) {
      Swal.fire({ icon: "warning", title: "Số ghế phải lớn hơn 0" });
      return;
    }
    try {
      setSavingRoom(true);
      if (editingRoomId) {
        await roomService.updateRoom(editingRoomId, roomModalData);
        Swal.fire({
          icon: "success",
          title: "Đã cập nhật",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        await roomService.createRoom(roomModalData);
        Swal.fire({
          icon: "success",
          title: "Đã thêm",
          timer: 1000,
          showConfirmButton: false,
        });
      }
      setRoomModalOpen(false);
      fetchRooms();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Lưu thất bại" });
    } finally {
      setSavingRoom(false);
    }
  };

  const deleteRoom = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Xóa phòng?",
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;
    try {
      setDeletingRoomId(id);
      await roomService.deleteRoom(id);
      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        timer: 1000,
        showConfirmButton: false,
      });
      fetchRooms();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Xóa thất bại" });
    } finally {
      setDeletingRoomId(null);
    }
  };

  // ================= FnB CRUD =================
  const openFnbModal = (item?: FnbItemResponse) => {
    if (item) {
      setFnbModalData({
        name: item.name,
        description: item.description || "",
        unitPrice: item.unitPrice,
      });
      setEditingFnbId(item.id);
    } else {
      setFnbModalData({
        name: "",
        description: "",
        unitPrice: 0,
      });
      setEditingFnbId(null);
    }
    setFnbModalOpen(true);
  };

  const saveFnb = async () => {
    if (!fnbModalData?.name.trim()) {
      Swal.fire({ icon: "warning", title: "Vui lòng nhập tên sản phẩm" });
      return;
    }
    if (!fnbModalData.unitPrice || fnbModalData.unitPrice <= 0) {
      Swal.fire({ icon: "warning", title: "Giá phải lớn hơn 0" });
      return;
    }
    try {
      setSavingFnb(true);
      if (editingFnbId) {
        await fnbService.updateFnbItem(editingFnbId, fnbModalData);
        Swal.fire({
          icon: "success",
          title: "Đã cập nhật",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        await fnbService.createFnbItem(fnbModalData);
        Swal.fire({
          icon: "success",
          title: "Đã thêm",
          timer: 1000,
          showConfirmButton: false,
        });
      }
      setFnbModalOpen(false);
      fetchFnbItems();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Lưu thất bại" });
    } finally {
      setSavingFnb(false);
    }
  };

  const deleteFnb = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Xóa sản phẩm?",
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;
    try {
      setDeletingFnbId(id);
      await fnbService.deleteFnbItem(id);
      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        timer: 1000,
        showConfirmButton: false,
      });
      fetchFnbItems();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Xóa thất bại" });
    } finally {
      setDeletingFnbId(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value) + "đ";

  // ================= Filter Data =================
  const filteredProvinces = provinces.filter((p) =>
    p.name.toLowerCase().includes(debouncedProvinceSearch.toLowerCase())
  );

  const filteredTheaters = theaters.filter((t) =>
    t.name.toLowerCase().includes(debouncedTheaterSearch.toLowerCase())
  );

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(debouncedRoomSearch.toLowerCase())
  );

  const filteredFnbItems = fnbItems.filter((f) =>
    f.name.toLowerCase().includes(debouncedFnbSearch.toLowerCase())
  );

  // ================= Render =================
  return (
    <div className="space-y-6">
      {/* Tab buttons */}
      <div className="flex border border-gray-400 rounded-lg p-0.5 bg-gray-50 w-fit">
        {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2
              ${
                activeTab === tab
                  ? "bg-yellow-500 text-white shadow-sm font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            {tab === "province" && <MapPin size={16} />}
            {tab === "theater" && <Building2 size={16} />}
            {tab === "room" && <DoorOpen size={16} />}
            {tab === "fnb" && <Coffee size={16} />}
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Province Tab */}
      {activeTab === "province" && (
        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center w-full md:flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm tỉnh/thành..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white border border-gray-400 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={provinceSearch}
                onChange={(e) => setProvinceSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => openProvinceModal()}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Plus size={16} /> Thêm tỉnh
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-400 relative">
            {provinceLoading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              </div>
            )}
            <table className="min-w-full divide-y divide-gray-400">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên tỉnh/thành
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-32">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400 bg-white">
                {filteredProvinces.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="text-center py-10 text-gray-500 italic"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredProvinces.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-yellow-600" />
                          {p.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openProvinceModal(p)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteProvince(p.id)}
                            disabled={deletingProvinceId === p.id}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingProvinceId === p.id ? (
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
          <div className="pt-4 text-sm text-gray-600">
            {filteredProvinces.length} tỉnh/thành
          </div>
        </div>
      )}

      {/* Theater Tab */}
      {activeTab === "theater" && (
        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-1">
              <CustomDropdown
                options={[
                  { value: "", label: "Tất cả tỉnh" },
                  ...provinces.map((p) => ({ value: p.id, label: p.name })),
                ]}
                value={selectedProvinceForTheater}
                onChange={setSelectedProvinceForTheater}
                placeholder="Tất cả tỉnh"
              />
              <div className="flex items-center flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm rạp..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white border border-gray-400 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={theaterSearch}
                  onChange={(e) => setTheaterSearch(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={() => openTheaterModal()}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Plus size={16} /> Thêm rạp
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-400 relative">
            {theaterLoading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              </div>
            )}
            <table className="min-w-full divide-y divide-gray-400">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên rạp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tỉnh
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-32">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400 bg-white">
                {filteredTheaters.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-10 text-gray-500 italic"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredTheaters.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-blue-600" />
                          {t.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {t.address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {t.provinceName}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openTheaterModal(t)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteTheater(t.id)}
                            disabled={deletingTheaterId === t.id}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingTheaterId === t.id ? (
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
          <div className="pt-4 text-sm text-gray-600">
            {filteredTheaters.length} rạp
          </div>
        </div>
      )}

      {/* Room Tab */}
      {activeTab === "room" && (
        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-1">
              <CustomDropdown
                options={[
                  { value: "", label: "Chọn tỉnh" },
                  ...provinces.map((p) => ({ value: p.id, label: p.name })),
                ]}
                value={selectedProvinceForRoom}
                onChange={(v) => {
                  setSelectedProvinceForRoom(v);
                  setSelectedTheaterForRoom("");
                }}
                placeholder="Chọn tỉnh"
              />
              <CustomDropdown
                options={[
                  { value: "", label: "Chọn rạp" },
                  ...theatersForRoom.map((t) => ({
                    value: t.id,
                    label: t.name,
                  })),
                ]}
                value={selectedTheaterForRoom}
                onChange={setSelectedTheaterForRoom}
                placeholder="Chọn rạp"
              />
              <div className="flex items-center flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm phòng..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white border border-gray-400 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={() => openRoomModal()}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Plus size={16} /> Thêm phòng
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-400 relative">
            {roomLoading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              </div>
            )}
            <table className="min-w-full divide-y divide-gray-400">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rạp
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Số ghế
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-32">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400 bg-white">
                {!selectedTheaterForRoom ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-10 text-gray-500 italic"
                    >
                      Vui lòng chọn rạp
                    </td>
                  </tr>
                ) : filteredRooms.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-10 text-gray-500 italic"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <DoorOpen size={16} className="text-purple-600" />
                          {r.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {r.theaterName}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        {r.seatCount}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openRoomModal(r)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteRoom(r.id)}
                            disabled={deletingRoomId === r.id}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingRoomId === r.id ? (
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
          <div className="pt-4 text-sm text-gray-600">
            {filteredRooms.length} phòng
          </div>
        </div>
      )}

      {/* FnB Tab */}
      {activeTab === "fnb" && (
        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center w-full md:flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white border border-gray-400 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={fnbSearch}
                onChange={(e) => setFnbSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => openFnbModal()}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Plus size={16} /> Thêm sản phẩm
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-400 relative">
            {fnbLoading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              </div>
            )}
            <table className="min-w-full divide-y divide-gray-400">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hình ảnh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-32">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400 bg-white">
                {filteredFnbItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-gray-500 italic"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredFnbItems.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {f.imageUrl ? (
                          <img
                            src={f.imageUrl}
                            alt={f.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Coffee size={20} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {f.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {f.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-yellow-600">
                        {formatCurrency(f.unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openFnbModal(f)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteFnb(f.id)}
                            disabled={deletingFnbId === f.id}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingFnbId === f.id ? (
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
          <div className="pt-4 text-sm text-gray-600">
            {filteredFnbItems.length} sản phẩm
          </div>
        </div>
      )}

      {/* Province Modal */}
      {provinceModalOpen && provinceModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setProvinceModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white border border-gray-400 rounded-2xl shadow-2xl z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                {editingProvinceId ? "Sửa tỉnh" : "Thêm tỉnh"}
              </h3>
              <button
                onClick={() => setProvinceModalOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tỉnh/thành
                </label>
                <input
                  type="text"
                  value={provinceModalData.name}
                  onChange={(e) =>
                    setProvinceModalData({
                      ...provinceModalData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nhập tên tỉnh/thành"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setProvinceModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={saveProvince}
                  disabled={savingProvince}
                  className="px-4 py-2 text-sm bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {savingProvince && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  )}
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theater Modal */}
      {theaterModalOpen && theaterModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setTheaterModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white border border-gray-400 rounded-2xl shadow-2xl z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                {editingTheaterId ? "Sửa rạp" : "Thêm rạp"}
              </h3>
              <button
                onClick={() => setTheaterModalOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉnh/Thành
                </label>
                <select
                  value={theaterModalData.provinceId}
                  onChange={(e) =>
                    setTheaterModalData({
                      ...theaterModalData,
                      provinceId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Chọn tỉnh</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên rạp
                </label>
                <input
                  type="text"
                  value={theaterModalData.name}
                  onChange={(e) =>
                    setTheaterModalData({
                      ...theaterModalData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nhập tên rạp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={theaterModalData.address}
                  onChange={(e) =>
                    setTheaterModalData({
                      ...theaterModalData,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nhập địa chỉ"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setTheaterModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={saveTheater}
                  disabled={savingTheater}
                  className="px-4 py-2 text-sm bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {savingTheater && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  )}
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {roomModalOpen && roomModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setRoomModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white border border-gray-400 rounded-2xl shadow-2xl z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                {editingRoomId ? "Sửa phòng" : "Thêm phòng"}
              </h3>
              <button
                onClick={() => setRoomModalOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên phòng
                </label>
                <input
                  type="text"
                  value={roomModalData.name}
                  onChange={(e) =>
                    setRoomModalData({ ...roomModalData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nhập tên phòng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số ghế
                </label>
                <input
                  type="number"
                  value={roomModalData.seatCount}
                  onChange={(e) =>
                    setRoomModalData({
                      ...roomModalData,
                      seatCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nhập số ghế"
                  min={1}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setRoomModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={saveRoom}
                  disabled={savingRoom}
                  className="px-4 py-2 text-sm bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {savingRoom && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  )}
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FnB Modal */}
      {fnbModalOpen && fnbModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setFnbModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white border border-gray-400 rounded-2xl shadow-2xl z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                {editingFnbId ? "Sửa sản phẩm" : "Thêm sản phẩm"}
              </h3>
              <button
                onClick={() => setFnbModalOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  value={fnbModalData.name}
                  onChange={(e) =>
                    setFnbModalData({ ...fnbModalData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nhập tên sản phẩm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={fnbModalData.description || ""}
                  onChange={(e) =>
                    setFnbModalData({
                      ...fnbModalData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nhập mô tả"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá (VNĐ)
                </label>
                <input
                  type="number"
                  value={fnbModalData.unitPrice}
                  onChange={(e) =>
                    setFnbModalData({
                      ...fnbModalData,
                      unitPrice: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nhập giá"
                  min={0}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setFnbModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={saveFnb}
                  disabled={savingFnb}
                  className="px-4 py-2 text-sm bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {savingFnb && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  )}
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
