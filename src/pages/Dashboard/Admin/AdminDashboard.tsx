// src/app/(admin)/AdminDashboard.tsx  (hoặc đường dẫn file bạn đang dùng)
"use client";
import React, { useEffect, useRef, useState } from "react";
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

  // refs để đo vị trí các tab và container
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const navRef = useRef<HTMLDivElement | null>(null);

  // style cho indicator
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  // tính vị trí indicator dựa trên activeTab
  const updateIndicator = (tabId = activeTab) => {
    const idx = TABS.findIndex((t) => t.id === tabId);
    const tabEl = tabRefs.current[idx];
    const navEl = navRef.current;
    if (!tabEl || !navEl) {
      // nếu không tìm được, reset indicator (0 width)
      setIndicator({ left: 0, width: 0 });
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const rect = tabEl.getBoundingClientRect();
    const left = rect.left - navRect.left;
    const width = rect.width;
    setIndicator({ left, width });
  };

  useEffect(() => {
    // set vị trí ban đầu sau render (delay next tick to ensure layout)
    const id = requestAnimationFrame(() => updateIndicator());

    // recalc khi resize
    const onResize = () => updateIndicator();
    window.addEventListener("resize", onResize);

    // recalc on layout shifts (fonts, dynamic content)
    const ro = new ResizeObserver(() => updateIndicator());
    if (navRef.current) ro.observe(navRef.current);
    tabRefs.current.forEach((el) => el && ro.observe(el));

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update khi activeTab thay đổi
  useEffect(() => {
    updateIndicator();
    // try to scroll the active tab into view when overflowed
    const idx = TABS.findIndex((t) => t.id === activeTab);
    const tabEl = tabRefs.current[idx];
    if (tabEl) {
      // center the tab in the nav's scroll area if overflow present
      const nav = navRef.current;
      if (nav && nav.scrollWidth > nav.clientWidth) {
        const navRect = nav.getBoundingClientRect();
        const tabRect = tabEl.getBoundingClientRect();
        const offset =
          tabRect.left - navRect.left - (nav.clientWidth - tabRect.width) / 2;
        nav.scrollTo({ left: offset + nav.scrollLeft, behavior: "smooth" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <Layout>
      <div className="min-h-screen py-20 -mt-10">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Chào mừng{" "}
            <span className="text-yellow-300">
              {user?.username ?? "Quản trị viên"}
            </span>
          </h1>

          {/* NAV TABS */}
          <div className="w-full mx-auto mb-8 mt-12">
            <div
              ref={navRef}
              className="relative border-b border-yellow-400/40"
              role="tablist"
              aria-label="Admin sections"
            >
              {/* flex-1 on buttons makes tabs share available width equally */}
              <div className="flex items-stretch">
                {TABS.map((t, i) => {
                  const isActive = t.id === activeTab;
                  return (
                    <button
                      key={t.id}
                      ref={(el) => {
                        // use block body so the callback returns void (TS safe)
                        tabRefs.current[i] = el;
                      }}
                      role="tab"
                      id={`tab-${t.id}`}
                      aria-selected={isActive}
                      aria-controls={`panel-${t.id}`}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex-1 text-center relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
                        ${isActive ? "text-white bg-yellow-400/20 rounded-md" : "text-yellow-200 hover:text-white/90"}
                      `}
                      title={t.description}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* background thin underline (subtle) */}
              <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-yellow-400/10 pointer-events-none" />

              {/* moving indicator */}
              <div
                aria-hidden
                className="absolute bottom-0 h-1.5 bg-yellow-300 rounded-full shadow-sm pointer-events-none"
                style={{
                  transform: `translateX(${indicator.left}px)`,
                  width: indicator.width,
                  transition:
                    "transform 220ms cubic-bezier(.2,.9,.3,1), width 220ms cubic-bezier(.2,.9,.3,1)",
                }}
              />
            </div>
          </div>

          {/* TAB CONTENT */}
          <div className="space-y-12">
            {activeTab === "accounts" && (
              <>
                <section
                  id="panel-accounts"
                  role="tabpanel"
                  aria-labelledby="tab-accounts"
                >
                  <h2 className="text-2xl font-light mb-6 text-yellow-300">
                    Tổng quan hệ thống tài khoản
                  </h2>
                  <OverviewCards />
                </section>

                <section
                  id="panel-chart"
                  role="tabpanel"
                  aria-labelledby="tab-chart"
                >
                  <h2 className="text-2xl font-light mb-6 text-yellow-300">
                    Biểu đồ: Số tài khoản đăng ký rạp (theo tháng)
                  </h2>
                  <UserRegistrationChart />
                </section>

                <section
                  id="panel-table"
                  role="tabpanel"
                  aria-labelledby="tab-table"
                >
                  <h2 className="text-2xl font-light mb-6 text-yellow-300">
                    Bảng quản lý tài khoản
                  </h2>
                  <UserManagementTable />
                </section>
              </>
            )}

            {activeTab === "facilities" && (
              <section
                id="panel-facilities"
                role="tabpanel"
                aria-labelledby="tab-facilities"
              >
                <h2 className="text-2xl font-light mb-6 text-yellow-300">
                  Quản lý cơ sở vật chất
                </h2>
                <FacilitiesManagement />
              </section>
            )}

            {activeTab === "reports" && (
              <section
                id="panel-reports"
                role="tabpanel"
                aria-labelledby="tab-reports"
              >
                <h2 className="text-2xl font-light mb-6 text-yellow-300">
                  Quản lý phim 
                </h2>
                <MovieManagementTable />
              </section>
            )}

            {activeTab === "showtimes" && (
              <section
                id="panel-showtimes"
                role="tabpanel"
                aria-labelledby="tab-showtimes"
              >
                <h2 className="text-2xl font-light mb-6 text-yellow-300">
                  Quản lý lịch chiếu
                </h2>
                <ShowtimeManagement />
              </section>
            )}

            {activeTab === "bookings" && (
                <section
                id="panel-bookings"
                role="tabpanel"
                aria-labelledby="tab-bookings"
              >
                <h2 className="text-2xl font-light mb-6 text-yellow-300">
                  Quản lý giao dịch & thanh toán
                </h2>
                <BookingManagementTable />
              </section>
            )}

            {activeTab === "logs" && (
              <div className="bg-black/60 border border-yellow-400/40 rounded-2xl p-6 shadow-2xl text-yellow-100">
                <h3 className="text-xl font-semibold mb-2">
                  Nhật ký hoạt động
                </h3>
                <p className="text-sm text-yellow-100/80">
                  Audit logs, recent activities, security events.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
