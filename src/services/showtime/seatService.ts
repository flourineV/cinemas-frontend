import { showtimeClient } from "../apiClient";
import type { SeatRequest, SeatResponse } from "@/types/showtime/seat.type";

export const seatService = {
  createSeats: async (data: SeatRequest[]): Promise<SeatResponse[]> => {
    const res = await showtimeClient.post<SeatResponse[]>("/seats", data);
    return res.data;
  },

  getSeatById: async (id: string): Promise<SeatResponse> => {
    const res = await showtimeClient.get<SeatResponse>(`/seats/${id}`);
    return res.data;
  },

  getAllSeats: async (): Promise<SeatResponse[]> => {
    const res = await showtimeClient.get<SeatResponse[]>("/seats");
    return res.data;
  },

  getSeatsByRoomId: async (roomId: string): Promise<SeatResponse[]> => {
    const res = await showtimeClient.get<SeatResponse[]>(
      `/seats/room/${roomId}`
    );
    return res.data;
  },

  updateSeat: async (id: string, data: SeatRequest): Promise<SeatResponse> => {
    const res = await showtimeClient.put<SeatResponse>(`/seats/${id}`, data);
    return res.data;
  },

  deleteSeat: async (id: string): Promise<void> => {
    await showtimeClient.delete(`/seats/${id}`);
  },
};
