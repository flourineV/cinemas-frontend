export type DiscountType = "FIXED_AMOUNT" | "PERCENTAGE"; // mapping với DiscountType enum của BE

export interface PromotionRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isActive?: boolean;
  isOneTimeUse?: boolean;
  description?: string;
}

export interface PromotionResponse {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isOneTimeUse: boolean;
  description?: string;
  promoDisplayUrl?: string;
}

export interface PromotionValidationResponse {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  isOneTimeUse: boolean;
}
