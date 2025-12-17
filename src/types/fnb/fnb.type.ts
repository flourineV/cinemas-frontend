export interface FnbItemRequest {
  name: string;
  description?: string;
  unitPrice: number;
}

export interface FnbItemResponse {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  imageUrl: string;
}

export interface FnbCalculationItem {
  id: string;
  quantity: number;
}

export interface FnbCalculationResponse {
  totalPrice: number;
  breakdown: { [key: string]: number };
}

// FnB Order interfaces
export interface FnbOrderRequest {
  userId: string;
  theaterId: string;
  paymentMethod: string;
  items: FnbOrderItemRequest[];
}

export interface FnbOrderItemRequest {
  fnbItemId: string;
  quantity: number;
}

export interface FnbOrderResponse {
  id: string;
  userId: string;
  theaterId: string;
  orderCode: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  expiresAt: string; // PENDING orders expire after 5 minutes
  items: FnbOrderItemResponse[];
}

export interface FnbOrderItemResponse {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}
