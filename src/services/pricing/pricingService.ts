import { apiClient } from "../apiClient";
import type {
  SeatPriceRequest,
  SeatPriceResponse,
} from "@/types/pricing/pricing.type";

export const pricingService = {
  // Get seat price for booking
  getSeatPrice: async (
    seatType: string,
    ticketType: string
  ): Promise<SeatPriceResponse> => {
    const res = await apiClient.get<SeatPriceResponse>(`/pricing/seat-price`, {
      params: { seatType, ticketType },
    });
    return res.data;
  },

  // Admin APIs
  getAllSeatPrices: async (): Promise<SeatPriceResponse[]> => {
    const res = await apiClient.get<SeatPriceResponse[]>("/pricing");
    return res.data;
  },

  createSeatPrice: async (
    data: SeatPriceRequest
  ): Promise<SeatPriceResponse> => {
    const res = await apiClient.post<SeatPriceResponse>("/pricing", data);
    return res.data;
  },

  updateSeatPrice: async (
    id: string,
    data: SeatPriceRequest
  ): Promise<SeatPriceResponse> => {
    const res = await apiClient.put<SeatPriceResponse>(`/pricing/${id}`, data);
    return res.data;
  },

  deleteSeatPrice: async (id: string): Promise<void> => {
    await apiClient.delete(`/pricing/${id}`);
  },
};
