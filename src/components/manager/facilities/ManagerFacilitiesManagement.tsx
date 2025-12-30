"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Edit2,
  Plus,
  DoorOpen,
  Armchair,
  X,
  Building2,
} from "lucide-react";
import Swal from "sweetalert2";

import { theaterService } from "@/services/showtime/theaterService";
import { roomService } from "@/services/showtime/roomService";
import { seatService } from "@/services/showtime/seatService";
import { managerService, userProfileService } from "@/services/userprofile";
import type { RoomResponse, RoomRequest } from "@/types/showtime/room.type";
import type { SeatResponse, SeatRequest } from "@/types/showtime/seat.type";
import { useDebounce } from "@/hooks/useDebounce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { useAuthStore } from "@/stores/authStore";

type TabType = "room" | "seat";

const TAB_LABELS: Record<TabType, string> = {
  room: "Phòng chiếu",
  seat: "Ghế ngồi",
};

export default function ManagerFacilitiesManagement(): React.JSX.Element {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("room");
  const [managedTheaterId, setManagedTheaterId] = useState<string>("");
  const [managedTheaterName, setManagedTheaterName] = useState<string>("");
  const [loadingTheater, setLoadingTheater] = useState(true);

  // ================= Rooms =================
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomSearch, setRoomSearch] = useState("");
  const debouncedRoomSearch = useDebounce(roomSearch, 300);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomModalData, setRoomModalData] = useState<RoomRequest | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [savingRoom, setSavingRoom] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

  // ================= Seats =================
  const [seats, setSeats] = useState<SeatResponse[]>([]);
  const [seatLoading, setSeatLoading] = useState(false);
  const [seatSearch, setSeatSearch] = useState("");
  const debouncedSeatSearch = useDebounce(seatSearch, 300);
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [seatModalData, setSeatModalData] = useState<SeatRequest[]>([]);
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);
  const [selectedRoomForSeat, setSelectedRoomForSeat] = useState<string>("");
  const [savingSeat, setSavingSeat] = useState(false);
  const [deletingSeatId, setDeletingSeatId] = useState<string | null>(null);

  useBodyScrollLock(roomModalOpen || seatModalOpen);

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

      // Get theater ID from name
      const theaters = await theaterService.getAllTheaters();
      const theater = theaters.find(
        (t) => t.name === managerInfo.managedCinemaName
      );
      if (theater) {
        setManagedTheaterId(theater.id);
      }
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

  // Load rooms when theater is loaded
  useEffect(() => {
    if (managedTheaterId && activeTab === "room") {
      fetchRooms();
    }
  }, [managedTheaterId, activeTab, debouncedRoomSearch]);

  // Load seats when room is selected
  useEffect(() => {
    if (selectedRoomForSeat && activeTab === "seat") {
      fetchSeats();
    }
  }, [selectedRoomForSeat, activeTab, debouncedSeatSearch]);

  // ================= Room Functions =================
  const fetchRooms = async () => {
    if (!managedTheaterId) return;

    setRoomLoading(true);
    try {
      const allRooms = await roomService.getRoomsByTheaterId(managedTheaterId);
      const filteredRooms = debouncedRoomSearch
        ? allRooms.filter((room) =>
            room.name.toLowerCase().includes(debouncedRoomSearch.toLowerCase())
          )
        : allRooms;
      setRooms(filteredRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      Swal.fire({ icon: "error", title: "Không thể tải danh sách phòng" });
    } finally {
      setRoomLoading(false);
    }
  };

  const openRoomModal = (room?: RoomResponse) => {
    if (room) {
      setEditingRoomId(room.id);
      setRoomModalData({
        name: room.name,
        theaterId: managedTheaterId,
        seatCount: room.seatCount,
      });
    } else {
      setEditingRoomId(null);
      setRoomModalData({
        name: "",
        theaterId: managedTheaterId,
        seatCount: 0,
      });
    }
    setRoomModalOpen(true);
  };

  const closeRoomModal = () => {
    setRoomModalOpen(false);
    setRoomModalData(null);
    setEditingRoomId(null);
    setSavingRoom(false);
  };

  const saveRoom = async () => {
    if (!roomModalData) return;

    setSavingRoom(true);
    try {
      if (editingRoomId) {
        await roomService.updateRoom(editingRoomId, roomModalData);
        Swal.fire({
          icon: "success",
          title: "Cập nhật phòng thành công",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await roomService.createRoom(roomModalData);
        Swal.fire({
          icon: "success",
          title: "Thêm phòng thành công",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      closeRoomModal();
      fetchRooms();
    } catch (error) {
      console.error("Error saving room:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: editingRoomId
          ? "Không thể cập nhật phòng"
          : "Không thể thêm phòng",
      });
    } finally {
      setSavingRoom(false);
    }
  };

  const deleteRoom = async (roomId: string) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa phòng này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    setDeletingRoomId(roomId);
    try {
      await roomService.deleteRoom(roomId);
      Swal.fire({
        icon: "success",
        title: "Xóa phòng thành công",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      Swal.fire({ icon: "error", title: "Không thể xóa phòng" });
    } finally {
      setDeletingRoomId(null);
    }
  };

  // ================= Seat Functions =================
  const fetchSeats = async () => {
    if (!selectedRoomForSeat) return;

    setSeatLoading(true);
    try {
      const allSeats = await seatService.getSeatsByRoomId(selectedRoomForSeat);
      const filteredSeats = debouncedSeatSearch
        ? allSeats.filter((seat) =>
            seat.rowLabel
              .toLowerCase()
              .includes(debouncedSeatSearch.toLowerCase())
          )
        : allSeats;
      setSeats(filteredSeats);
    } catch (error) {
      console.error("Error fetching seats:", error);
      Swal.fire({ icon: "error", title: "Không thể tải danh sách ghế" });
    } finally {
      setSeatLoading(false);
    }
  };

  const openSeatModal = (seat?: SeatResponse) => {
    if (seat) {
      setEditingSeatId(seat.id);
      setSeatModalData([
        {
          rowLabel: seat.rowLabel,
          columnIndex: seat.columnIndex,
          type: seat.type,
          roomId: selectedRoomForSeat,
          seatNumber: seat.seatNumber,
        },
      ]);
    } else {
      setEditingSeatId(null);
      setSeatModalData([
        {
          rowLabel: "",
          columnIndex: 1,
          type: "STANDARD",
          roomId: selectedRoomForSeat,
          seatNumber: "",
        },
      ]);
    }
    setSeatModalOpen(true);
  };

  const closeSeatModal = () => {
    setSeatModalOpen(false);
    setSeatModalData([]);
    setEditingSeatId(null);
    setSavingSeat(false);
  };

  const saveSeat = async () => {
    if (!seatModalData.length || !selectedRoomForSeat) return;

    setSavingSeat(true);
    try {
      if (editingSeatId) {
        await seatService.updateSeat(editingSeatId, seatModalData[0]);
        Swal.fire({
          icon: "success",
          title: "Cập nhật ghế thành công",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await seatService.createSeats(seatModalData);
        Swal.fire({
          icon: "success",
          title: "Thêm ghế thành công",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      closeSeatModal();
      fetchSeats();
    } catch (error) {
      console.error("Error saving seat:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: editingSeatId ? "Không thể cập nhật ghế" : "Không thể thêm ghế",
      });
    } finally {
      setSavingSeat(false);
    }
  };

  const deleteSeat = async (seatId: string) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa ghế này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    setDeletingSeatId(seatId);
    try {
      await seatService.deleteSeat(seatId);
      Swal.fire({
        icon: "success",
        title: "Xóa ghế thành công",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchSeats();
    } catch (error) {
      console.error("Error deleting seat:", error);
      Swal.fire({ icon: "error", title: "Không thể xóa ghế" });
    } finally {
      setDeletingSeatId(null);
    }
  };

  if (loadingTheater) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Theater Header */}
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Quản lý cơ sở vật chất - {managedTheaterName}
        </h3>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-400 w-fit">
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as TabType)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === key
                ? "bg-yellow-500 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Room Tab */}
      {activeTab === "room" && (
        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center w-full md:flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phòng..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white border border-gray-400 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => openRoomModal()}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-black hover:text-yellow-500 transition-colors"
            >
              <Plus size={16} />
              Thêm phòng
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-400">
            <table className="min-w-full divide-y divide-gray-400">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên phòng
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Số ghế
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400 bg-white">
                {roomLoading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : rooms.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-10 text-gray-500 italic"
                    >
                      Không có phòng nào
                    </td>
                  </tr>
                ) : (
                  rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <DoorOpen size={16} className="text-blue-600" />
                          {room.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        {room.seatCount}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openRoomModal(room)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteRoom(room.id)}
                            disabled={deletingRoomId === room.id}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Xóa"
                          >
                            {deletingRoomId === room.id ? (
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
        </div>
      )}

      {/* Seat Tab */}
      {activeTab === "seat" && (
        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center w-full md:flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm ghế..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white border border-gray-400 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={seatSearch}
                  onChange={(e) => setSeatSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => openSeatModal()}
                disabled={!selectedRoomForSeat}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-black hover:text-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Thêm ghế
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Chọn phòng:
              </label>
              <CustomDropdown
                options={[
                  { value: "", label: "Chọn phòng" },
                  ...rooms.map((room) => ({
                    value: room.id,
                    label: room.name,
                  })),
                ]}
                value={selectedRoomForSeat}
                onChange={setSelectedRoomForSeat}
                placeholder="Chọn phòng"
              />
            </div>
          </div>

          {selectedRoomForSeat ? (
            <div className="overflow-x-auto rounded-lg border border-gray-400">
              <table className="min-w-full divide-y divide-gray-400">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Số ghế
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hàng
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Cột
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Loại ghế
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-400 bg-white">
                  {seatLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      </tr>
                    ))
                  ) : seats.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-10 text-gray-500 italic"
                      >
                        Không có ghế nào
                      </td>
                    </tr>
                  ) : (
                    seats.map((seat) => (
                      <tr key={seat.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Armchair size={16} className="text-purple-600" />
                            {seat.seatNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {seat.rowLabel}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-700">
                          {seat.columnIndex}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              seat.type === "VIP"
                                ? "bg-yellow-100 text-yellow-800"
                                : seat.type === "COUPLE"
                                  ? "bg-pink-100 text-pink-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {seat.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openSeatModal(seat)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteSeat(seat.id)}
                              disabled={deletingSeatId === seat.id}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                              title="Xóa"
                            >
                              {deletingSeatId === seat.id ? (
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
          ) : (
            <div className="text-center py-10 text-gray-500 italic">
              Vui lòng chọn phòng để xem danh sách ghế
            </div>
          )}
        </div>
      )}

      {/* Room Modal */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeRoomModal}
          />
          <div className="relative w-full max-w-md bg-white border border-gray-400 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingRoomId ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
              </h3>
              <button
                onClick={closeRoomModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên phòng *
                </label>
                <input
                  type="text"
                  value={roomModalData?.name || ""}
                  onChange={(e) =>
                    setRoomModalData((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nhập tên phòng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số ghế
                </label>
                <input
                  type="number"
                  min="0"
                  value={roomModalData?.seatCount || 0}
                  onChange={(e) =>
                    setRoomModalData((prev) =>
                      prev
                        ? { ...prev, seatCount: parseInt(e.target.value) || 0 }
                        : null
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nhập số ghế"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeRoomModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={saveRoom}
                disabled={savingRoom || !roomModalData?.name}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-black hover:text-yellow-500 transition-colors disabled:opacity-50"
              >
                {savingRoom && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                )}
                {editingRoomId ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seat Modal */}
      {seatModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeSeatModal}
          />
          <div className="relative w-full max-w-md bg-white border border-gray-400 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingSeatId ? "Chỉnh sửa ghế" : "Thêm ghế mới"}
              </h3>
              <button
                onClick={closeSeatModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số ghế *
                </label>
                <input
                  type="text"
                  value={seatModalData[0]?.seatNumber || ""}
                  onChange={(e) =>
                    setSeatModalData([
                      {
                        ...seatModalData[0],
                        seatNumber: e.target.value,
                      },
                    ])
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Ví dụ: A1, B2, C3..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hàng ghế *
                </label>
                <input
                  type="text"
                  value={seatModalData[0]?.rowLabel || ""}
                  onChange={(e) =>
                    setSeatModalData([
                      {
                        ...seatModalData[0],
                        rowLabel: e.target.value,
                      },
                    ])
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Ví dụ: A, B, C..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cột ghế *
                </label>
                <input
                  type="number"
                  min="1"
                  value={seatModalData[0]?.columnIndex || 1}
                  onChange={(e) =>
                    setSeatModalData([
                      {
                        ...seatModalData[0],
                        columnIndex: parseInt(e.target.value) || 1,
                      },
                    ])
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại ghế *
                </label>
                <select
                  value={seatModalData[0]?.type || "STANDARD"}
                  onChange={(e) =>
                    setSeatModalData([
                      {
                        ...seatModalData[0],
                        type: e.target.value as "STANDARD" | "VIP" | "COUPLE",
                      },
                    ])
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="STANDARD">Thường</option>
                  <option value="VIP">VIP</option>
                  <option value="COUPLE">Couple</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeSeatModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={saveSeat}
                disabled={
                  savingSeat ||
                  !seatModalData[0]?.rowLabel ||
                  !seatModalData[0]?.columnIndex
                }
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-black hover:text-yellow-500 transition-colors disabled:opacity-50"
              >
                {savingSeat && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                )}
                {editingSeatId ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
