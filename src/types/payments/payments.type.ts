export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";

export interface PaymentResponse {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  transactionRef: string;
  createdAt: string;
  updatedAt: string;
}

export interface ZaloPayCreateOrderResponse {
  return_code: number;
  return_message: string;
  sub_return_code: number;
  sub_return_message: string;
  zp_trans_token?: string;
  order_url?: string;
  order_token?: string;
  qr_code?: string;
}

export interface PaymentStatusResponse {
  isSuccess: boolean;
  returnCode: number;
  returnMessage: string;
}
