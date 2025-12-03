import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth/authService";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword({ email });
      setSuccess(
        "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư!"
      );
    } catch (err: any) {
      console.error(err);
      setError("Không thể gửi email. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 py-28 px-4">
        {/* BACKGROUND */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/background_profile.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>

        {/* MAIN CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Decorative overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-zinc-900/10 rounded-full blur-3xl"></div>

          <div className="relative p-10">
            {/* Back button */}
            <button
              onClick={() => navigate("/auth")}
              className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-zinc-900 transition-colors group"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="text-sm font-medium">Quay lại</span>
            </button>

            {/* Header */}
            <div className="text-center mt-8 mb-8">
              <h2 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
                Quên mật khẩu?
              </h2>
              <p className="text-gray-500 text-sm">
                Nhập email của bạn để nhận liên kết đặt lại mật khẩu
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors duration-300">
                    <Mail size={20} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl 
                      text-zinc-800 placeholder-gray-400
                      focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 
                      transition-all duration-300 hover:border-zinc-300"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm font-medium bg-red-50 py-2 px-3 rounded-lg text-center"
                >
                  {error}
                </motion.div>
              )}

              {/* Success message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 text-sm font-medium bg-green-50 py-2 px-3 rounded-lg text-center"
                >
                  {success}
                </motion.div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 text-yellow-400 py-3 rounded-xl font-bold 
                  hover:bg-black hover:shadow-lg hover:shadow-yellow-400/20 
                  active:scale-[0.98] transition-all duration-300 
                  flex justify-center items-center gap-2 border border-zinc-800
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  "Gửi liên kết đặt lại"
                )}
              </button>
            </form>

            {/* Footer info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Bạn sẽ nhận được email chứa hướng dẫn đặt lại mật khẩu trong vài
                phút
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
