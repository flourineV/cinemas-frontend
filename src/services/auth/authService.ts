import { authClient } from "@/services/apiClient";
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
    authClient.post<JwtResponse>("/signup", data),

  signin: (data: SignInRequest) =>
    authClient.post<JwtResponse>("/signin", data),

  signout: () => authClient.post("/signout"),

  refreshToken: (data: TokenRefreshRequest) =>
    authClient.post<JwtResponse>("/refreshtoken", data),

  sendOtp: (data: { email: string }) => authClient.post("/send-otp", data),

  resendOtp: () => authClient.post("/resend-otp"),

  resetPassword: (data: ResetPasswordRequest) =>
    authClient.post("/reset-password", data),
};
