// src/app/(admin)/AdminDashboard.tsx  (hoặc đường dẫn file bạn đang dùng)
"use client";
import React, { useState, useEffect } from "react";
import Header from "../../../components/layout/Header";
import { useScrollToTop } from "@/hooks/useScrollToTop";

import OverviewCards from "@/components/admin/accounts/OverviewUserCards";
import UserRegistrationChart from "@/components/admin/accounts/UserRegistrationChart";
import RankDistributionChart from "@/components/admin/accounts/RankDistributionChart";
import UserManagementTable from "@/components/admin/accounts/UserManagementTable";
import MovieManagementTable from "@/components/admin/movies/MovieManagementTable";
import ShowtimeManagement from "@/components/admin/showtimes/ShowtimeManagement";
import BookingManagementTable from "@/components/admin/bookings/BookingManagementTable";
import OverviewBookingCards from "@/components/admin/bookings/OverviewBookingCards";
import PaymentManagementTable from "@/components/admin/payments/PaymentManagementTable";
import OverviewPaymentCards from "@/components/admin/payments/OverviewPaymentCards";
import FacilitiesManagement from "@/components/admin/facilities/FacilitiesManagement";
import PricingManagement from "@/components/admin/pricing/PricingManagement";
import NotificationManagementTable from "@/components/admin/notifications/NotificationManagementTable";
import ReviewManagementTable from "@/components/admin/reviews/ReviewManagementTable";
import PromotionManagementTable from "@/components/admin/promotions/PromotionManagementTable";
import FnbManagementTable from "@/components/admin/fnb/FnbManagementTable";

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
    id: "fnb",
    label: "Quản lý bắp nước",
  },
  {
    id: "notifications",
    label: "Quản lý thông báo",
  },
  { id: "reviews", label: "Quản lý đánh giá" },
  { id: "facilities", label: "Quản lý cơ sở vật chất" },
  { id: "pricing", label: "Quản lý giá vé" },
  { id: "promotions", label: "Quản lý mã giảm giá" },
];

const STORAGE_KEY = "admin_dashboard_tab";

const AdminDashboard: React.FC = () => {
  // Initialize from localStorage or default to "accounts"
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Validate saved tab exists in TABS
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
        <div className="w-64 bg-black border-r border-gray-600 shadow-lg fixed h-full top-0 z-10 pt-16">
          <div className="p-3">
            {/* SIDEBAR NAVIGATION */}
            <nav className="space-y-2">
              {TABS.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      // Don't scroll to top when switching tabs - let user stay at current position
                    }}
                    className={`w-full text-left px-4 py-3 rounded-md text-md font-medium transition-colors ${
                      isActive
                        ? "bg-yellow-500 text-black shadow-md"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
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

              {activeTab === "pricing" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý giá vé
                  </h2>
                  <PricingManagement />
                </section>
              )}

              {activeTab === "movies" && (
                <section>
                  <MovieManagementTable />
                </section>
              )}

              {activeTab === "showtimes" && (
                <section>
                  <ShowtimeManagement />
                </section>
              )}

              {activeTab === "bookings" && (
                <section className="space-y-6">
                  <OverviewBookingCards />
                  <BookingManagementTable />
                </section>
              )}

              {activeTab === "payments" && (
                <section className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Quản lý thanh toán
                  </h2>
                  <OverviewPaymentCards />
                  <PaymentManagementTable />
                </section>
              )}

              {activeTab === "fnb" && (
                <section className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Quản lý bắp nước
                  </h2>
                  <FnbManagementTable />
                </section>
              )}

              {activeTab === "notifications" && (
                <section className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Quản lý thông báo
                  </h2>
                  <NotificationManagementTable />
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

              {activeTab === "promotions" && (
                <section className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Quản lý mã giảm giá
                  </h2>
                  <PromotionManagementTable />
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
