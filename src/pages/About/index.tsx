import Layout from '../../components/layout/Layout';

const About = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero / Giới thiệu */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Giới thiệu CineHub
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl mb-12">
            CineHub là nền tảng điện ảnh hiện đại, giúp bạn khám phá phim mới, trailer, và quản lý danh sách yêu thích của mình một cách dễ dàng.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-white mb-2">Kho phim khổng lồ</h3>
              <p className="text-gray-300 text-sm">
                Truy cập hàng nghìn bộ phim, poster, đánh giá và ngày phát hành.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-white mb-2">Trailer & Video</h3>
              <p className="text-gray-300 text-sm">
                Xem trailer chính thức trực tiếp mà không cần rời CineHub.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-white mb-2">Danh sách yêu thích</h3>
              <p className="text-gray-300 text-sm">
                Tạo danh sách phim yêu thích và không bỏ lỡ bộ phim nào.
              </p>
            </div>
          </div>

          {/* About / Thông tin chi tiết */}
          <div className="prose prose-lg mx-auto text-center text-gray-300">
            <p>
              CineHub được thiết kế dành cho những người yêu điện ảnh. Khám phá, quản lý và theo dõi những bộ phim yêu thích của bạn tất cả trong một nền tảng.
            </p>
            <p>
              Giao diện thân thiện, cập nhật theo thời gian thực, CineHub giúp bạn kết nối gần hơn với thế giới điện ảnh.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
