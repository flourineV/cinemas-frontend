import Layout from '../../components/layout/Layout';

const UserDashboard = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 py-20 pt-32">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Dashboard Khách Hàng
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Booking History */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Lịch sử đặt vé</h2>
              <p className="text-gray-300">Xem lại các vé đã đặt</p>
              <button className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                Xem chi tiết
              </button>
            </div>

            {/* Current Bookings */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Vé hiện tại</h2>
              <p className="text-gray-300">Quản lý vé đã đặt</p>
              <button className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                Xem vé
              </button>
            </div>

            {/* Profile */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Thông tin cá nhân</h2>
              <p className="text-gray-300">Cập nhật thông tin tài khoản</p>
              <button className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">
                Chỉnh sửa
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Thao tác nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Đặt vé ngay</h3>
                <p className="text-gray-300 mb-4">Chọn phim và đặt vé nhanh chóng</p>
                <button className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
                  Đặt vé
                </button>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Ưu đãi đặc biệt</h3>
                <p className="text-gray-300 mb-4">Xem các chương trình khuyến mãi</p>
                <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                  Xem ưu đãi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;