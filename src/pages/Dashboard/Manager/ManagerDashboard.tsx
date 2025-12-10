import { useState } from "react";
import Layout from "../../../components/layout/Layout";

const TABS = [
  { id: "overview", label: "Tổng quan" },
  { id: "users", label: "Quản lý người dùng" },
  { id: "cinemas", label: "Quản lý rạp" },
  { id: "movies", label: "Quản lý phim" },
  { id: "schedules", label: "Lịch chiếu" },
  { id: "reports", label: "Báo cáo tài chính" },
  { id: "promotions", label: "Khuyến mãi" },
  { id: "settings", label: "Cài đặt hệ thống" },
];

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="flex">
          {/* SIDEBAR */}
          <div className="w-64 min-h-screen bg-white border-r border-gray-200 shadow-sm">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Manager Panel
              </h1>
              <p className="text-sm text-gray-600 mb-6">Dashboard Quản trị</p>

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
                          ? "bg-blue-500 text-white shadow-sm"
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
                      Tổng quan hệ thống
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-center">
                        <h3 className="text-3xl font-bold text-white">1,248</h3>
                        <p className="text-blue-100">Tổng người dùng</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-center">
                        <h3 className="text-3xl font-bold text-white">45.2M</h3>
                        <p className="text-green-100">Doanh thu tháng</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-center">
                        <h3 className="text-3xl font-bold text-white">156</h3>
                        <p className="text-purple-100">Phim đang chiếu</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-6 text-center">
                        <h3 className="text-3xl font-bold text-white">24</h3>
                        <p className="text-orange-100">Rạp hoạt động</p>
                      </div>
                      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-center">
                        <h3 className="text-3xl font-bold text-white">98.5%</h3>
                        <p className="text-red-100">Uptime hệ thống</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                      Hoạt động gần đây
                    </h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-700">
                            Người dùng mới đăng ký: user123@example.com
                          </span>
                          <span className="text-gray-500 text-sm">
                            5 phút trước
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-700">
                            Phim mới được thêm: Avatar 3
                          </span>
                          <span className="text-gray-500 text-sm">
                            1 giờ trước
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-700">
                            Lịch chiếu được cập nhật cho rạp CGV Landmark
                          </span>
                          <span className="text-gray-500 text-sm">
                            2 giờ trước
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">
                            Khuyến mãi "Thứ 3 vui vẻ" được kích hoạt
                          </span>
                          <span className="text-gray-500 text-sm">
                            3 giờ trước
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "users" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý người dùng
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600 mb-4">
                      Thêm, sửa, xóa tài khoản
                    </p>
                    <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                      Quản lý user
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "cinemas" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý rạp
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600 mb-4">
                      Cấu hình rạp và phòng chiếu
                    </p>
                    <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                      Quản lý rạp
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "movies" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý phim
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600 mb-4">
                      Thêm phim mới và cập nhật
                    </p>
                    <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                      Quản lý phim
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "schedules" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Lịch chiếu tổng
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600 mb-4">
                      Quản lý lịch toàn hệ thống
                    </p>
                    <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                      Quản lý lịch
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "reports" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Báo cáo tài chính
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600 mb-4">Doanh thu và thống kê</p>
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                      Xem báo cáo
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "promotions" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Quản lý khuyến mãi
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600 mb-4">Tạo và quản lý ưu đãi</p>
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                      Quản lý KM
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "settings" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Cài đặt hệ thống
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600 mb-4">Cấu hình toàn hệ thống</p>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                      Cài đặt
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

export default ManagerDashboard;
