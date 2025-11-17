// src/mocks/mockPricing.ts
import type { SeatPriceResponse } from "@/types/pricing/seatprice.type";

export const mockSeatPrices: SeatPriceResponse[] = [
  { seatType: "VIP", ticketType: "ADULT", basePrice: "120000" },
  { seatType: "VIP", ticketType: "CHILD", basePrice: "100000" },
  { seatType: "NORMAL", ticketType: "ADULT", basePrice: "80000" },
  { seatType: "NORMAL", ticketType: "CHILD", basePrice: "60000" },
];
