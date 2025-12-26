export type DiscountType = "FIXED_AMOUNT" | "PERCENTAGE";

export type PromotionType =
  | "GENERAL"
  | "BIRTHDAY"
  | "MEMBERSHIP"
  | "SPECIAL_EVENT";

export type UsageTimeRestriction =
  | "ANYTIME"
  | "WEEKDAYS_ONLY"
  | "WEEKENDS_ONLY"
  | "SPECIFIC_DAYS";

export interface PromotionRequest {
  code: string;
  promotionType: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isActive?: boolean;
  usageTimeRestriction?: UsageTimeRestriction;
  allowedDaysOfWeek?: string;
  allowedDaysOfMonth?: string;
  description?: string;
  promoDisplayUrl?: string;
}

export interface PromotionResponse {
  id: string;
  code: string;
  promotionType: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageTimeRestriction?: UsageTimeRestriction;
  allowedDaysOfWeek?: string;
  allowedDaysOfMonth?: string;
  description?: string;
  descriptionEn?: string;
  promoDisplayUrl?: string;
}

export interface PromotionValidationResponse {
  code: string;
  discountType: DiscountType;
  discountValue: number;
}

// Response cho active-for-user endpoint
export interface ApplicablePromotionResponse {
  promotion: PromotionResponse;
}

export interface NotApplicablePromotionResponse {
  promotion: PromotionResponse;
}

export interface UserPromotionsResponse {
  applicable: ApplicablePromotionResponse[];
  notApplicable: NotApplicablePromotionResponse[];
}

// Refund Voucher Response
export interface RefundVoucherResponse {
  id: string;
  code: string;
  userId: string;
  value: number;
  isUsed: boolean;
  createdAt: string;
  expiredAt: string;
}
