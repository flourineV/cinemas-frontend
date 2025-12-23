// src/pages/Dashboard/Manager/ManagerDashboard.tsx
"use client";
import React, { useState, useEffect } from "react";
import Header from "../../../components/layout/Header";
import { useAuthStore } from "@/stores/authStore";
import { useScrollToTop } from "@/hooks/useScrollToTop";

import ManagerStaffTable from "@/components/manager/accounts/ManagerStaffTable";
import ManagerMovieTable from "@/components/manager/movies/ManagerMovieTable";
import ManagerShowtimeManagement from "@/components/manager/showtimes/ManagerShowtimeManagement";
import ManagerBookingTable from "@/components/manager/bookings/ManagerBookingTable";
import ReviewManagementTable from "@/components/admin/reviews/ReviewManagementTable";
import FacilitiesManagement from "@/components/admin/facilities/FacilitiesManagement";

type Tab = {
  id: string;
  label: string;
};

const TABS: Tab[] = [
  { id: "accounts", label: "Quản lý nhân viên" },
  { id: "movies", label: "Quản lý phim" },
  { id: "showtimes", label: "Quản lý lịch chiếu" },
  { id: "bookings", label: "Quản lý đặt vé" },
  { id: "reviews", label: "Quản lý đánh giá" },
  { id: "facilities", label: "Quản lý cơ sở vật chất" },
];

const STORAGE_KEY = "manager_dashboard_tab";

const ManagerDashboard: React.FC = () => {
  const { user } = useAuthStore();

  // Initialize from localStorage or default to "accounts"
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && TABS.some((tab) => tab.id === saved)) {
      return saved;
    }
    return "accounts";
  });

  // Save to localStorage when tab changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeTab);
  }, [activeTab]);

  // Scroll to top when route changes
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {/* SIDEBAR - Fixed */}
        <div className="w-64 bg-white border-r border-gray-400 shadow-lg fixed h-full top-0 z-10 pt-16">
          <div className="p-3">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Bảng Điều Khiển
            </h1>
            <p className="text-lg font-light text-gray-600 mb-6">
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
                      window.scrollTo({ top: 0, behavior: "auto" });
                    }}
                    className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${
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
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý nhân viên
                  </h2>
                  <ManagerStaffTable />
                </section>
              )}

              {activeTab === "movies" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý phim
                  </h2>
                  <ManagerMovieTable />
                </section>
              )}

              {activeTab === "showtimes" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý lịch chiếu
                  </h2>
                  <ManagerShowtimeManagement />
                </section>
              )}

              {activeTab === "bookings" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý đặt vé
                  </h2>
                  <ManagerBookingTable />
                </section>
              )}

              {activeTab === "reviews" && (
                <section className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Quản lý đánh giá
                  </h2>
                  <ReviewManagementTable />
                </section>
              )}

              {activeTab === "facilities" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý cơ sở vật chất
                  </h2>
                  <FacilitiesManagement />
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
