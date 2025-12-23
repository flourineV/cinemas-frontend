import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Mail,
  Cookie,
  Baby,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState({
    hero: false,
    intro: false,
    sections: false,
    extra: false,
  });

  useEffect(() => {
    setTimeout(() => setIsVisible((prev) => ({ ...prev, hero: true })), 100);
    setTimeout(() => setIsVisible((prev) => ({ ...prev, intro: true })), 300);
    setTimeout(
      () => setIsVisible((prev) => ({ ...prev, sections: true })),
      500
    );
    setTimeout(() => setIsVisible((prev) => ({ ...prev, extra: true })), 700);
  }, []);

  const content = {
    vi: {
      title: "Chính Sách Bảo Mật",
      subtitle:
        "Bảo vệ quyền riêng tư của bạn là ưu tiên hàng đầu của chúng tôi",
      lastUpdated: "Cập nhật lần cuối: 20/12/2024",
      intro:
        "CineHub cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, chia sẻ và bảo vệ thông tin của bạn khi bạn sử dụng dịch vụ của chúng tôi.",
      sections: [
        {
          icon: Database,
          title: "Thông Tin Chúng Tôi Thu Thập",
          content: [
            "Thông tin cá nhân: Họ tên, email, số điện thoại, ngày sinh khi bạn đăng ký tài khoản.",
            "Thông tin giao dịch: Lịch sử đặt vé, thanh toán, và các giao dịch mua bắp nước.",
            "Thông tin thiết bị: Loại thiết bị, hệ điều hành, địa chỉ IP, và thông tin trình duyệt.",
            "Thông tin vị trí: Vị trí của bạn để đề xuất rạp chiếu phim gần nhất (nếu bạn cho phép).",
            "Cookie và công nghệ theo dõi: Để cải thiện trải nghiệm người dùng và phân tích hành vi.",
          ],
        },
        {
          icon: Eye,
          title: "Cách Chúng Tôi Sử Dụng Thông Tin",
          content: [
            "Xử lý đặt vé và giao dịch thanh toán của bạn.",
            "Gửi xác nhận đặt vé, vé điện tử và thông báo quan trọng.",
            "Cung cấp hỗ trợ khách hàng và giải quyết các vấn đề.",
            "Cá nhân hóa trải nghiệm và đề xuất phim phù hợp với sở thích của bạn.",
            "Gửi thông tin khuyến mãi, ưu đãi (nếu bạn đồng ý nhận).",
            "Phân tích và cải thiện dịch vụ của chúng tôi.",
          ],
        },
        {
          icon: UserCheck,
          title: "Chia Sẻ Thông Tin",
          content: [
            "Đối tác thanh toán: Để xử lý giao dịch thanh toán an toàn (ZaloPay, VNPay, v.v.).",
            "Nhà cung cấp dịch vụ: Các bên thứ ba hỗ trợ vận hành dịch vụ (hosting, email, phân tích).",
            "Yêu cầu pháp lý: Khi được yêu cầu bởi cơ quan có thẩm quyền hoặc theo quy định pháp luật.",
            "Chúng tôi KHÔNG bán thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại.",
          ],
        },
        {
          icon: Lock,
          title: "Bảo Mật Thông Tin",
          content: [
            "Mã hóa SSL/TLS cho tất cả các giao dịch và truyền tải dữ liệu.",
            "Mã hóa mật khẩu bằng thuật toán bcrypt.",
            "Kiểm soát truy cập nghiêm ngặt đối với dữ liệu người dùng.",
            "Giám sát và phát hiện các hoạt động bất thường.",
            "Tuân thủ các tiêu chuẩn bảo mật PCI-DSS cho thanh toán.",
          ],
        },
        {
          icon: Shield,
          title: "Quyền Của Bạn",
          content: [
            "Truy cập: Bạn có quyền yêu cầu xem thông tin cá nhân chúng tôi lưu trữ về bạn.",
            "Chỉnh sửa: Bạn có thể cập nhật hoặc sửa đổi thông tin cá nhân của mình.",
            "Xóa: Bạn có quyền yêu cầu xóa tài khoản và dữ liệu cá nhân.",
            "Từ chối: Bạn có thể từ chối nhận email marketing bất cứ lúc nào.",
          ],
        },
        {
          icon: Mail,
          title: "Liên Hệ",
          content: [
            "Email: privacy@cinehub.vn",
            "Hotline: 1900 123 456",
            "Địa chỉ: UIT - Trường Đại học Công nghệ Thông tin, Khu phố 6, P. Linh Trung, TP. Thủ Đức, TP. HCM",
          ],
        },
      ],
      extraSections: [
        {
          icon: Cookie,
          title: "Cookie và Công Nghệ Theo Dõi",
          content:
            "Chúng tôi sử dụng cookie để cải thiện trải nghiệm của bạn. Bạn có thể quản lý cài đặt cookie trong trình duyệt của mình. Các loại cookie chúng tôi sử dụng bao gồm: cookie cần thiết (để website hoạt động), cookie phân tích (để hiểu cách bạn sử dụng website), và cookie marketing (để hiển thị quảng cáo phù hợp).",
        },
        {
          icon: Baby,
          title: "Bảo Vệ Trẻ Em",
          content:
            "Dịch vụ của chúng tôi không dành cho trẻ em dưới 13 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 13 tuổi. Nếu bạn là phụ huynh và phát hiện con bạn đã cung cấp thông tin cho chúng tôi, vui lòng liên hệ để chúng tôi xóa thông tin đó.",
        },
        {
          icon: RefreshCw,
          title: "Thay Đổi Chính Sách",
          content:
            "Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được thông báo trên website và qua email (nếu thay đổi quan trọng). Việc tiếp tục sử dụng dịch vụ sau khi thay đổi có nghĩa là bạn chấp nhận chính sách mới.",
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      subtitle: "Protecting your privacy is our top priority",
      lastUpdated: "Last updated: December 20, 2024",
      intro:
        "CineHub is committed to protecting your privacy and personal information. This privacy policy explains how we collect, use, share, and protect your information when you use our services.",
      sections: [
        {
          icon: Database,
          title: "Information We Collect",
          content: [
            "Personal information: Name, email, phone number, date of birth when you register an account.",
            "Transaction information: Booking history, payments, and food & beverage purchases.",
            "Device information: Device type, operating system, IP address, and browser information.",
            "Location information: Your location to suggest nearby theaters (if you allow).",
            "Cookies and tracking technologies: To improve user experience and analyze behavior.",
          ],
        },
        {
          icon: Eye,
          title: "How We Use Information",
          content: [
            "Process your ticket bookings and payment transactions.",
            "Send booking confirmations, e-tickets, and important notifications.",
            "Provide customer support and resolve issues.",
            "Personalize experience and recommend movies based on your preferences.",
            "Send promotional information and offers (if you agree to receive).",
            "Analyze and improve our services.",
          ],
        },
        {
          icon: UserCheck,
          title: "Information Sharing",
          content: [
            "Payment partners: To process secure payment transactions (ZaloPay, VNPay, etc.).",
            "Service providers: Third parties that help operate our services (hosting, email, analytics).",
            "Legal requirements: When required by authorities or by law.",
            "We DO NOT sell your personal information to third parties for commercial purposes.",
          ],
        },
        {
          icon: Lock,
          title: "Information Security",
          content: [
            "SSL/TLS encryption for all transactions and data transmission.",
            "Password encryption using bcrypt algorithm.",
            "Strict access control for user data.",
            "Monitoring and detection of unusual activities.",
            "Compliance with PCI-DSS security standards for payments.",
          ],
        },
        {
          icon: Shield,
          title: "Your Rights",
          content: [
            "Access: You have the right to request to see personal information we store about you.",
            "Correction: You can update or modify your personal information.",
            "Deletion: You have the right to request deletion of your account and personal data.",
            "Opt-out: You can opt out of marketing emails at any time.",
          ],
        },
        {
          icon: Mail,
          title: "Contact Us",
          content: [
            "Email: privacy@cinehub.vn",
            "Hotline: 1900 123 456",
            "Address: UIT - University of Information Technology, Quarter 6, Linh Trung Ward, Thu Duc City, Ho Chi Minh City",
          ],
        },
      ],
      extraSections: [
        {
          icon: Cookie,
          title: "Cookies and Tracking Technologies",
          content:
            "We use cookies to improve your experience. You can manage cookie settings in your browser. Types of cookies we use include: necessary cookies (for website functionality), analytics cookies (to understand how you use the website), and marketing cookies (to display relevant ads).",
        },
        {
          icon: Baby,
          title: "Children's Protection",
          content:
            "Our services are not intended for children under 13 years old. We do not knowingly collect personal information from children under 13. If you are a parent and discover that your child has provided information to us, please contact us so we can delete that information.",
        },
        {
          icon: RefreshCw,
          title: "Policy Changes",
          content:
            "We may update this privacy policy from time to time. Any changes will be notified on the website and via email (if significant changes). Continued use of services after changes means you accept the new policy.",
        },
      ],
    },
  };

  const c = content[language as "vi" | "en"] || content.vi;

  return (
    <Layout>
      <div className="min-h-screen bg-[#f1f6f8] text-white">
        {/* Hero Section */}
        <section
          className={`relative h-[400px] flex items-center justify-center overflow-hidden transition-all duration-1000 ${isVisible.hero ? "opacity-100" : "opacity-0"}`}
        >
          {/* Background Image */}
          <img
            src="/intro_cinehub.jpg"
            alt="CineHub Privacy"
            className="w-full h-full object-cover"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/60 to-black/70"></div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/40 to-gray-100"></div>

          {/* Text Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 rounded-full mb-6">
              <Shield className="w-10 h-10 text-black" />
            </div>
            <h1
              className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-wider"
              style={{
                textShadow:
                  "0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7), 4px 4px 8px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
              }}
            >
              {c.title}
            </h1>
            <p
              className="text-xl md:text-2xl text-white font-light"
              style={{
                textShadow:
                  "0 0 10px rgba(0,0,0,0.9), 2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
              }}
            >
              {c.subtitle}
            </p>
          </div>
        </section>

        {/* Intro Section */}
        <section
          className={`max-w-5xl mx-auto py-12 transition-all duration-1000 ${isVisible.intro ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-yellow-500">
            <p className="text-gray-700 leading-relaxed text-lg">{c.intro}</p>
            <p className="text-gray-500 text-sm mt-4">{c.lastUpdated}</p>
          </div>
        </section>

        {/* Main Sections - Grid Layout */}
        <section
          className={`max-w-5xl mx-auto pb-12 transition-all duration-1000 ${isVisible.sections ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {c.sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <div
                  key={idx}
                  className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6 hover:border-yellow-400/50 transition-all hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="bg-yellow-400/10 p-3 rounded-full">
                      <Icon className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-bold text-yellow-400">
                      {section.title}
                    </h2>
                  </div>
                  <ul className="space-y-3">
                    {section.content.map((item, i) => (
                      <li
                        key={i}
                        className="text-gray-300 leading-relaxed flex items-start text-sm"
                      >
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Extra Sections */}
        <section
          className={`max-w-5xl mx-auto pb-20 transition-all duration-1000 ${isVisible.extra ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="space-y-6">
            {c.extraSections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed ml-16">
                    {section.content}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
