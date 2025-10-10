import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth/authService";

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
      setSuccess("Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư!");
    } catch (err: any) {
      console.error(err);
      setError("Không thể gửi email. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Quên mật khẩu
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-slate-800 rounded-md focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50"
              >
                {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={() => navigate("/login")}
                className="text-yellow-400 hover:text-yellow-300 text-sm underline"
              >
                Quay lại trang đăng nhập
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
