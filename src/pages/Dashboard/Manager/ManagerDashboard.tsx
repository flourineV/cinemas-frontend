// src/pages/Dashboard/Manager/ManagerDashboard.tsx
"use client";
import React, { useState } from "react";
import Header from "../../../components/layout/Header";
import { useAuthStore } from "@/stores/authStore";
import { useScrollToTop } from "@/hooks/useScrollToTop";

import OverviewCards from "@/components/admin/accounts/OverviewUserCards";
import UserRegistrationChart from "@/components/admin/accounts/UserRegistrationChart";
import RankDistributionChart from "@/components/admin/accounts/RankDistributionChart";
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
    label: "Quản lý tài khoản",
  },
  { id: "movies", label: "Quản lý phim" },
  {
    id: "showtimes",
    label: "Quản lý lịch chiếu",
  },
  {
    id: "bookings",
    label: "Quản lý đặt vé",
  },
  {
    id: "payments",
    label: "Quản lý thanh toán",
  },
  {
    id: "notifications",
    label: "Quản lý thông báo",
  },
  { id: "reviews", label: "Quản lý đánh giá" },
  { id: "facilities", label: "Quản lý cơ sở vật chất" },
  { id: "promotions", label: "Quản lý mã giảm giá" },
];

const ManagerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>("accounts");

  // Scroll to top when route changes
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {/* SIDEBAR - Fixed */}
        <div className="w-64 bg-white border-r border-gray-400 shadow-lg fixed h-full top-0 z-10 pt-16">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Bảng Điều Khiển Quản Lý
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Chào mừng {user?.username ?? "Quản lý"}
            </p>

            {/* SIDEBAR NAVIGATION */}
            <nav className="space-y-2">
              {TABS.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      // Scroll to top instantly when switching tabs
                      window.scrollTo({ top: 0, behavior: "auto" });
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-yellow-500 text-white shadow-md"
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

        {/* MAIN CONTENT - Scrollable */}
        <div className="flex-1 ml-64 pt-16">
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              {activeTab === "accounts" && (
                <div className="space-y-8">
                  <section>
                    <OverviewCards />
                  </section>

                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                        Số tài khoản đăng ký rạp (theo tháng)
                      </h2>
                      <div className="flex-1">
                        <UserRegistrationChart />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                        Phân bố hạng thành viên
                      </h2>
                      <div className="flex-1">
                        <RankDistributionChart />
                      </div>
                    </div>
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

              {activeTab === "movies" && (
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
    </div>
  );
};

export default ManagerDashboard;
