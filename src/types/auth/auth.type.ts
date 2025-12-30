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
  email: string;
  otp: string;
  newPassword: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  role: string;
  emailVerified: boolean;
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
