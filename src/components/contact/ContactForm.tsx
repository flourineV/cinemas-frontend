import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { apiClient } from "@/services/apiClient";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      await apiClient.post("/contact/send", formData);

      setSubmitStatus({
        type: "success",
        message: "Gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.",
      });
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => {
        setSubmitStatus({ type: null, message: "" });
      }, 5000);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Có lỗi xảy ra. Vui lòng thử lại sau.",
      });
      setTimeout(() => {
        setSubmitStatus({ type: null, message: "" });
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT SIDE */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-white shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-white/50 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-zinc-800" />
            </div>
            <div>
              <p className="font-semibold text-lg text-zinc-800">Email</p>
              <p className="text-zinc-800">trananhtuan2005dh@gmail.com</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-white/50 p-3 rounded-lg">
              <Phone className="w-6 h-6 text-zinc-800" />
            </div>
            <div>
              <p className="font-semibold text-lg text-zinc-800">Hotline</p>
              <p className="text-zinc-800">0123456789</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-white/50 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-zinc-800" />
            </div>
            <div>
              <p className="font-semibold text-lg text-zinc-800">Địa chỉ</p>
              <p className="text-zinc-800">
                UIT - Trường Đại học Công nghệ Thông tin
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-600">
          <p className="text-md text-zinc-800">
            Chúng tôi luôn sẵn sàng lắng nghe ý kiến đóng góp của bạn để cải
            thiện dịch vụ tốt hơn.
          </p>
        </div>

        <img src="LogoFullfinal.png" className="w-3/4 mx-auto mt-10" />
      </div>

      {/* RIGHT SIDE */}
      <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          GỬI TIN NHẮN CHO CHÚNG TÔI
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NAME */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Họ và tên
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              placeholder="Nhập họ và tên của bạn"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              placeholder="example@email.com"
            />
          </div>

          {/* MESSAGE */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Nội dung
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
              placeholder="Nhập những gì bạn muốn nhận xét hay đánh giá..."
            />
          </div>

          {/* STATUS ALERT */}
          {submitStatus.type && (
            <div
              className={`p-4 rounded-lg ${
                submitStatus.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>ĐANG GỬI...</span>
              </>
            ) : (
              <>
                <span>GỬI TIN NHẮN</span>
                <Send className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
