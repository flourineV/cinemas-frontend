import Layout from '../../components/layout/Layout';

const Events = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 py-20 pt-32">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Tổ chức sự kiện
          </h1>
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Dịch vụ cho thuê rạp</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Sự kiện doanh nghiệp</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Hội nghị, hội thảo</li>
                  <li>• Buổi ra mắt sản phẩm</li>
                  <li>• Team building</li>
                  <li>• Đào tạo nội bộ</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Sự kiện cá nhân</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Sinh nhật, kỷ niệm</li>
                  <li>• Chiếu phim riêng tư</li>
                  <li>• Gặp gỡ, họp mặt</li>
                  <li>• Sự kiện gia đình</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 text-center">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold">
                Liên hệ đặt lịch
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Events;