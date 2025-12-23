"use client";
import React, { useEffect, useState } from "react";
import { Users, Eye, Edit2, Trash2, X } from "lucide-react";
import Swal from "sweetalert2";

import { staffService } from "@/services/userprofile";
import { theaterService } from "@/services/showtime/theaterService";
import type { StaffProfileResponse } from "@/types/userprofile";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import { Badge } from "@/components/ui/Badge";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

export default function StaffTable(): React.JSX.Element {
  const [staffList, setStaffList] = useState<StaffProfileResponse[]>([]);
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTheaters, setLoadingTheaters] = useState<boolean>(true);

  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] =
    useState<StaffProfileResponse | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Scroll to top when component mounts
  useScrollToTop();
  useBodyScrollLock(isProfileModalOpen);

  // Load theaters on component mount
  useEffect(() => {
    loadTheaters();
  }, []);

  // Load staff when cinema is selected
  useEffect(() => {
    if (selectedCinema) {
      loadStaffByCinema(selectedCinema);
    } else {
      setStaffList([]);
    }
  }, [selectedCinema]);

  const loadTheaters = async () => {
    try {
      const theaterList = await theaterService.getAllTheaters();
      setTheaters(theaterList);

      // Auto select first theater if available
      if (theaterList.length > 0) {
        setSelectedCinema(theaterList[0].name);
      }
    } catch (error) {
      console.error("Error loading theaters:", error);
      Swal.fire({
        icon: "error",
        title: "Không thể tải danh sách rạp",
        text: "Vui lòng thử lại sau",
      });
    } finally {
      setLoadingTheaters(false);
    }
  };

  const loadStaffByCinema = async (cinemaName: string) => {
    setLoading(true);
    try {
      const staff = await staffService.getStaffByCinemaName(cinemaName);
      setStaffList(staff);
    } catch (error) {
      console.error("Error loading staff:", error);
      Swal.fire({
        icon: "error",
        title: "Không thể tải danh sách nhân viên",
        text: "Vui lòng thử lại sau",
      });
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  // Open profile modal
  const openProfileModal = async (staff: StaffProfileResponse) => {
    setSelectedStaff(staff);
    setIsProfileModalOpen(true);
    setProfileLoading(true);

    try {
      // userProfile is already populated in the response
      setUserProfile(staff.userProfile || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUserProfile(staff.userProfile || null);
    } finally {
      setProfileLoading(false);
    }
  };

  // Close profile modal
  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedStaff(null);
    setUserProfile(null);
  };

  return (
    <>
      <div className="bg-white border border-gray-400 rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Thông tin nhân viên
            </h3>
          </div>

          {/* Cinema selector */}
          <div className="flex items-center gap-2">
            <CustomDropdown
              options={theaters.map((theater) => ({
                value: theater.name,
                label: theater.name,
              }))}
              value={selectedCinema}
              onChange={setSelectedCinema}
              placeholder={loadingTheaters ? "Đang tải..." : "Chọn rạp"}
              disabled={loadingTheaters}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg relative border border-gray-400">
          {loading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm pointer-events-none z-10 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          <table
            className="min-w-full divide-y divide-blue-400/80 table-fixed"
            style={{ tableLayout: "fixed", width: "100%" }}
          >
            <thead className="sticky top-0 z-10 border-b border-gray-400 bg-gray-50">
              <tr>
                <th className="w-[170px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="w-[150px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="w-[110px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="w-[180px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rạp làm việc
                </th>
                <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày vào làm
                </th>
                <th className="w-[150px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-400 relative bg-white">
              {!selectedCinema ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-500 italic text-sm"
                  >
                    Vui lòng chọn rạp để xem danh sách nhân viên
                  </td>
                </tr>
              ) : staffList.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-500 italic text-sm"
                  >
                    Không có nhân viên nào tại rạp này
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr
                    key={staff.id}
                    className={`transition duration-150 ${
                      loading ? "opacity-60 pointer-events-none" : ""
                    } hover:bg-gray-50`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 text-left">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 truncate">
                          {staff.userProfile?.fullName || "Chưa cập nhật"}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {staff.userProfile?.username || "N/A"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center text-sm text-gray-900 truncate">
                      {staff.userProfile?.email || "N/A"}
                    </td>

                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {staff.userProfile?.phoneNumber || "-"}
                    </td>

                    <td className="px-6 py-4 text-center text-sm">
                      <Badge
                        type="AccountRole"
                        value={staff.cinemaName}
                        raw="staff"
                      />
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {new Date(staff.hireDate).toLocaleDateString("vi-VN")}
                    </td>

                    <td className="px-6 py-3 text-center text-base font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openProfileModal(staff)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Xem thông tin"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => {
                            Swal.fire({
                              icon: "info",
                              title: "Chỉnh sửa thông tin",
                              text: "Tính năng đang phát triển",
                            });
                          }}
                          className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={async () => {
                            const confirm = await Swal.fire({
                              title: "Xóa nhân viên?",
                              text: "Hành động này không thể hoàn tác",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonText: "Xóa",
                              cancelButtonText: "Hủy",
                            });
                            if (confirm.isConfirmed) {
                              try {
                                await staffService.deleteStaff(staff.id);
                                Swal.fire({
                                  icon: "success",
                                  title: "Đã xóa nhân viên",
                                  timer: 1500,
                                  showConfirmButton: false,
                                });
                                loadStaffByCinema(selectedCinema);
                              } catch (error) {
                                Swal.fire({
                                  icon: "error",
                                  title: "Lỗi xóa nhân viên",
                                  text: "Vui lòng thử lại sau",
                                });
                              }
                            }
                          }}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Xóa nhân viên"
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

        {/* Footer info */}
        {selectedCinema && (
          <div className="flex justify-between items-center pt-4">
            <span className="text-sm text-gray-700">
              Tổng số nhân viên: {staffList.length}
            </span>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {isProfileModalOpen && selectedStaff && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeProfileModal}
          />

          <div className="relative w-full max-w-3xl bg-white border border-gray-400 rounded-lg p-6 shadow-xl z-10 max-h-[90vh] overflow-y-auto">
            {profileLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="relative flex items-start gap-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <button
                    onClick={closeProfileModal}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-400 via-blue-500 to-blue-600 p-1">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
                        {userProfile?.avatarUrl ? (
                          <img
                            src={userProfile.avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-lg font-semibold">
                              {userProfile?.fullName?.charAt(0) ||
                                selectedStaff.userProfile?.fullName?.charAt(
                                  0
                                ) ||
                                "?"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 pr-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {userProfile?.fullName ||
                        selectedStaff.userProfile?.fullName ||
                        "Chưa cập nhật"}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedStaff.userProfile?.email || "N/A"}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        Nhân viên
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thông tin cá nhân */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-800 mb-3">
                    Thông tin cá nhân
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Họ và tên
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userProfile?.fullName ||
                          selectedStaff.userProfile?.fullName ||
                          "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Số điện thoại
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userProfile?.phoneNumber ||
                          selectedStaff.userProfile?.phoneNumber ||
                          "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ngày sinh
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userProfile?.dateOfBirth
                          ? new Date(
                              userProfile.dateOfBirth
                            ).toLocaleDateString("vi-VN")
                          : "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Giới tính
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userProfile?.gender === "MALE"
                          ? "Nam"
                          : userProfile?.gender === "FEMALE"
                            ? "Nữ"
                            : userProfile?.gender === "OTHER"
                              ? "Khác"
                              : "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        CMND/CCCD
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userProfile?.nationalId || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Địa chỉ
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userProfile?.address || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thông tin công việc */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-800 mb-3">
                    Thông tin công việc
                  </h5>
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Rạp làm việc
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedStaff.cinemaName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ngày vào làm
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedStaff.hireDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={closeProfileModal}
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
