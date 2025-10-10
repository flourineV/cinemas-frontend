import { authClient } from "../apiClients/authClient";

export interface SignUpRequest {
  username: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  password: string;
  confirmPassword: string;
}

export interface SignInRequest {
  usernameOrEmailOrPhone: string;
  password: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  role: string;
  User: User;
}

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface JwtResponse {
  tokenType: string;
  accessToken?: string;
  refreshToken?: string;
  user: UserResponse;
}

export const authService = {
  // Đăng ký
  signup: (data: SignUpRequest) =>
    authClient.post<JwtResponse>("/signup", data),

  // Đăng nhập
  signin: (data: SignInRequest) =>
    authClient.post<JwtResponse>("/signin", data),

  // Đăng xuất
  signout: () => authClient.post("/signout"),

  // Làm mới token
  refreshToken: (data: TokenRefreshRequest) =>
    authClient.post<JwtResponse>("/refreshtoken", data),

  // Quên mật khẩu
  forgotPassword: (data: ForgotPasswordRequest) =>
    authClient.post("/forgot-password", data),

  // Đặt lại mật khẩu
  resetPassword: (data: ResetPasswordRequest) =>
    authClient.post("/reset-password", data),
};