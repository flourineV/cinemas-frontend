// ZaloPay Create Order Response
export interface ZaloPayCreateOrderResponse {
  return_code: number;
  return_message: string;
  sub_return_code: number;
  sub_return_message: string;
  zp_trans_token: string;
  order_url: string;
  order_token: string;
  app_trans_id?: string;
}

// ZaloPay Callback Data
export interface ZaloPayCallbackDTO {
  data: string;
  mac: string;
  type: number;
}

// ZaloPay Check Status Response
export interface ZaloPayCheckStatusResponse {
  isSuccess: boolean;
  returnCode: number;
  returnMessage: string;
  amount?: number;
  zp_trans_id?: string;
  server_time?: number;
  discount_amount?: number;
  bookingId?: string;
}

// Payment Confirmation Request (internal)
export interface PaymentConfirmationRequest {
  appTransId: string;
  paymentMethod: string;
  amount: number;
}
