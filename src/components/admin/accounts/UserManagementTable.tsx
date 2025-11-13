"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Trash2,
  Edit2,
  Save,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  ChevronDown,
  Download,
} from "lucide-react";
import Swal from "sweetalert2";

import { userAdminService } from "@/services/auth/userService";
import type { UserListResponse, GetUsersParams } from "@/types/auth/stats.type";
import { useDebounce } from "@/hooks/useDebounce";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { Badge } from "@/components/ui/Badge";

/* Local label maps — purely UI text */
const ROLE_LABELS: Record<string, string> = {
  customer: "Khách hàng",
  staff: "Nhân viên",
  manager: "Quản lý",
  admin: "Admin",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Đã vô hiệu hoá",
};

const ITEMS_PER_PAGE = 10;

export default function UserManagementTable(): React.JSX.Element {
  const [users, setUsers] = useState<UserListResponse[]>([]);
  const [paging, setPaging] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // UI: search + debounce + filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [selectedRole, setSelectedRole] = useState<"Tất cả" | string>("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState<"Tất cả" | string>(
    "Tất cả"
  );
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // modal state for updating role
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState<UserListResponse | null>(null);
  const [modalRole, setModalRole] = useState<string>("");

  // role dropdown inside modal (mirrors status dropdown style)
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement | null>(null);

  // dropdown outside click via hook
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick(
    dropdownRef,
    () => setIsStatusDropdownOpen(false),
    isStatusDropdownOpen
  );

  // close role dropdown when clicking outside modal's role dropdown
  useOutsideClick(
    roleDropdownRef,
    () => setIsRoleDropdownOpen(false),
    isRoleDropdownOpen
  );

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
    }
  };
  const goToPrevPage = () => {
    if (paging.page > 1 && !isRefreshing) {
      setPaging((p) => ({ ...p, page: p.page - 1 }));
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
      background: "#0b1020",
      color: "#fff",
    });
    if (!confirm.isConfirmed) return;
    try {
      await userAdminService.deleteUser(id);
      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        timer: 1000,
        showConfirmButton: false,
        background: "#0b1020",
        color: "#fff",
      });
      fetchUsers(paging.page);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Xóa thất bại",
        background: "#0b1020",
        color: "#fff",
      });
    }
  }

  // open role modal for a user
  function openRoleModal(u: UserListResponse) {
    setModalUser(u);
    setModalRole(u.role ?? "");
    setIsRoleModalOpen(true);
    setIsRoleDropdownOpen(false);
  }

  // close role modal
  function closeRoleModal() {
    setIsRoleModalOpen(false);
    setModalUser(null);
    setModalRole("");
    setIsRoleDropdownOpen(false);
  }

  // submit role update from modal: show confirm then call API
  async function submitRoleUpdate() {
    if (!modalUser) return;
    if (!modalRole) {
      Swal.fire({ icon: "warning", title: "Chọn role trước khi cập nhật" });
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
      background: "#300f00ff",
      color: "#fff",
      customClass: {
        popup: "border border-yellow-400 rounded-xl shadow-xl",
        title: "text-yellow-200",
        confirmButton: "bg-yellow-400 text-black hover:bg-yellow-300",
        cancelButton:
          "border border-yellow-400 text-yellow-100 hover:bg-black/40",
      },
    });

    if (!confirmation.isConfirmed) return;

    try {
      // <-- gọi API updateUserRole từ userAdminService như bạn yêu cầu
      await userAdminService.updateUserRole(modalUser.id, modalRole);
      Swal.fire({
        icon: "success",
        title: "Đổi role thành công",
        timer: 900,
        showConfirmButton: false,
        background: "#0b1020",
        color: "#fff",
      });
      closeRoleModal();
      fetchUsers(paging.page);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Cập nhật role thất bại",
        background: "#0b1020",
        color: "#fff",
      });
    }
  }

  function exportCurrentCSV() {
    const headers = [
      "id",
      "username",
      "email",
      "phoneNumber",
      "role",
      "status",
      "createdAt",
    ];
    const rows = users.map((u) => [
      u.id,
      u.username,
      u.email,
      u.phoneNumber,
      u.role ?? "",
      u.status,
      u.createdAt,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_page_${paging.page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // skeleton while loading data first time
  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10">
        Đang tải danh sách người dùng...
      </div>
    );
  }

  return (
    <>
      <div
        className="
        bg-black/60 backdrop-blur-md
        border border-yellow-400/40
        rounded-2xl p-6
        shadow-2xl text-white
      "
      >
        {/* Header: search + status dropdown + export */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {/* SEARCH: now flex-1 so it takes the remaining space */}
          <div className="flex items-center w-full md:flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
            <input
              type="text"
              placeholder="Tìm kiếm username, email hoặc số điện thoại..."
              className="w-full pl-10 pr-4 py-2 text-base rounded-lg
                       bg-black/30 border border-yellow-400/40
                       text-white placeholder-white/60
                       focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400
                       transition"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPaging((p) => ({ ...p, page: 1 }));
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen((s) => !s)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium
                         bg-black/40 border border-yellow-400/40 rounded-lg text-white
                         hover:bg-black/50"
              >
                <span className="whitespace-nowrap">
                  {selectedStatus === "Tất cả"
                    ? "Tất cả"
                    : (STATUS_LABELS[selectedStatus] ?? selectedStatus)}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isStatusDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-black/60 backdrop-blur-md border border-yellow-400/40 z-20 animate-fadeIn">
                  <div className="py-1">
                    {[
                      ["Tất cả", "Tất cả"],
                      ...Object.entries(STATUS_LABELS),
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedStatus(key);
                          setIsStatusDropdownOpen(false);
                          setPaging((p) => ({ ...p, page: 1 }));
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors
                          ${
                            selectedStatus === key
                              ? "text-yellow-300 bg-black/50 font-semibold"
                              : "text-yellow-100/80 hover:bg-black/40"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => exportCurrentCSV()}
              className="flex items-center gap-2 px-3.5 py-2 text-sm 
             border border-yellow-400/40 rounded-lg 
             bg-black/40 text-white hover:bg-black/50
             whitespace-nowrap shrink-0"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* Role filter bar */}
        <div className="flex space-x-2 mb-4">
          <div className="flex border border-yellow-400/40 rounded-lg p-0.5 bg-black/40">
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
                      ? "bg-black/60 text-yellow-300 shadow-sm font-semibold"
                      : "text-yellow-100/85 hover:bg-black/50"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg relative border border-yellow-400/40">
          {isRefreshing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm pointer-events-none z-10 rounded-lg">
              <Loader2 className="animate-spin w-6 h-6 text-yellow-300" />
            </div>
          )}

          <table
            className="min-w-full divide-y divide-yellow-400/80 table-fixed"
            style={{ tableLayout: "fixed", width: "100%" }}
          >
            <thead className="sticky top-0 z-10 border-b border-yellow-400/70">
              <tr className="bg-black/40 backdrop-blur-sm">
                <th className="w-[150px] px-6 py-3 text-left text-sm font-bold text-yellow-400 uppercase">
                  Người dùng
                </th>
                <th className="w-[130px] px-6 py-3 text-center text-sm font-bold text-yellow-400 uppercase">
                  Số điện thoại
                </th>
                <th className="w-[140px] px-6 py-3 text-center text-sm font-bold text-yellow-400 uppercase">
                  Vai trò
                </th>
                <th className="w-[140px] px-6 py-3 text-center text-sm font-bold text-yellow-400 uppercase">
                  Trạng thái
                </th>
                <th className="w-[100px] px-6 py-3 text-center text-sm font-bold text-yellow-400 uppercase">
                  Ngày tạo
                </th>
                <th className="w-[150px] px-6 py-3 text-center text-sm font-bold text-yellow-400 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-yellow-400/40 relative">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-yellow-100 italic text-base"
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
                    } hover:bg-black/40`}
                  >
                    <td className="px-6 py-3 text-base text-yellow-100 text-left truncate">
                      <div className="flex flex-col">
                        <span className="font-semibold text-yellow-300 truncate text-base">
                          {u.username ?? u.email}
                        </span>
                        <span className="text-sm text-yellow-100/70 truncate">
                          {u.email}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-center text-base text-yellow-100 truncate">
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

                    <td className="px-6 py-3 text-base text-yellow-100 text-center">
                      {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                    </td>

                    <td className="px-6 py-3 text-center text-base font-medium">
                      <div className="flex items-center justify-center gap-2">
                        {/* open modal to update role */}
                        <button
                          onClick={() => openRoleModal(u)}
                          className="px-2 py-1 flex items-center gap-2 rounded text-base font-light text-white whitespace-nowrap"
                          title="Sửa role"
                        >
                          <Edit2 size={14} />
                          <span className="leading-none">Cập nhật role</span>
                        </button>

                        <button
                          onClick={() => onDelete(u.id)}
                          className="px-2 py-1 rounded text-base text-red-400"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
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
          <span className="text-base text-yellow-100">
            Trang {paging.page}/{paging.totalPages} • {paging.total} người dùng
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={paging.page <= 1 || isRefreshing}
              className={`p-2 rounded-md transition ${
                paging.page <= 1 || isRefreshing
                  ? "text-yellow-100/50 cursor-not-allowed"
                  : "text-yellow-100 hover:bg-black/40"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={goToNextPage}
              disabled={paging.page >= paging.totalPages || isRefreshing}
              className={`p-2 rounded-md transition ${
                paging.page >= paging.totalPages || isRefreshing
                  ? "text-yellow-100/50 cursor-not-allowed"
                  : "text-yellow-100 hover:bg-black/40"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Role Modal */}
      {isRoleModalOpen && modalUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeRoleModal}
          />

          {/* modal panel */}
          <div className="relative w-full max-w-md bg-black/60 border border-yellow-400/40 rounded-2xl p-6 shadow-2xl text-white z-10">
            <h3 className="text-xl font-bold mb-3 text-center text-yellow-400">
              Cập nhật role
            </h3>

            <p className="text-lg text-white mb-4">
              User:{" "}
              <span className="font-medium text-yellow-300">
                {modalUser.username ?? modalUser.email}
              </span>
            </p>

            <label className="block text-md font-light text-white mb-2">
              Chọn role
            </label>

            {/* role dropdown styled like status dropdown */}
            <div className="relative" ref={roleDropdownRef}>
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen((s) => !s)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-black/30 border border-yellow-400/40 text-white"
              >
                <span>
                  {modalRole
                    ? (ROLE_LABELS[modalRole] ?? modalRole)
                    : "-- Chọn role --"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 rounded-md shadow-lg bg-black/60 backdrop-blur-md border border-yellow-400/40 z-20 animate-fadeIn">
                  <div className="py-1">
                    <button
                      key={"empty"}
                      onClick={() => {
                        setModalRole("");
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors
                        ${modalRole === "" ? "text-yellow-300 bg-black/50 font-semibold" : "text-yellow-100/80 hover:bg-black/40"}`}
                    >
                      -- Chọn role --
                    </button>

                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setModalRole(key);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors
                          ${modalRole === key ? "text-yellow-300 bg-black/50 font-semibold" : "text-yellow-100/80 hover:bg-black/40"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={closeRoleModal}
                className="px-3 py-2 rounded-lg text-yellow-100 hover:bg-black/40"
              >
                Huỷ
              </button>

              <button
                onClick={submitRoleUpdate}
                className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-medium hover:bg-yellow-300"
              >
                Cập nhật role
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
