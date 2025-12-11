"use client";
import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import Swal from "sweetalert2";

import { staffService } from "@/services/userprofile";
import { theaterService } from "@/services/showtime/theaterService";
import type { StaffProfileResponse } from "@/types/userprofile";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import { Badge } from "@/components/ui/Badge";

export default function StaffTable(): React.JSX.Element {
  const [staffList, setStaffList] = useState<StaffProfileResponse[]>([]);
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTheaters, setLoadingTheaters] = useState<boolean>(true);

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

  return (
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
          <label className="text-sm font-medium text-gray-700">Chọn rạp:</label>
          {loadingTheaters ? (
            <div className="w-48 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm">
              Đang tải...
            </div>
          ) : (
            <select
              value={selectedCinema}
              onChange={(e) => setSelectedCinema(e.target.value)}
              className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm"
            >
              <option value="">-- Chọn rạp --</option>
              {theaters.map((theater) => (
                <option key={theater.id} value={theater.name}>
                  {theater.name}
                </option>
              ))}
            </select>
          )}
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
              <th className="w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhân viên
              </th>
              <th className="w-[150px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="w-[130px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số điện thoại
              </th>
              <th className="w-[150px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rạp làm việc
              </th>
              <th className="w-[120px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày vào làm
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-400 relative bg-white">
            {!selectedCinema ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-gray-500 italic text-sm"
                >
                  Vui lòng chọn rạp để xem danh sách nhân viên
                </td>
              </tr>
            ) : staffList.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={5}
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
          <span className="text-sm text-gray-500">Rạp: {selectedCinema}</span>
        </div>
      )}
    </div>
  );
}
