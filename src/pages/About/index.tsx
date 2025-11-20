import { motion } from "framer-motion";
import { Package, Gift, Film } from "lucide-react";
import Layout from "../../components/layout/Layout";

const About = () => {
  const benefits = [
    {
      icon: Package,
      title: "Đặt vé tiện lợi",
      description:
        "Đặt vé online nhanh chóng, dễ dàng chỉ với vài bước đơn giản. Không cần xếp hàng, tiết kiệm thời gian.",
    },
    {
      icon: Gift,
      title: "Khuyến mãi ngập tràn",
      description:
        "Nhiều chương trình ưu đãi hấp dẫn, giảm giá đặc biệt dành cho thành viên thân thiết.",
    },
    {
      icon: Film,
      title: "Trải nghiệm đẳng cấp",
      description:
        "Hệ thống rạp hiện đại, âm thanh hình ảnh sống động, mang đến trải nghiệm điện ảnh đỉnh cao.",
    },
  ];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-black text-white"
      >
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative h-[500px] flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0">
            <img
              src="/intro_cinehub.jpg"
              alt="CineHub Cinema"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>
          </div>

          <div className="relative z-10 text-center px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-5xl md:text-6xl font-bold mb-4 text-yellow-400"
            >
              CineHub
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-2xl md:text-3xl text-gray-200"
            >
              Trải nghiệm điện ảnh đỉnh cao
            </motion.p>
          </div>
        </motion.section>

        {/* Company Description */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto px-4 py-16"
        >
          <h2 className="text-3xl font-bold mb-6 text-yellow-400 text-center">
            Về CineHub
          </h2>
          <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
            <p>
              CineHub là hệ thống rạp chiếu phim hàng đầu Việt Nam, mang đến cho
              khán giả những trải nghiệm điện ảnh đẳng cấp quốc tế. Với công
              nghệ hiện đại nhất, âm thanh sống động và hình ảnh sắc nét, chúng
              tôi cam kết đem lại những giây phút giải trí tuyệt vời nhất.
            </p>
            <p>
              Hệ thống rạp chiếu phim CineHub được trang bị hệ thống âm thanh
              Dolby Atmos, màn hình LED cao cấp, ghế ngồi êm ái và không gian
              sang trọng. Chúng tôi không ngừng nâng cấp cơ sở vật chất và dịch
              vụ để phục vụ khách hàng ngày càng tốt hơn.
            </p>
            <p>
              Với mạng lưới rạp chiếu phim trên toàn quốc, CineHub tự hào là
              điểm đến yêu thích của hàng triệu khán giả yêu điện ảnh. Hãy đến
              với CineHub để cùng nhau đắm chìm trong thế giới phim ảnh đầy màu
              sắc!
            </p>
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-6xl mx-auto px-4 py-16"
        >
          <h2 className="text-3xl font-bold mb-12 text-yellow-400 text-center">
            Lợi ích khi chọn CineHub
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="bg-gray-900 border border-yellow-400/20 rounded-lg p-6 hover:border-yellow-400/50 transition-colors"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-yellow-400/10 p-4 rounded-full">
                    <benefit.icon className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-yellow-400">
                  {benefit.title}
                </h3>
                <p className="text-gray-300 text-center leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-4xl mx-auto px-4 py-16 text-center"
        >
          <h2 className="text-3xl font-bold mb-6 text-yellow-400">
            Sẵn sàng cho trải nghiệm điện ảnh?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Đặt vé ngay hôm nay và khám phá thế giới phim ảnh cùng CineHub!
          </p>
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-yellow-600 hover:bg-yellow-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Xem phim ngay
          </motion.a>
        </motion.section>
      </motion.div>
    </Layout>
  );
};

export default About;
