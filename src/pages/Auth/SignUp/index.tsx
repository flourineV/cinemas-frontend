"use client";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import { useAuthStore } from "../../../stores/authStore";
import { Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface SignupFormData {
  email: string;
  username: string;
  phoneNumber: string;
  nationalId: string;
  password: string;
  confirmPassword: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signup, loading, error } = useAuthStore();

  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    username: "",
    phoneNumber: "",
    nationalId: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<SignupFormData>>({});

  // Respect reduced motion preference
  const shouldReduceMotion = useReducedMotion();

  // ----------------------
  // HANDLE INPUT
  // ----------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // clear lỗi nếu user đang nhập lại
    if (errors[name as keyof SignupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ----------------------
  // VALIDATE FORM
  // ----------------------
  const validateForm = (): boolean => {
    const newErrors: Partial<SignupFormData> = {};

    if (!formData.email) newErrors.email = "Email là bắt buộc";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email không hợp lệ";

    if (!formData.username) newErrors.username = "Tên đăng nhập là bắt buộc";
    else if (formData.username.length < 3)
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";

    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Số điện thoại là bắt buộc";
    else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";

    if (!formData.nationalId) newErrors.nationalId = "CMND/CCCD là bắt buộc";
    else if (!/^[0-9]{9,12}$/.test(formData.nationalId))
      newErrors.nationalId = "CMND/CCCD không hợp lệ";

    if (!formData.password) newErrors.password = "Mật khẩu là bắt buộc";
    else if (formData.password.length < 6)
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ----------------------
  // HANDLE SUBMIT
  // ----------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await signup({
      email: formData.email,
      username: formData.username,
      phoneNumber: formData.phoneNumber,
      nationalId: formData.nationalId,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    // nếu đăng ký thành công thì Zustand đã lưu user rồi
    const user = useAuthStore.getState().user;
    if (user) {
      // redirect giống SignIn: nếu admin/manager -> dashboard, else về /
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
  };

  return (
    <Layout>
      <div
        className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 mb-16"
        aria-live="polite"
      >
        <div className="w-full max-w-md">
          {/* Motion wrapper for the panel */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="bg-black/60 backdrop-blur-md 
                        border border-yellow-400/20 
                        rounded-2xl p-8 sm:p-10 shadow-2xl"
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-white tracking-wide">
                Đăng ký
              </h2>
              <p className="mt-2 text-sm text-gray-300">
                Hoặc{" "}
                <Link
                  to="/login"
                  className="font-semibold text-yellow-400 hover:text-yellow-300"
                >
                  đăng nhập nếu đã có tài khoản
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-5">
                {/* Email */}
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Email của bạn"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />

                {/* Username */}
                <InputField
                  label="Tên đăng nhập"
                  name="username"
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                />

                {/* Phone number */}
                <InputField
                  label="Số điện thoại"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Số điện thoại"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  error={errors.phoneNumber}
                />

                {/* National ID */}
                <InputField
                  label="CMND/CCCD"
                  name="nationalId"
                  type="text"
                  placeholder="Số CMND/CCCD"
                  value={formData.nationalId}
                  onChange={handleChange}
                  error={errors.nationalId}
                />

                {/* Password */}
                <InputField
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                />

                {/* Confirm Password */}
                <InputField
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 
                             py-3 rounded-lg text-black text-base font-bold
                             bg-yellow-400 hover:bg-yellow-300
                             focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      <span>Đang đăng ký...</span>
                    </>
                  ) : (
                    <span>Đăng ký</span>
                  )}
                </button>

                {error && (
                  <p className="text-center text-red-400 text-sm mt-2">
                    {error}
                  </p>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

// component nhỏ tái sử dụng (style đồng bộ với SignIn)
interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  error?: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  error,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-200">{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      required
      autoComplete={
        name === "password" || name === "confirmPassword"
          ? "new-password"
          : name
      }
      className="mt-2 block w-full px-4 py-2.5 rounded-lg 
                 bg-slate-800/70 border border-gray-600 
                 text-white placeholder-gray-400
                 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400
                 text-sm sm:text-base"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
    {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
  </div>
);

export default SignUp;
