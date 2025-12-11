export interface LoyaltyHistoryItem {
  id: string;
  userId: string;
  transactionType: "EARNED" | "REDEEMED" | "EXPIRED" | "BONUS";
  points: number;
  description: string;
  referenceId?: string; // booking ID, promotion ID, etc.
  createdAt: string;
}

export interface PagedLoyaltyHistoryResponse {
  content: LoyaltyHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
