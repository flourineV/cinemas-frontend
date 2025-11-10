import { showtimeClient } from "../apiClients/showtimeClient";
import type {
  SeatLockRequest,
  SeatLockResponse,
} from "@/types/showtime/seatlock.type";

export const seatLockService = {
  lockSeat: async (data: SeatLockRequest): Promise<SeatLockResponse> => {
    const res = await showtimeClient.post<SeatLockResponse>(
      "/seat-lock/lock",
      data
    );
    return res.data;
  },

  releaseSeat: async (data: SeatLockRequest): Promise<SeatLockResponse> => {
    const res = await showtimeClient.post<SeatLockResponse>(
      "/seat-lock/release",
      data
    );
    return res.data;
  },

  getSeatStatus: async (
    showtimeId: string,
    seatId: string
  ): Promise<SeatLockResponse> => {
    const res = await showtimeClient.get<SeatLockResponse>(
      `/seat-lock/status`,
      { params: { showtimeId, seatId } }
    );
    return res.data;
  },
};
