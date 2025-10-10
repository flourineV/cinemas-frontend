import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import { useAuthStore } from "../../../stores/authStore"; // Chỉ cần store, bỏ useAuth cũ

interface LoginFormData {
  usernameOrEmailOrPhone: string;
  password: string;
}

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { user, signin, loading, error } = useAuthStore(); // lấy action từ zustand
  const [formData, setFormData] = useState<LoginFormData>({
    usernameOrEmailOrPhone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  // Nếu đã đăng nhập, tự chuyển trang
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Kiểm tra form
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

  // Xử lý submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await signin({
      usernameOrEmailOrPhone: formData.usernameOrEmailOrPhone,
      password: formData.password,
    });

    // Sau khi signin, Zustand sẽ set user nếu thành công
    if (useAuthStore.getState().user) {
      navigate("/dashboard");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Đăng nhập
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Hoặc{" "}
              <Link
                to="/signup"
                className="font-medium text-yellow-400 hover:text-yellow-300"
              >
                đăng ký tài khoản mới
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Username / Email */}
              <div>
                <label
                  htmlFor="usernameOrEmailOrPhone"
                  className="block text-sm font-medium text-gray-300"
                >
                  Tên đăng nhập / Email / Số điện thoại
                </label>
                <input
                  id="usernameOrEmailOrPhone"
                  name="usernameOrEmailOrPhone"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-slate-800 rounded-md focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
                  placeholder="Nhập email hoặc tên đăng nhập"
                  value={formData.usernameOrEmailOrPhone}
                  onChange={handleChange}
                />
                {errors.usernameOrEmailOrPhone && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.usernameOrEmailOrPhone}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Mật khẩu
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-slate-800 rounded-md focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-yellow-400 hover:text-yellow-300"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </div>

            {/* Hiển thị lỗi từ server */}
            {error && (
              <p className="text-center text-red-400 text-sm mt-2">{error}</p>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
