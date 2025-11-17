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
  image?: string;
}

export interface FnbCalculationItem {
  id: string;
  quantity: number;
}

export interface FnbCalculationResponse {
  totalPrice: number;
  breakdown: { [key: string]: number };
}
