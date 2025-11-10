import Layout from "../../../components/layout/Layout";

const StaffDashboard = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 py-20 pt-32">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Dashboard Nhân Viên
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Ticket Management */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Quản lý vé
              </h2>
              <p className="text-gray-300">Xử lý đặt vé và hoàn tiền</p>
              <button className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                Quản lý vé
              </button>
            </div>

            {/* Customer Service */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Hỗ trợ khách hàng
              </h2>
              <p className="text-gray-300">Xử lý yêu cầu từ khách hàng</p>
              <button className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                Xem yêu cầu
              </button>
            </div>

            {/* Schedule Management */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Lịch chiếu
              </h2>
              <p className="text-gray-300">Quản lý lịch chiếu phim</p>
              <button className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                Xem lịch
              </button>
            </div>

            {/* Sales Report */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Báo cáo bán hàng
              </h2>
              <p className="text-gray-300">Thống kê doanh thu theo ca</p>
              <button className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                Xem báo cáo
              </button>
            </div>

            {/* Inventory */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Kho hàng
              </h2>
              <p className="text-gray-300">Quản lý đồ ăn, nước uống</p>
              <button className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                Quản lý kho
              </button>
            </div>

            {/* Shift Management */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Ca làm việc
              </h2>
              <p className="text-gray-300">Xem lịch và điểm danh</p>
              <button className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                Xem ca làm
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StaffDashboard;
