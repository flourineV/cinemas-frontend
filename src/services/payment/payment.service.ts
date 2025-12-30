import { paymentClient } from "../apiClient";
import type { PageResponse } from "@/types/PageResponse";
import type {
  ZaloPayCreateOrderResponse,
  ZaloPayCallbackDTO,
  ZaloPayCheckStatusResponse,
  PaymentConfirmationRequest,
} from "@/types/payment/payment.type";

export interface PaymentStatsResponse {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalRevenue: number;
}

export interface PaymentTransactionResponse {
  id: string;
  bookingId: string;
  userId: string;
  showtimeId: string;
  seatIds: string[];
  amount: number;
  method: string;
  status: string;
  transactionRef: string;
  createdAt: string;
  updatedAt: string;
}

export const paymentService = {
  // GET /api/payments/stats/overview
  getStatsOverview: async (): Promise<PaymentStatsResponse> => {
    const res =
      await paymentClient.get<PaymentStatsResponse>("/stats/overview");
    return res.data;
  },

  // GET /api/payments/admin/search
  getPayments: async (
    params: any
  ): Promise<PageResponse<PaymentTransactionResponse>> => {
    const res = await paymentClient.get<
      PageResponse<PaymentTransactionResponse>
    >("/admin/search", { params });
    return res.data;
  },

  // GET /api/payments/{id}
  getPaymentById: async (id: string): Promise<PaymentTransactionResponse> => {
    const res = await paymentClient.get<PaymentTransactionResponse>(`/${id}`);
    return res.data;
  },

  // GET /api/payments/admin/{id} - For admin to view any payment
  getPaymentByIdForAdmin: async (
    id: string
  ): Promise<PaymentTransactionResponse> => {
    const res = await paymentClient.get<PaymentTransactionResponse>(
      `/admin/${id}`
    );
    return res.data;
  },

  createZaloPayUrl: async (
    bookingId: string
  ): Promise<ZaloPayCreateOrderResponse> => {
    const res = await paymentClient.post<ZaloPayCreateOrderResponse>(
      `/create-zalopay-url?bookingId=${bookingId}`
    );
    return res.data;
  },

  createZaloPayUrlForFnb: async (
    fnbOrderId: string
  ): Promise<ZaloPayCreateOrderResponse> => {
    const res = await paymentClient.post<ZaloPayCreateOrderResponse>(
      `/create-zalopay-url-fnb?fnbOrderId=${fnbOrderId}`
    );
    return res.data;
  },

  handleZaloPayCallback: async (
    callbackData: ZaloPayCallbackDTO
  ): Promise<{ return_code: number; return_message: string }> => {
    const res = await paymentClient.post<{
      return_code: number;
      return_message: string;
    }>("/callback", callbackData);
    return res.data;
  },

  checkTransactionStatus: async (
    appTransId: string
  ): Promise<ZaloPayCheckStatusResponse> => {
    const res = await paymentClient.get<ZaloPayCheckStatusResponse>(
      "/check-status",
      {
        params: { appTransId },
      }
    );
    return res.data;
  },

  confirmPaymentSuccess: async (
    data: PaymentConfirmationRequest
  ): Promise<void> => {
    await paymentClient.post("/confirm", data);
  },
  // Cancel pending payment when user returns from payment gateway
  cancelPendingPayment: async (
    bookingId: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await paymentClient.post<{ success: boolean; message: string }>(
      `/cancel?bookingId=${bookingId}`
    );
    return res.data;
  },

  // Confirm free booking (when finalPrice = 0, no payment gateway needed)
  confirmFreeBooking: async (
    bookingId: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await paymentClient.post<{ success: boolean; message: string }>(
      `/confirm-free?bookingId=${bookingId}`
    );
    return res.data;
  },
};
