import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth/authService";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, Key, Lock } from "lucide-react";

type Step = "email" | "otp" | "success";

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }

    try {
      setLoading(true);
      await authService.sendOtp({ email });
      setStep("otp");
      setSuccess("Mã OTP đã được gửi đến email của bạn!");
    } catch (err: any) {
      console.error(err);
      setError("Không thể gửi OTP. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Vui lòng nhập mã OTP 6 số.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({
        email,
        otp,
        newPassword,
      });
      setStep("success");
      setSuccess("Đặt lại mật khẩu thành công!");
    } catch (err: any) {
      console.error(err);
      setError("Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    // Clear previous messages
    setError("");
    setSuccess("");

    try {
      setResendLoading(true);
      await authService.resendOtp({ email });
      setSuccess("Mã OTP mới đã được gửi!");
    } catch (err: any) {
      console.error(err);
      setError("Vui lòng resend sau 5p nữa");
    } finally {
      setResendLoading(false);
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
              {step === "email" && (
                <>
                  <h2 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
                    Quên mật khẩu?
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Nhập email của bạn để nhận mã OTP
                  </p>
                </>
              )}
              {step === "otp" && (
                <>
                  <h2 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
                    Nhập mã OTP
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Mã OTP đã được gửi đến {email}
                  </p>
                </>
              )}
              {step === "success" && (
                <>
                  <h2 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
                    Thành công!
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Mật khẩu đã được đặt lại thành công
                  </p>
                </>
              )}
            </div>

            {/* Step 1: Email */}
            {step === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5 ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors duration-300">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
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
                    "Gửi mã OTP"
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP + New Password */}
            {step === "otp" && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5 ml-1">
                    Mã OTP
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors duration-300">
                      <Key size={20} />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl 
                        text-zinc-800 placeholder-gray-400
                        focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 
                        transition-all duration-300 hover:border-zinc-300"
                      placeholder="Nhập mã OTP 6 số"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5 ml-1">
                    Mật khẩu mới
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors duration-300">
                      <Lock size={20} />
                    </div>
                    <input
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl 
                        text-zinc-800 placeholder-gray-400
                        focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 
                        transition-all duration-300 hover:border-zinc-300"
                      placeholder="Nhập mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5 ml-1">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors duration-300">
                      <Lock size={20} />
                    </div>
                    <input
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl 
                        text-zinc-800 placeholder-gray-400
                        focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 
                        transition-all duration-300 hover:border-zinc-300"
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

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
                      <span>Đang đặt lại...</span>
                    </>
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="w-full text-zinc-600 hover:text-zinc-900 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    "Gửi lại mã OTP"
                  )}
                </button>
              </form>
            )}

            {/* Step 3: Success */}
            {step === "success" && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <button
                  onClick={() => navigate("/auth")}
                  className="w-full bg-zinc-900 text-yellow-400 py-3 rounded-xl font-bold 
                    hover:bg-black hover:shadow-lg hover:shadow-yellow-400/20 
                    active:scale-[0.98] transition-all duration-300 
                    flex justify-center items-center gap-2 border border-zinc-800"
                >
                  Đăng nhập ngay
                </button>
              </div>
            )}

            {/* Single message display */}
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm font-medium py-2 px-3 rounded-lg text-center mt-4 ${
                  error
                    ? "text-red-500 bg-red-50"
                    : "text-green-600 bg-green-50"
                }`}
              >
                {error || success}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
