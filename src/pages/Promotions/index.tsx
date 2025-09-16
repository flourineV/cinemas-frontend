import Layout from '../../components/layout/Layout';

const Promotions = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 py-20 pt-32">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Khuyến mãi đặc biệt
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Thứ 3 vui vẻ</h3>
              <p className="text-gray-600 mb-4">Giảm 50% giá vé cho tất cả suất chiếu vào thứ 3 hàng tuần</p>
              <span className="text-yellow-500 font-bold">Giảm 50%</span>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Combo sinh viên</h3>
              <p className="text-gray-600 mb-4">Ưu đãi đặc biệt cho sinh viên với combo bắp nước</p>
              <span className="text-yellow-500 font-bold">Từ 99K</span>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Happy Hour</h3>
              <p className="text-gray-600 mb-4">Giá ưu đãi cho các suất chiếu từ 10h-14h</p>
              <span className="text-yellow-500 font-bold">Từ 65K</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Promotions;