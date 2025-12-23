"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Edit2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Ban,
  Unlock,
} from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

import { userAdminService } from "@/services/auth/userService";
import {
  userProfileService,
  staffService,
  managerService,
} from "@/services/userprofile";
import { theaterService } from "@/services/showtime/theaterService";
import type { UserListResponse, GetUsersParams } from "@/types/auth/stats.type";
import type {
  StaffProfileResponse,
  ManagerProfileResponse,
} from "@/types/userprofile";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import { useDebounce } from "@/hooks/useDebounce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useAuthStore } from "@/stores/authStore";
import { Badge } from "@/components/ui/Badge";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import StaffTable from "./StaffTable";
import ManagerTable from "./ManagerTable";

/* Local label maps — purely UI text */
const ROLE_LABELS: Record<string, string> = {
  customer: "Khách hàng",
  staff: "Nhân viên",
  manager: "Quản lý",
  admin: "Admin",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  BANNED: "Đã bị cấm",
};

const ITEMS_PER_PAGE = 10;

export default function UserManagementTable(): React.JSX.Element {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserListResponse[]>([]);
  const [paging, setPaging] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if current user is admin
  const isAdmin = currentUser?.role === "admin";

  // UI: search + debounce + filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [selectedRole, setSelectedRole] = useState<"Tất cả" | string>("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState<"Tất cả" | string>(
    "Tất cả"
  );

  // modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalUser, setModalUser] = useState<UserListResponse | null>(null);
  const [modalRole, setModalRole] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [staffInfo, setStaffInfo] = useState<StaffProfileResponse | null>(null);
  const [managerInfo, setManagerInfo] = useState<ManagerProfileResponse | null>(
    null
  );
  const [editProfile, setEditProfile] = useState<any>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Role modal additional fields
  const [cinemaName, setCinemaName] = useState<string>("");
  const [hireDate, setHireDate] = useState<string>("");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [loadingTheaters, setLoadingTheaters] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Apply scroll lock when any modal is open
  useBodyScrollLock(isRoleModalOpen || isProfileModalOpen);

  // fetch users (keeps same data shape as your service expects)
  const fetchUsers = async (page = 1, showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      else setIsRefreshing(true);

      const params: GetUsersParams = {
        page,
        size: ITEMS_PER_PAGE,
        keyword:
          debouncedSearch && debouncedSearch.length > 0
            ? debouncedSearch
            : undefined,
        role: selectedRole !== "Tất cả" ? selectedRole : undefined,
        status: selectedStatus !== "Tất cả" ? selectedStatus : undefined,
        sortBy: "createdAt",
        sortType: "DESC",
      };

      const res = await userAdminService.getAllUsers(params);
      const pageResp = res.data as {
        data?: UserListResponse[];
        page?: number;
        totalPages?: number;
        totalElements?: number;
      };

      const items = pageResp.data ?? [];
      setUsers(items);
      setPaging({
        page: pageResp.page ?? page,
        totalPages: pageResp.totalPages ?? 1,
        total: pageResp.totalElements ?? items.length ?? 0,
      });
    } catch (err) {
      console.error("fetchUsers error", err);
      Swal.fire({ icon: "error", title: "Không thể tải danh sách người dùng" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchUsers(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch when filters/search/page change (avoids double-fetch during initial load)
  useEffect(() => {
    if (!loading) {
      fetchUsers(paging.page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole, selectedStatus, debouncedSearch, paging.page]);

  // pagination helpers
  const goToNextPage = () => {
    if (paging.page < paging.totalPages && !isRefreshing) {
      setPaging((p) => ({ ...p, page: p.page + 1 }));
      // Scroll to section title when changing page
      setTimeout(() => {
        const element = document.getElementById("user-management-table");
        if (element) {
          const headerHeight = 200; // Account for fixed header + section title
          const elementTop = element.offsetTop - headerHeight;
          window.scrollTo({ top: elementTop, behavior: "smooth" });
        }
      }, 100);
    }
  };
  const goToPrevPage = () => {
    if (paging.page > 1 && !isRefreshing) {
      setPaging((p) => ({ ...p, page: p.page - 1 }));
      // Scroll to section title when changing page
      setTimeout(() => {
        const element = document.getElementById("user-management-table");
        if (element) {
          const headerHeight = 200; // Account for fixed header + section title
          const elementTop = element.offsetTop - headerHeight;
          window.scrollTo({ top: elementTop, behavior: "smooth" });
        }
      }, 100);
    }
  };

  // actions (preserve existing API contracts)
  async function onDelete(id: string) {
    const confirm = await Swal.fire({
      title: "Xóa user?",
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    });
    if (!confirm.isConfirmed) return;
    try {
      await userAdminService.deleteUser(id);
      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        timer: 1000,
        showConfirmButton: false,
      });
      fetchUsers(paging.page);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Xóa thất bại",
      });
    }
  }

  // open role modal for a user
  async function openRoleModal(u: UserListResponse) {
    setModalUser(u);
    setModalRole(u.role ?? "");
    setIsRoleModalOpen(true);

    // Load theaters for cinema selection
    setLoadingTheaters(true);
    try {
      const theaterList = await theaterService.getAllTheaters();
      setTheaters(theaterList);
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
  }

  // close role modal
  function closeRoleModal() {
    setIsRoleModalOpen(false);
    setModalUser(null);
    setModalRole("");
    setCinemaName("");
    setHireDate("");
    setIsUpdatingRole(false);
    setTheaters([]);
    setLoadingTheaters(false);
  }

  // open profile modal
  async function openProfileModal(user: UserListResponse) {
    setModalUser(user);
    setIsProfileModalOpen(true);
    setProfileLoading(true);
    setStaffInfo(null);
    setManagerInfo(null);

    try {
      // Gọi API lấy user profile bằng userProfileService
      const profileData = await userProfileService.getProfileByUserId(user.id);
      setUserProfile(profileData);
      setEditProfile(profileData); // Khởi tạo dữ liệu cho edit form

      // Nếu là staff, lấy thông tin staff
      if (user.role === "staff") {
        try {
          const staffData = await staffService.getStaffByUserProfile(
            profileData.id
          );
          setStaffInfo(staffData);
        } catch (error) {
          console.log("Không tìm thấy thông tin staff");
        }
      }

      // Nếu là manager, lấy thông tin manager
      if (user.role === "manager") {
        try {
          const managerData = await managerService.getManagerByUser(
            profileData.id
          );
          setManagerInfo(managerData);
        } catch (error) {
          console.log("Không tìm thấy thông tin manager");
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Swal.fire({
        icon: "error",
        title: "Không thể tải thông tin profile",
        text: "Profile có thể chưa được tạo cho user này.",
      });
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }

  // close profile modal
  function closeProfileModal() {
    setIsProfileModalOpen(false);
    setIsEditMode(false);
    setModalUser(null);
    setUserProfile(null);
    setStaffInfo(null);
    setManagerInfo(null);
    setEditProfile({});
    setIsSavingProfile(false);
  }

  // toggle edit mode
  function toggleEditMode() {
    if (isEditMode) {
      // Cancel edit - reset to original data
      setEditProfile(userProfile);
    }
    setIsEditMode(!isEditMode);
  }

  // save profile changes
  async function saveProfileChanges() {
    if (!modalUser || !editProfile) return;

    setIsSavingProfile(true);
    try {
      const updatedProfile = await userProfileService.updateProfile(
        modalUser.id,
        {
          fullName: editProfile.fullName,
          phoneNumber: editProfile.phoneNumber,
          address: editProfile.address,
          gender: editProfile.gender,
        }
      );

      setUserProfile(updatedProfile);
      setEditProfile(updatedProfile);
      setIsEditMode(false);

      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công!",
        text: "Thông tin profile đã được cập nhật.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi cập nhật",
        text: "Không thể cập nhật thông tin profile.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  // handle input change for edit form
  function handleEditInputChange(field: string, value: string) {
    setEditProfile((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }

  // handle ban/unban user
  async function handleBanUnbanUser() {
    if (!modalUser) return;

    const isBanned = modalUser.status === "BANNED";
    const action = isBanned ? "mở khóa" : "cấm";
    const newStatus = isBanned ? "ACTIVE" : "BANNED";

    const confirmation = await Swal.fire({
      title: `Xác nhận ${action} tài khoản?`,
      html: `<strong>${modalUser.username ?? modalUser.email}</strong>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: action === "cấm" ? "Cấm" : "Mở khóa",
      confirmButtonColor: action === "cấm" ? "#dc2626" : "#16a34a",
    });

    if (!confirmation.isConfirmed) return;

    setIsUpdatingStatus(true);
    try {
      // 1. Update user status in auth service
      await userAdminService.updateUserStatus(modalUser.id, newStatus);

      // Note: Profile status will be synced automatically by backend

      // Update local state
      setModalUser({ ...modalUser, status: newStatus });

      Swal.fire({
        icon: "success",
        title: `${action === "cấm" ? "Đã cấm" : "Đã mở khóa"} tài khoản`,
        timer: 1500,
        showConfirmButton: false,
      });

      // Refresh user list
      fetchUsers(paging.page);
    } catch (error) {
      console.error("Error updating user status:", error);
      Swal.fire({
        icon: "error",
        title: `Lỗi ${action} tài khoản`,
        text: "Vui lòng thử lại sau",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  // submit role update from modal: show confirm then call API
  async function submitRoleUpdate() {
    if (!modalUser) return;
    if (!modalRole) {
      Swal.fire({ icon: "warning", title: "Chọn role trước khi cập nhật" });
      return;
    }

    // Validate additional fields for staff/manager
    if ((modalRole === "staff" || modalRole === "manager") && !cinemaName) {
      Swal.fire({ icon: "warning", title: "Vui lòng nhập tên rạp" });
      return;
    }
    if ((modalRole === "staff" || modalRole === "manager") && !hireDate) {
      Swal.fire({ icon: "warning", title: "Vui lòng chọn ngày vào làm" });
      return;
    }

    const confirmation = await Swal.fire({
      title: "Xác nhận cập nhật role?",
      html: `<strong>${modalUser.username ?? modalUser.email}</strong> → <em>${
        ROLE_LABELS[modalRole] ?? modalRole
      }</em>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
      confirmButtonColor: "#eab308",
    });

    if (!confirmation.isConfirmed) return;

    setIsUpdatingRole(true);
    try {
      const oldRole = modalUser.role;

      // 1. Update user role first
      await userAdminService.updateUserRole(modalUser.id, modalRole);

      // 2. Get user profile to get userProfileId
      let userProfileId: string;
      try {
        const profileData = await userProfileService.getProfileByUserId(
          modalUser.id
        );
        userProfileId = profileData.id;
      } catch (error) {
        console.error("User profile not found:", error);
        throw new Error(
          "User này chưa có profile. Vui lòng tạo profile trước khi cập nhật role."
        );
      }

      // 3. Handle staff/manager profile creation/deletion
      if (modalRole === "staff") {
        // Create staff profile
        await staffService.createStaff({
          userProfileId: userProfileId,
          cinemaName: cinemaName,
          hireDate: hireDate,
        });
      } else if (modalRole === "manager") {
        // Create manager profile
        await managerService.createManager({
          userProfileId: userProfileId,
          managedCinemaName: cinemaName,
          hireDate: hireDate,
        });
      }

      // 4. Delete old staff/manager profile if downgrading
      if (oldRole === "staff" && modalRole !== "staff") {
        try {
          const oldStaffInfo =
            await staffService.getStaffByUserProfile(userProfileId);
          await staffService.deleteStaff(oldStaffInfo.id);
        } catch (error) {
          console.log("No staff profile to delete");
        }
      }
      if (oldRole === "manager" && modalRole !== "manager") {
        try {
          const oldManagerInfo =
            await managerService.getManagerByUser(userProfileId);
          await managerService.deleteManager(oldManagerInfo.id);
        } catch (error) {
          console.log("No manager profile to delete");
        }
      }

      Swal.fire({
        icon: "success",
        title: "Cập nhật role thành công",
        timer: 1500,
        showConfirmButton: false,
      });
      closeRoleModal();
      fetchUsers(paging.page);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Cập nhật role thất bại",
        text: "Vui lòng thử lại sau",
      });
    } finally {
      setIsUpdatingRole(false);
    }
  }

  async function exportAllCSV() {
    try {
      // Fetch tất cả users
      const allUsersResponse = await userAdminService.getAllUsers({
        page: 1,
        size: 10000, // Lấy nhiều để đảm bảo có tất cả
      });

      const allUsers = allUsersResponse.data.data || [];

      const headers = [
        "ID",
        "Tên đăng nhập",
        "Email",
        "Số điện thoại",
        "Vai trò",
        "Trạng thái",
        "Ngày tạo",
      ];

      const rows = allUsers.map((u) => [
        u.id,
        u.username || "",
        u.email || "",
        u.phoneNumber || "",
        ROLE_LABELS[u.role ?? ""] || u.role || "",
        STATUS_LABELS[u.status] || u.status || "",
        u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "N/A",
      ]);

      // Tạo CSV với BOM để Excel hiển thị đúng tiếng Việt
      const csvContent =
        "\uFEFF" +
        [headers, ...rows]
          .map((r) =>
            r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
          )
          .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `all_users_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: `Đã xuất ${allUsers.length} người dùng (CSV)`,
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
      // Fetch tất cả users
      const allUsersResponse = await userAdminService.getAllUsers({
        page: 1,
        size: 10000, // Lấy nhiều để đảm bảo có tất cả
      });

      const allUsers = allUsersResponse.data.data || [];

      // Tạo workbook
      const wb = XLSX.utils.book_new();

      // Tạo worksheet data
      const wsData = [
        [
          "ID",
          "Tên đăng nhập",
          "Email",
          "Số điện thoại",
          "Vai trò",
          "Trạng thái",
          "Ngày tạo",
        ],
        ...allUsers.map((u) => [
          u.id,
          u.username || "",
          u.email || "",
          u.phoneNumber || "",
          ROLE_LABELS[u.role ?? ""] || u.role || "",
          STATUS_LABELS[u.status] || u.status || "",
          u.createdAt
            ? new Date(u.createdAt).toLocaleDateString("vi-VN")
            : "N/A",
        ]),
      ];

      // Tạo worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Tự động điều chỉnh độ rộng cột
      const colWidths = wsData[0].map((_, colIndex) => {
        const maxLength = Math.max(
          ...wsData.map((row) => String(row[colIndex] || "").length)
        );
        return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
      });
      ws["!cols"] = colWidths;

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách người dùng");

      // Xuất file
      XLSX.writeFile(
        wb,
        `all_users_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      Swal.fire({
        icon: "success",
        title: `Đã xuất ${allUsers.length} người dùng (Excel)`,
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

  // skeleton while loading data first time
  if (loading) {
    return (
      <div className="bg-white border border-gray-400 rounded-lg p-6">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center w-full md:flex-1 relative">
            <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Role filter skeleton */}
        <div className="flex space-x-2 mb-4">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Table skeleton */}
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

        {/* Pagination skeleton */}
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
        {/* Header: search + status dropdown + export */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {/* SEARCH: now flex-1 so it takes the remaining space */}
          <div className="flex items-center w-full md:flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm username, email hoặc số điện thoại..."
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
            <CustomDropdown
              options={[
                { value: "Tất cả", label: "Tất cả" },
                ...Object.entries(STATUS_LABELS).map(([key, label]) => ({
                  value: key,
                  label: label,
                })),
              ]}
              value={selectedStatus}
              onChange={(value) => {
                setSelectedStatus(value);
                setPaging((p) => ({ ...p, page: 1 }));
              }}
              placeholder="Tất cả"
            />

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

        {/* Role filter bar */}
        <div className="flex space-x-2 mb-4">
          <div className="flex border border-gray-400 rounded-lg p-0.5 bg-gray-50">
            {[["Tất cả", "Tất cả"], ...Object.entries(ROLE_LABELS)].map(
              ([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedRole(key);
                    setPaging((p) => ({ ...p, page: 1 }));
                  }}
                  className={`px-4 py-1 text-base font-medium rounded-lg transition-colors
                  ${
                    selectedRole === key
                      ? "bg-yellow-500 text-white shadow-sm font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Table */}
        <div
          id="user-management-table"
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
                <th className="w-[150px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="w-[130px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="w-[140px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="w-[140px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="w-[100px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="w-[150px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-400 relative bg-white">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-500 italic text-sm"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className={`transition duration-150 ${
                      isRefreshing ? "opacity-60 pointer-events-none" : ""
                    } hover:bg-gray-50`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 text-left">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 truncate">
                          {u.username ?? u.email}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {u.email}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {u.phoneNumber ?? "-"}
                    </td>

                    <td className="px-3 py-3 text-center">
                      <Badge
                        type="AccountRole"
                        value={ROLE_LABELS[u.role ?? ""] ?? u.role ?? ""}
                        raw={u.role ?? undefined}
                      />
                    </td>

                    <td className="px-3 py-3 text-center">
                      <Badge
                        type="AccountStatus"
                        value={STATUS_LABELS[u.status] ?? u.status}
                        raw={u.status ?? undefined}
                      />
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </td>

                    <td className="px-6 py-3 text-center text-base font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openProfileModal(u)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Xem profile"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => openRoleModal(u)}
                          className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors"
                          title="Sửa role"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => onDelete(u.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Xóa tài khoản"
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
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 gap-3">
          <span className="text-sm text-gray-700">
            Trang {paging.page}/{paging.totalPages} • {paging.total} người dùng
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

      {/* Profile Modal */}
      {isProfileModalOpen && modalUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeProfileModal}
          />

          <div className="relative w-full max-w-4xl bg-white border border-gray-400 rounded-lg p-6 shadow-xl z-10 max-h-[90vh] overflow-y-auto">
            {profileLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-yellow-600"></div>
              </div>
            ) : userProfile ? (
              <div className="space-y-8">
                <div className="relative flex items-start gap-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  {/* Nút đóng (X) nằm gọn trong ô xám, góc trên phải */}
                  <button
                    onClick={closeProfileModal}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-yellow-500 to-yellow-600 p-1">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
                        {userProfile.avatarUrl ? (
                          <img
                            src={userProfile.avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-lg font-semibold">
                              {userProfile.fullName?.charAt(0) ||
                                modalUser.username?.charAt(0) ||
                                "?"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thêm pr-8 để text không đè lên nút X */}
                  <div className="flex-1 pr-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {userProfile.fullName ||
                        modalUser.username ||
                        "Chưa cập nhật"}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {modalUser.email}
                    </p>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          modalUser.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : modalUser.role === "manager"
                              ? "bg-yellow-100 text-yellow-700"
                              : modalUser.role === "staff"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                        }`}
                      >
                        {ROLE_LABELS[modalUser.role || ""] || modalUser.role}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          modalUser.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {STATUS_LABELS[modalUser.status || ""] ||
                          modalUser.status}
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
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editProfile.fullName || ""}
                          onChange={(e) =>
                            handleEditInputChange("fullName", e.target.value)
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                          placeholder="Nhập họ và tên"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">
                          {userProfile.fullName || "Chưa cập nhật"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Số điện thoại
                      </label>
                      {isEditMode ? (
                        <input
                          type="tel"
                          value={editProfile.phoneNumber || ""}
                          onChange={(e) =>
                            handleEditInputChange("phoneNumber", e.target.value)
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                          placeholder="Nhập số điện thoại"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">
                          {userProfile.phoneNumber || "Chưa cập nhật"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ngày sinh
                      </label>
                      {isEditMode ? (
                        <input
                          type="date"
                          value={
                            editProfile.dateOfBirth
                              ? typeof editProfile.dateOfBirth === "string"
                                ? editProfile.dateOfBirth.split("T")[0]
                                : ""
                              : ""
                          }
                          onChange={(e) =>
                            handleEditInputChange("dateOfBirth", e.target.value)
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">
                          {userProfile.dateOfBirth
                            ? new Date(
                                userProfile.dateOfBirth
                              ).toLocaleDateString("vi-VN")
                            : "Chưa cập nhật"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Giới tính
                      </label>
                      {isEditMode ? (
                        <select
                          value={editProfile.gender || ""}
                          onChange={(e) =>
                            handleEditInputChange("gender", e.target.value)
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-black"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">
                          {userProfile.gender === "MALE"
                            ? "Nam"
                            : userProfile.gender === "FEMALE"
                              ? "Nữ"
                              : userProfile.gender === "OTHER"
                                ? "Khác"
                                : "Chưa cập nhật"}
                        </p>
                      )}
                    </div>
                    {/* CMND/CCCD */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        CMND/CCCD
                      </label>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editProfile.nationalId || ""}
                          onChange={(e) =>
                            handleEditInputChange("nationalId", e.target.value)
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white autofill:bg-white text-black"
                          placeholder="Nhập số CMND/CCCD"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">
                          {userProfile.nationalId || "Chưa cập nhật"}
                        </p>
                      )}
                    </div>
                    {/* Địa chỉ */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Địa chỉ
                      </label>
                      {isEditMode ? (
                        <textarea
                          value={editProfile.address || ""}
                          onChange={(e) =>
                            handleEditInputChange("address", e.target.value)
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-black"
                          placeholder="Nhập địa chỉ"
                          rows={2}
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">
                          {userProfile.address || "Chưa cập nhật"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thông tin thành viên */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-800 mb-3">
                    Thông tin thành viên
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Điểm tích lũy
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userProfile.loyaltyPoint || 0} điểm
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Hạng thành viên
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userProfile.rankName || "Bronze"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ngày tạo
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userProfile.createdAt
                          ? new Date(userProfile.createdAt).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Cập nhật lần cuối
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userProfile.updatedAt
                          ? new Date(userProfile.updatedAt).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thông tin công việc (Staff/Manager) */}
                {(staffInfo || managerInfo) && (
                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-3">
                      Thông tin công việc
                    </h5>
                    <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                      {staffInfo && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Rạp làm việc
                            </label>
                            <p className="mt-1 text-sm text-gray-900">
                              {staffInfo.cinemaName}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Ngày vào làm
                            </label>
                            <p className="mt-1 text-sm text-gray-900">
                              {new Date(staffInfo.hireDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                      {managerInfo && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Rạp quản lý
                            </label>
                            <p className="mt-1 text-sm text-gray-900">
                              {managerInfo.managedCinemaName}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Ngày nhận chức
                            </label>
                            <p className="mt-1 text-sm text-gray-900">
                              {new Date(
                                managerInfo.hireDate
                              ).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Không tìm thấy thông tin profile
              </p>
            )}

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              {isEditMode ? (
                <>
                  <button
                    onClick={toggleEditMode}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    disabled={isSavingProfile}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={saveProfileChanges}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </>
              ) : (
                <>
                  {isAdmin && userProfile && (
                    <>
                      <button
                        onClick={toggleEditMode}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={handleBanUnbanUser}
                        className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                          modalUser.status === "BANNED"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? (
                          "Đang xử lý..."
                        ) : modalUser.status === "BANNED" ? (
                          <>
                            <Unlock size={16} />
                            Mở khóa
                          </>
                        ) : (
                          <>
                            <Ban size={16} />
                            Cấm
                          </>
                        )}
                      </button>
                    </>
                  )}
                  <button
                    onClick={closeProfileModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Đóng
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && modalUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeRoleModal}
          />

          {/* modal panel */}
          <div className="relative w-full max-w-md bg-white border border-gray-300 rounded-lg p-6 shadow-xl z-10">
            {/* Header with close button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Cập nhật vai trò
              </h3>
              <button
                onClick={closeRoleModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* User info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Người dùng:</p>
                <p className="font-medium text-gray-900">
                  {modalUser.username ?? modalUser.email}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Vai trò hiện tại:{" "}
                  <span className="font-medium text-gray-700">
                    {ROLE_LABELS[modalUser.role || ""] ||
                      modalUser.role ||
                      "Chưa xác định"}
                  </span>
                </p>
              </div>

              {/* Role selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  value={modalRole}
                  onChange={(e) => setModalRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                >
                  <option value="">-- Chọn vai trò --</option>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional fields for staff/manager */}
              {(modalRole === "staff" || modalRole === "manager") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên rạp <span className="text-red-500">*</span>
                    </label>
                    {loadingTheaters ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                        Đang tải danh sách rạp...
                      </div>
                    ) : (
                      <select
                        value={cinemaName}
                        onChange={(e) => setCinemaName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày vào làm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={hireDate}
                      onChange={(e) => setHireDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={closeRoleModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isUpdatingRole}
              >
                Hủy
              </button>

              <button
                onClick={submitRoleUpdate}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isUpdatingRole}
              >
                {isUpdatingRole ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff and Manager Tables */}
      <div className="mt-8 space-y-6">
        <StaffTable />
        <ManagerTable />
      </div>
    </>
  );
}
