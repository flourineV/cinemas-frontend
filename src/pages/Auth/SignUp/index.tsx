import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import { useAuthStore } from "../../../stores/authStore";

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
  const { signup, loading, error } = useAuthStore(); // lấy action signup từ store

  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    username: "",
    phoneNumber: "",
    nationalId: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<SignupFormData>>({});

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

    if (!formData.phoneNumber) newErrors.phoneNumber = "Số điện thoại là bắt buộc";
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
    if (useAuthStore.getState().user) {
      navigate("/dashboard");
    }
  };

  // ----------------------
  // UI
  // ----------------------
  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Đăng ký tài khoản
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Hoặc{" "}
              <Link
                to="/login"
                className="font-medium text-yellow-400 hover:text-yellow-300"
              >
                đăng nhập nếu đã có tài khoản
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </button>

              {error && (
                <p className="text-center text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

// component nhỏ tái sử dụng
interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  error?: string;
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
    <label htmlFor={name} className="block text-sm font-medium text-gray-300">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      required
      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-slate-800 rounded-md focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10 sm:text-sm"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
    {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
  </div>
);

export default SignUp;
