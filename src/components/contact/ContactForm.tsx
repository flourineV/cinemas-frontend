import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import Swal from "sweetalert2";
import { useLanguage } from "@/contexts/LanguageContext";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  message?: string;
}

const ContactForm = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error khi user bắt đầu nhập
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = t("contact.nameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("contact.nameMinLength");
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t("contact.emailRequired");
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t("contact.emailInvalid");
    }

    // Validate message (theo backend: 10-1000 ký tự)
    if (!formData.message.trim()) {
      newErrors.message = t("contact.messageRequired");
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t("contact.messageMinLength");
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = t("contact.messageMaxLength");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form trước khi gửi
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post("/contact/send", formData);

      // Hiện SweetAlert thành công
      await Swal.fire({
        title: t("contact.success"),
        text: t("contact.successMessage"),
        icon: "success",
        confirmButtonText: t("common.confirm"),
        confirmButtonColor: "#f59e0b",
      });

      // Reset form
      setFormData({ name: "", email: "", message: "" });
      setErrors({});
    } catch (error: any) {
      console.error("Contact form error:", error);

      // Hiện SweetAlert lỗi
      await Swal.fire({
        title: t("contact.error"),
        text: error.response?.data?.message || t("contact.errorMessage"),
        icon: "error",
        confirmButtonText: t("common.confirm"),
        confirmButtonColor: "#f59e0b",
      });
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
              <p className="font-semibold text-lg text-zinc-800">
                {t("contact.address")}
              </p>
              <p className="text-zinc-800">{t("contact.university")}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-600">
          <p className="text-md text-zinc-800">{t("contact.description")}</p>
        </div>

        <img src="LogoFullfinal.png" className="w-3/4 mx-auto mt-10" />
      </div>

      {/* RIGHT SIDE */}
      <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {t("contact.title")}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NAME */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {t("contact.name")}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("contact.namePlaceholder")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {t("contact.email")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* MESSAGE */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {t("contact.message")}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className={`w-full px-4 py-3 border rounded-lg bg-white text-black focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none ${
                errors.message ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("contact.messagePlaceholder")}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.message ? (
                <p className="text-red-500 text-sm">{errors.message}</p>
              ) : (
                <div></div>
              )}
              <p className="text-gray-500 text-sm">
                {formData.message.length}/1000
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>{t("contact.sending")}</span>
              </>
            ) : (
              <>
                <span>{t("contact.send")}</span>
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
