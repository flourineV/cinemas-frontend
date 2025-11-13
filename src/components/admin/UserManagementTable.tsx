"use client";
import React, { useEffect, useRef, useState } from "react";
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

  // inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [roleInput, setRoleInput] = useState<string>("");

  // dropdown outside click via hook
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick(
    dropdownRef,
    () => setIsStatusDropdownOpen(false),
    isStatusDropdownOpen
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

  function startEdit(u: UserListResponse) {
    setEditingId(u.id);
    setRoleInput(u.role ?? "");
  }

  async function saveRole(id: string) {
    try {
      await userAdminService.updateUserRole(id, roleInput);
      Swal.fire({
        icon: "success",
        title: "Đổi role thành công",
        timer: 900,
        showConfirmButton: false,
        background: "#0b1020",
        color: "#fff",
      });
      setEditingId(null);
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

  async function toggleStatus(u: UserListResponse) {
    const newStatus = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const confirm = await Swal.fire({
      title: `${newStatus === "ACTIVE" ? "Kích hoạt" : "Vô hiệu hoá"} user?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      background: "#0b1020",
      color: "#fff",
    });
    if (!confirm.isConfirmed) return;
    try {
      await userAdminService.updateUserStatus(u.id, newStatus);
      Swal.fire({
        icon: "success",
        title: "Cập nhật trạng thái thành công",
        timer: 800,
        showConfirmButton: false,
        background: "#0b1020",
        color: "#fff",
      });
      fetchUsers(paging.page);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Cập nhật thất bại",
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
      <div className="text-center text-gray-500 dark:text-gray-400 py-10">
        Đang tải danh sách người dùng...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-400 dark:border-gray-700">
      {/* Header: search + status dropdown + export */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-grow mr-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm username, email hoặc số điện thoại..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-400 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
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
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-400 dark:border-gray-600"
            >
              <span>
                {selectedStatus === "Tất cả"
                  ? "Tất cả"
                  : (STATUS_LABELS[selectedStatus] ?? selectedStatus)}
              </span>
              <ChevronDown
                className={`w-4 h-4 ${isStatusDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 dark:ring-gray-600 z-20 animate-fadeIn">
                <div className="py-1">
                  {[["Tất cả", "Tất cả"], ...Object.entries(STATUS_LABELS)].map(
                    ([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedStatus(key);
                          setIsStatusDropdownOpen(false);
                          setPaging((p) => ({ ...p, page: 1 }));
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                          selectedStatus === key
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-600 font-semibold"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => exportCurrentCSV()}
            className="px-3 py-2 text-sm border border-gray-400 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Role filter bar */}
      <div className="flex space-x-2 mb-4">
        <div className="flex border border-gray-400 dark:border-gray-600 rounded-lg p-0.5 bg-gray-100 dark:bg-gray-700">
          {[["Tất cả", "Tất cả"], ...Object.entries(ROLE_LABELS)].map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedRole(key);
                  setPaging((p) => ({ ...p, page: 1 }));
                }}
                className={`px-4 py-1 text-sm font-medium rounded-lg transition-colors ${
                  selectedRole === key
                    ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-400 dark:border-gray-700 relative">
        {isRefreshing && (
          <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 flex items-center justify-center backdrop-blur-sm pointer-events-none z-10">
            <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
          </div>
        )}

        <table
          className="min-w-full divide-y divide-gray-400 dark:divide-gray-700 table-fixed"
          style={{ tableLayout: "fixed", width: "100%" }}
        >
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              <th className="w-[180px] px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                Người dùng
              </th>
              <th className="w-[200px] px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                Email
              </th>
              <th className="w-[140px] px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                Vai trò
              </th>
              <th className="w-[140px] px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                Trạng thái
              </th>
              <th className="w-[100px] px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                Ngày tạo
              </th>
              <th className="w-[150px] px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-400 dark:divide-gray-700 relative">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-10 text-gray-500 dark:text-gray-400 italic"
                >
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ${
                    isRefreshing ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-300 text-center truncate">
                    {u.email}
                  </td>

                  <td className="px-3 py-3 text-center">
                    <Badge
                      type="AccountRole"
                      value={ROLE_LABELS[u.role ?? ""] ?? u.role ?? ""}
                    />
                  </td>

                  <td className="px-3 py-3 text-center">
                    <Badge
                      type="AccountStatus"
                      value={STATUS_LABELS[u.status] ?? u.status}
                    />
                  </td>

                  <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                  </td>

                  <td className="px-6 py-3 text-center text-sm font-medium">
                    <div className="flex items-center justify-center gap-2">
                      {/* inline edit role */}
                      {editingId === u.id ? (
                        <>
                          <input
                            className="border border-gray-400 dark:border-gray-600 px-2 py-1 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            value={roleInput}
                            onChange={(e) => setRoleInput(e.target.value)}
                          />
                          <button
                            onClick={() => saveRole(u.id)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-sm"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 border border-gray-400 dark:border-gray-600 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(u)}
                            className="px-2 py-1 border border-gray-400 dark:border-gray-600 rounded text-sm"
                            title="Sửa role"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => toggleStatus(u)}
                            className="px-2 py-1 border border-gray-400 dark:border-gray-600 rounded text-sm"
                            title="Toggle status"
                          >
                            {u.status}
                          </button>

                          <button
                            onClick={() => onDelete(u.id)}
                            className="px-2 py-1 border border-gray-400 dark:border-gray-600 rounded text-sm text-red-600"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-400 dark:border-gray-700 mt-4">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Trang {paging.page}/{paging.totalPages} • {paging.total} người dùng
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevPage}
            disabled={paging.page <= 1 || isRefreshing}
            className={`p-2 rounded-md transition ${
              paging.page <= 1 || isRefreshing
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detail modal placeholder (if you have one, reuse it here) */}
      {/* {selectedUser && <AccountDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} onActionComplete={() => fetchUsers(paging.page)} />} */}
    </div>
  );
}
