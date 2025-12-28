"use client";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import { useAuthStore } from "../../../stores/authStore";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface LoginFormData {
  usernameOrEmailOrPhone: string;
  password: string;
}

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { user, signin, loading, error } = useAuthStore();
  const [formData, setFormData] = useState<LoginFormData>({
    usernameOrEmailOrPhone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "manager":
          navigate("/manager/dashboard");
          break;
        default:
          navigate("/");
      }
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    if (!formData.usernameOrEmailOrPhone.trim()) {
      newErrors.usernameOrEmailOrPhone = "Tên đăng nhập hoặc email là bắt buộc";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu là bắt buộc";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await signin({
      usernameOrEmailOrPhone: formData.usernameOrEmailOrPhone,
      password: formData.password,
    });
  };

  const shouldReduceMotion = useReducedMotion();

  return (
    <Layout>
      {/* Container đảm bảo form luôn ở giữa màn hình */}
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="bg-black/60 backdrop-blur-md 
               border border-yellow-400/20 rounded-2xl 
               p-8 sm:p-10 shadow-2xl"
            aria-live="polite"
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-white tracking-wide">
                Đăng nhập
              </h2>
              <p className="mt-2 text-sm text-gray-300">
                Hoặc{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-yellow-400 hover:text-yellow-300"
                >
                  đăng ký tài khoản mới
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-5">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-200">
                    Tên đăng nhập / Email / Số điện thoại
                  </label>
                  <input
                    id="usernameOrEmailOrPhone"
                    name="usernameOrEmailOrPhone"
                    type="text"
                    value={formData.usernameOrEmailOrPhone}
                    onChange={handleChange}
                    className="mt-2 block w-full px-4 py-2.5 rounded-lg 
                         bg-slate-800/70 border border-gray-600 
                         text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 
                         focus:ring-yellow-400 focus:border-yellow-400 
                         text-sm sm:text-base"
                    placeholder="Nhập email hoặc tên đăng nhập"
                    autoComplete="username"
                  />
                  {errors.usernameOrEmailOrPhone && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.usernameOrEmailOrPhone}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-200">
                    Mật khẩu
                  </label>
                  <div className="relative mt-2">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 rounded-lg 
                           bg-slate-800/70 border border-gray-600 
                           text-white placeholder-gray-400
                           focus:outline-none focus:ring-2 
                           focus:ring-yellow-400 focus:border-yellow-400 
                           text-sm sm:text-base pr-12"
                      placeholder="Mật khẩu"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 
                           text-gray-300 hover:text-white"
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-yellow-400 hover:text-yellow-300"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 
                     py-3 rounded-lg text-black text-base font-bold
                     bg-yellow-400 hover:bg-yellow-300
                     focus:ring-2 focus:ring-yellow-400 
                     disabled:opacity-60"
                aria-disabled={loading}
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              {error && (
                <p className="text-center text-red-400 text-sm">{error}</p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
