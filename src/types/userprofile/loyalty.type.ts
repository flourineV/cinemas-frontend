export interface LoyaltyHistoryItem {
  id: string;
  bookingId?: string;
  type?: string;
  pointsChange: number;
  pointsBefore: number;
  pointsAfter: number;
  amountSpent?: number;
  description: string;
  createdAt: string;
}

export interface PagedLoyaltyHistoryResponse {
  data: LoyaltyHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
