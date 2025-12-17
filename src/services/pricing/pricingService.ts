// src/services/pricing/pricingService.ts
import { pricingClient } from "../apiClient";
import type {
  SeatPriceRequest,
  SeatPriceResponse,
} from "@/types/pricing/seatprice.type";

export const pricingService = {
  // --- GET /api/pricing/seat-price?seatType=&ticketType= (tra cứu giá ghế) ---
  getSeatPrice: async (
    seatType: string,
    ticketType: string
  ): Promise<SeatPriceResponse> => {
    try {
      const res = await pricingClient.get<SeatPriceResponse>("/seat-price", {
        params: { seatType, ticketType },
      });
      return res.data;
    } catch (err) {
      console.warn("Lỗi fetch ghế bạn ơi", err);
      throw err;
    }
  },

  // --- GET /api/pricing (lấy tất cả seat prices) ---
  getAllSeatPrices: async (): Promise<SeatPriceResponse[]> => {
    try {
      const res = await pricingClient.get<SeatPriceResponse[]>("");
      return res.data;
    } catch (err) {
      console.warn("Lỗi fetch ghế bạn ơi", err);
      throw err;
    }
  },

  // --- POST /api/pricing (tạo mới) ---
  createSeatPrice: async (
    payload: SeatPriceRequest
  ): Promise<SeatPriceResponse> => {
    const res = await pricingClient.post<SeatPriceResponse>("", payload);
    return res.data;
  },

  // --- PUT /api/pricing/{id} (cập nhật) ---
  updateSeatPrice: async (
    id: string,
    payload: SeatPriceRequest
  ): Promise<SeatPriceResponse> => {
    const res = await pricingClient.put<SeatPriceResponse>(`/${id}`, payload);
    return res.data;
  },

  // --- DELETE /api/pricing/{id} ---
  deleteSeatPrice: async (id: string): Promise<void> => {
    await pricingClient.delete(`/${id}`);
  },
};
