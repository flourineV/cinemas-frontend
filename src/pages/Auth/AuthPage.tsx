"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Lock,
  Mail,
  Phone,
  CreditCard,
  KeyRound,
} from "lucide-react";
import { motion } from "framer-motion";
import Layout from "../../components/layout/Layout";

// --- INTERFACES ---
interface LoginFormData {
  usernameOrEmailOrPhone: string;
  password: string;
}

interface SignupFormData {
  email: string;
  username: string;
  phoneNumber: string;
  nationalId: string;
  password: string;
  confirmPassword: string;
}

// --- COMPONENT INPUT TÙY CHỈNH (CẬP NHẬT) ---
interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ElementType;
  label: string; // Thêm prop label
  error?: string;
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const CustomInput: React.FC<CustomInputProps> = ({
  icon: Icon,
  label, // Nhận label từ props
  error,
  isPassword = false,
  showPassword = false,
  onTogglePassword,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {/* Label nằm trên input */}
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5 ml-1">
        {label}
      </label>

      <div className="relative group">
        {/* Icon bên trái */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors duration-300">
          <Icon size={20} />
        </div>

        {/* Input chính */}
        <input
          {...props}
          type={isPassword ? (showPassword ? "text" : "password") : props.type}
          className={`w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl 
            text-zinc-800 placeholder-gray-400 caret-black
            focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20
            transition-all duration-200 hover:border-zinc-300 ${className}`}
        />

        {/* Nút mắt xem pass */}
        {isPassword && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-zinc-800 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <p className="text-red-500 text-xs mt-1 ml-1 font-medium animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { user, signin, signup, loading, error } = useAuthStore();

  const [loginData, setLoginData] = useState<LoginFormData>({
    usernameOrEmailOrPhone: "",
    password: "",
  });
  const [loginErrors, setLoginErrors] = useState<Partial<LoginFormData>>({});
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [signupData, setSignupData] = useState<SignupFormData>({
    email: "",
    username: "",
    phoneNumber: "",
    nationalId: "",
    password: "",
    confirmPassword: "",
  });
  const [signupErrors, setSignupErrors] = useState<Partial<SignupFormData>>({});
  const [showSignupPass, setShowSignupPass] = useState(false);

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "manager":
          navigate("/manager/dashboard");
          break;
        case "staff":
          navigate("/staff/dashboard");
          break;
        default:
          navigate("/");
      }
    }
  }, [user, navigate]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (loginErrors[e.target.name as keyof LoginFormData]) {
      setLoginErrors({ ...loginErrors, [e.target.name]: "" });
    }
  };

  const validateLogin = () => {
    const newErrors: Partial<LoginFormData> = {};
    if (!loginData.usernameOrEmailOrPhone.trim())
      newErrors.usernameOrEmailOrPhone = "Vui lòng nhập tài khoản";
    if (!loginData.password.trim())
      newErrors.password = "Vui lòng nhập mật khẩu";
    setLoginErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    await signin(loginData);
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
    if (signupErrors[e.target.name as keyof SignupFormData]) {
      setSignupErrors({ ...signupErrors, [e.target.name]: "" });
    }
  };

  const validateSignup = () => {
    const newErrors: Partial<SignupFormData> = {};
    if (!signupData.email || !/\S+@\S+\.\S+/.test(signupData.email))
      newErrors.email = "Email không hợp lệ";
    if (!signupData.username || signupData.username.length < 3)
      newErrors.username = "Tên đăng nhập tối thiểu 3 ký tự";
    if (
      !signupData.phoneNumber ||
      !/^[0-9]{10,11}$/.test(signupData.phoneNumber)
    )
      newErrors.phoneNumber = "SĐT không hợp lệ";
    if (!signupData.nationalId || !/^[0-9]{9,12}$/.test(signupData.nationalId))
      newErrors.nationalId = "CMND/CCCD không hợp lệ";
    if (!signupData.password || signupData.password.length < 6)
      newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    if (signupData.password !== signupData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu không khớp";

    setSignupErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;
    await signup({
      email: signupData.email,
      username: signupData.username,
      phoneNumber: signupData.phoneNumber,
      nationalId: signupData.nationalId,
      password: signupData.password,
      confirmPassword: signupData.confirmPassword,
    });
  };

  const buttonClass =
    "w-full bg-zinc-900 text-yellow-400 py-3 rounded-xl font-bold hover:bg-black hover:shadow-lg hover:shadow-yellow-400/20 active:scale-[0.98] transition-all duration-300 flex justify-center items-center gap-2 border border-zinc-800";

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

        {/* MAIN MODAL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-4xl min-h-[700px] bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex"
        >
          {/* === FORM SIGN IN (LOGIN) === */}
          <div
            className={`absolute top-0 left-0 w-1/2 h-full flex items-center justify-center transition-all duration-700 ease-in-out ${
              isSignUp
                ? "translate-x-full opacity-0 pointer-events-none"
                : "translate-x-0 opacity-100 z-20"
            }`}
          >
            <div className="w-full px-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-2 text-center tracking-tight">
                Đăng Nhập
              </h2>
              <p className="text-gray-400 text-sm text-center mb-8">
                Chào mừng bạn quay trở lại CineHub!
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <CustomInput
                  label="Tài khoản / Email / Số điện thoại"
                  icon={User}
                  type="text"
                  name="usernameOrEmailOrPhone"
                  placeholder="nguyenvana"
                  value={loginData.usernameOrEmailOrPhone}
                  onChange={handleLoginChange}
                  error={loginErrors.usernameOrEmailOrPhone}
                />

                <CustomInput
                  label="Mật khẩu"
                  icon={Lock}
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  error={loginErrors.password}
                  isPassword={true}
                  showPassword={showLoginPass}
                  onTogglePassword={() => setShowLoginPass(!showLoginPass)}
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="custom-checkbox"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-zinc-900 transition-colors">
                      Ghi nhớ đăng nhập
                    </span>
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-gray-500 text-sm hover:text-zinc-900 transition-colors font-medium hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={buttonClass}
                >
                  {loading ? (
                    <Loader2
                      className="animate-spin text-yellow-400"
                      size={20}
                    />
                  ) : (
                    "ĐĂNG NHẬP"
                  )}
                </button>

                {error && !isSignUp && (
                  <p className="text-red-500 text-center text-sm mt-2 font-medium bg-red-50 py-1 rounded-md">
                    {error}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* === FORM SIGN UP (REGISTER) === */}
          <div
            className={`absolute top-0 right-0 w-1/2 h-full flex items-center justify-center transition-all duration-700 ease-in-out ${
              isSignUp
                ? "translate-x-0 opacity-100 z-20"
                : "-translate-x-full opacity-0 pointer-events-none"
            }`}
          >
            <div className="w-full px-12 h-full overflow-y-auto py-8 custom-scrollbar">
              <h2 className="text-3xl font-bold text-zinc-900 mb-3 text-center tracking-tight">
                Tạo Tài Khoản
              </h2>

              <p className="text-gray-400 text-sm text-center mb-6">
                Cùng chiêm ngưỡng những bộ phim bom tấn
              </p>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <CustomInput
                  label="Tên đăng nhập"
                  icon={User}
                  name="username"
                  placeholder="nguyenvana"
                  value={signupData.username}
                  onChange={handleSignupChange}
                  error={signupErrors.username}
                />

                <CustomInput
                  label="Email"
                  icon={Mail}
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  error={signupErrors.email}
                />

                <div className="flex gap-3">
                  <CustomInput
                    label="Số điện thoại"
                    icon={Phone}
                    name="phoneNumber"
                    placeholder="0912345678"
                    value={signupData.phoneNumber}
                    onChange={handleSignupChange}
                    error={signupErrors.phoneNumber}
                  />
                  <CustomInput
                    label="CMND/CCCD"
                    icon={CreditCard}
                    name="nationalId"
                    placeholder="0791..."
                    value={signupData.nationalId}
                    onChange={handleSignupChange}
                    error={signupErrors.nationalId}
                  />
                </div>

                <CustomInput
                  label="Mật khẩu"
                  icon={Lock}
                  isPassword
                  showPassword={showSignupPass}
                  onTogglePassword={() => setShowSignupPass(!showSignupPass)}
                  name="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  error={signupErrors.password}
                />

                <CustomInput
                  label="Xác nhận mật khẩu"
                  icon={KeyRound}
                  type="password"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  error={signupErrors.confirmPassword}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className={`${buttonClass} mt-2`}
                >
                  {loading ? (
                    <Loader2
                      className="animate-spin text-yellow-400"
                      size={20}
                    />
                  ) : (
                    "ĐĂNG KÝ"
                  )}
                </button>

                {error && isSignUp && (
                  <p className="text-red-500 text-center text-sm mt-2 font-medium bg-red-50 py-1 rounded-md">
                    {error}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* === OVERLAY PANEL === */}
          <div
            className={`absolute top-0 w-1/2 h-full bg-zinc-900 transition-all duration-700 ease-in-out z-50 overflow-hidden border-l border-zinc-800 ${
              isSignUp ? "left-0" : "left-1/2"
            }`}
          >
            <div
              className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            ></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-zinc-700/10 rounded-full blur-3xl"></div>

            <div className="relative flex flex-col items-center justify-center h-full text-white px-12 text-center">
              {isSignUp ? (
                <>
                  <h1 className="text-4xl font-bold mb-4 text-white">
                    Chào mừng trở lại!
                  </h1>
                  <p className="mb-8 text-gray-400">
                    Để duy trì kết nối với CineHub, vui lòng đăng nhập bằng
                    thông tin cá nhân của bạn
                  </p>
                  <button
                    onClick={() => setIsSignUp(false)}
                    className="border border-white/30 text-white bg-transparent px-10 py-3 rounded-full font-bold hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all duration-300 uppercase tracking-wider"
                  >
                    Đăng Nhập
                  </button>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold mb-4 text-white">
                    Xin chào, Bạn mới!
                  </h1>
                  <p className="mb-8 text-gray-400">
                    Nhập thông tin cá nhân của bạn và bắt đầu hành trình tuyệt
                    vời cùng{" "}
                    <span className="text-yellow-400 font-bold">CineHub</span>
                  </p>
                  <button
                    onClick={() => setIsSignUp(true)}
                    className="border border-white/30 text-white bg-transparent px-10 py-3 rounded-full font-bold hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all duration-300 uppercase tracking-wider"
                  >
                    Đăng Ký
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

export default AuthPage;
