// src/app/(admin)/AdminDashboard.tsx  (hoặc đường dẫn file bạn đang dùng)
"use client";
import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useAuthStore } from "@/stores/authStore";

import OverviewCards from "@/components/admin/accounts/OverviewUserCards";
import UserRegistrationChart from "@/components/admin/accounts/UserRegistrationChart";
import UserManagementTable from "@/components/admin/accounts/UserManagementTable";
import MovieManagementTable from "@/components/admin/movies/MovieManagementTable";
import ShowtimeManagement from "@/components/admin/showtimes/ShowtimeManagement";
import BookingManagementTable from "@/components/admin/bookings/BookingManagementTable";
import FacilitiesManagement from "@/components/admin/facilities/FacilitiesManagement";

type Tab = {
  id: string;
  label: string;
  description?: string;
};

const TABS: Tab[] = [
  {
    id: "accounts",
    label: "Tài khoản",
  },
  { id: "facilities", label: "Quản lý cơ sở vật chất" },
  { id: "reports", label: "Quản lý phim" },
  {
    id: "showtimes",
    label: "Quản lý lịch chiếu",
  },
  {
    id: "bookings",
    label: "Quản lý giao dịch & thanh toán",
  },
  { id: "logs", label: "Quản lý dịch vụ" },
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>("accounts");

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="flex">
          {/* SIDEBAR */}
          <div className="w-64 min-h-screen bg-white border-r border-gray-200 shadow-sm">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Admin Panel
              </h1>
              <p className="text-sm text-gray-600 mb-6">
                Chào mừng {user?.username ?? "Quản trị viên"}
              </p>

              {/* SIDEBAR NAVIGATION */}
              <nav className="space-y-2">
                {TABS.map((tab) => {
                  const isActive = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-yellow-500 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              {activeTab === "accounts" && (
                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                      Tổng quan hệ thống tài khoản
                    </h2>
                    <OverviewCards />
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                      Biểu đồ: Số tài khoản đăng ký rạp (theo tháng)
                    </h2>
                    <UserRegistrationChart />
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                      Bảng quản lý tài khoản
                    </h2>
                    <UserManagementTable />
                  </section>
                </div>
              )}

              {activeTab === "facilities" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý cơ sở vật chất
                  </h2>
                  <FacilitiesManagement />
                </section>
              )}

              {activeTab === "reports" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý phim
                  </h2>
                  <MovieManagementTable />
                </section>
              )}

              {activeTab === "showtimes" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý lịch chiếu
                  </h2>
                  <ShowtimeManagement />
                </section>
              )}

              {activeTab === "bookings" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý giao dịch & thanh toán
                  </h2>
                  <BookingManagementTable />
                </section>
              )}

              {activeTab === "logs" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Nhật ký hoạt động
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-2 text-gray-800">
                      Nhật ký hoạt động
                    </h3>
                    <p className="text-sm text-gray-600">
                      Audit logs, recent activities, security events.
                    </p>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
