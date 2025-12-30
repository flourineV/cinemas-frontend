import { authClient } from "../apiClient";

export interface SendVerificationRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

export interface EmailVerificationResponse {
  message: string;
  email: string;
  verified?: boolean;
}

export interface EmailStatusResponse {
  email: string;
  verified: boolean;
}

export const emailVerificationService = {
  // Gửi mã verification
  sendVerificationCode: async (
    request: SendVerificationRequest
  ): Promise<EmailVerificationResponse> => {
    const response = await authClient.post("/email-verification/send", request);
    return response.data;
  },

  // Verify email với mã
  verifyEmail: async (
    request: VerifyEmailRequest
  ): Promise<EmailVerificationResponse> => {
    const response = await authClient.post(
      "/email-verification/verify",
      request
    );
    return response.data;
  },

  // Kiểm tra trạng thái email
  checkEmailStatus: async (email: string): Promise<EmailStatusResponse> => {
    const response = await authClient.get(
      `/email-verification/status?email=${encodeURIComponent(email)}`
    );
    return response.data;
  },
};
