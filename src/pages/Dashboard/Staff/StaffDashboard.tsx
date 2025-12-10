import { useState } from "react";
import Layout from "../../../components/layout/Layout";

const TABS = [
  { id: "overview", label: "Tổng quan" },
  { id: "tickets", label: "Quản lý vé" },
  { id: "support", label: "Hỗ trợ khách hàng" },
  { id: "schedule", label: "Lịch chiếu" },
  { id: "reports", label: "Báo cáo bán hàng" },
  { id: "inventory", label: "Kho hàng" },
  { id: "shifts", label: "Ca làm việc" },
];

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="flex">
          {/* SIDEBAR */}
          <div className="w-64 min-h-screen bg-white border-r border-gray-200 shadow-sm">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Staff Panel
              </h1>
              <p className="text-sm text-gray-600 mb-6">Dashboard Nhân Viên</p>

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
                          ? "bg-green-500 text-white shadow-sm"
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
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                      Thống kê nhanh
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-blue-600 rounded-lg p-6 text-center">
                        <h3 className="text-2xl font-bold text-white">156</h3>
                        <p className="text-blue-100">Vé bán hôm nay</p>
                      </div>
                      <div className="bg-green-600 rounded-lg p-6 text-center">
                        <h3 className="text-2xl font-bold text-white">2.5M</h3>
                        <p className="text-green-100">Doanh thu ca</p>
                      </div>
                      <div className="bg-purple-600 rounded-lg p-6 text-center">
                        <h3 className="text-2xl font-bold text-white">12</h3>
                        <p className="text-purple-100">Suất chiếu</p>
                      </div>
                      <div className="bg-orange-600 rounded-lg p-6 text-center">
                        <h3 className="text-2xl font-bold text-white">3</h3>
                        <p className="text-orange-100">Yêu cầu hỗ trợ</p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "tickets" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý vé
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600 mb-4">
                      Xử lý đặt vé và hoàn tiền
                    </p>
                    <button className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                      Quản lý vé
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "support" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Hỗ trợ khách hàng
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600 mb-4">
                      Xử lý yêu cầu từ khách hàng
                    </p>
                    <button className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                      Xem yêu cầu
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "schedule" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Lịch chiếu
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600 mb-4">
                      Quản lý lịch chiếu phim
                    </p>
                    <button className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                      Xem lịch
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "reports" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Báo cáo bán hàng
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600 mb-4">
                      Thống kê doanh thu theo ca
                    </p>
                    <button className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                      Xem báo cáo
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "inventory" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Kho hàng
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600 mb-4">
                      Quản lý đồ ăn, nước uống
                    </p>
                    <button className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                      Quản lý kho
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "shifts" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Ca làm việc
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600 mb-4">Xem lịch và điểm danh</p>
                    <button className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                      Xem ca làm
                    </button>
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

export default StaffDashboard;
