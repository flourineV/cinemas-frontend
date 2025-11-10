import Layout from "../../../components/layout/Layout";

const AdminDashboard = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Dashboard Quản Trị Viên
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* User Management */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Quản lý người dùng
              </h2>
              <p className="text-gray-300">Thêm, sửa, xóa tài khoản</p>
              <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Quản lý user
              </button>
            </div>

            {/* Cinema Management */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Quản lý rạp
              </h2>
              <p className="text-gray-300">Cấu hình rạp và phòng chiếu</p>
              <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Quản lý rạp
              </button>
            </div>

            {/* Movie Management */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Quản lý phim
              </h2>
              <p className="text-gray-300">Thêm phim mới và cập nhật</p>
              <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Quản lý phim
              </button>
            </div>

            {/* Schedule Management */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Lịch chiếu tổng
              </h2>
              <p className="text-gray-300">Quản lý lịch toàn hệ thống</p>
              <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Quản lý lịch
              </button>
            </div>

            {/* Financial Reports */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Báo cáo tài chính
              </h2>
              <p className="text-gray-300">Doanh thu và thống kê</p>
              <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Xem báo cáo
              </button>
            </div>

            {/* Promotion Management */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Quản lý khuyến mãi
              </h2>
              <p className="text-gray-300">Tạo và quản lý ưu đãi</p>
              <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Quản lý KM
              </button>
            </div>

            {/* System Settings */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Cài đặt hệ thống
              </h2>
              <p className="text-gray-300">Cấu hình toàn hệ thống</p>
              <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Cài đặt
              </button>
            </div>

            {/* Analytics */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Phân tích dữ liệu
              </h2>
              <p className="text-gray-300">Dashboard thống kê chi tiết</p>
              <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Xem phân tích
              </button>
            </div>
          </div>

          {/* System Overview */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">
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
          </div>

          {/* Recent Activities */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Hoạt động gần đây
            </h2>
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-gray-300">
                    Người dùng mới đăng ký: user123@example.com
                  </span>
                  <span className="text-gray-400 text-sm">5 phút trước</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-gray-300">
                    Phim mới được thêm: Avatar 3
                  </span>
                  <span className="text-gray-400 text-sm">1 giờ trước</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-gray-300">
                    Lịch chiếu được cập nhật cho rạp CGV Landmark
                  </span>
                  <span className="text-gray-400 text-sm">2 giờ trước</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">
                    Khuyến mãi "Thứ 3 vui vẻ" được kích hoạt
                  </span>
                  <span className="text-gray-400 text-sm">3 giờ trước</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
