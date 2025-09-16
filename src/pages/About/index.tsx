import Layout from '../../components/layout/Layout';

const About = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 py-20 pt-32">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Giới thiệu CineStar
          </h1>
          <div className="prose prose-lg mx-auto">
            <p className="text-gray-300 mb-6">
              CineStar là chuỗi rạp chiếu phim hàng đầu tại Việt Nam, mang đến trải nghiệm điện ảnh tuyệt vời cho khán giả.
            </p>
            <p className="text-gray-300 mb-6">
              Với hệ thống âm thanh và hình ảnh hiện đại, chúng tôi cam kết mang đến những phút giây giải trí đầy ấn tượng.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;