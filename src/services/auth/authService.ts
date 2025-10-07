import { authClient } from "../apiClients/authClient";

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
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
  name: string;
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