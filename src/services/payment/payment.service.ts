import { paymentClient } from "../apiClient";
import type {
  ZaloPayCreateOrderResponse,
  ZaloPayCallbackDTO,
  ZaloPayCheckStatusResponse,
  PaymentConfirmationRequest,
} from "@/types/payment/payment.type";

export const paymentService = {
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
};
