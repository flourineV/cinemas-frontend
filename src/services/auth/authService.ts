import apiClient from "@/services/apiClients/authClient";
import type {
  SignUpRequest,
  SignInRequest,
  JwtResponse,
  TokenRefreshRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types/auth/auth.type";

export const authService = {
  signup: (data: SignUpRequest) =>
    apiClient.post<JwtResponse>("/auth/signup", data),

  signin: (data: SignInRequest) =>
    apiClient.post<JwtResponse>("/auth/signin", data),

  signout: () => apiClient.post("/auth/signout"),

  refreshToken: (data: TokenRefreshRequest) =>
    apiClient.post<JwtResponse>("/auth/refreshtoken", data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post("/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post("/auth/reset-password", data),
};
