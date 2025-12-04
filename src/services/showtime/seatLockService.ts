import { showtimeClient } from "../apiClient";
import type {
  SingleSeatLockRequest,
  SeatLockRequest,
  SeatLockResponse,
  SeatReleaseRequest,
} from "@/types/showtime/seatlock.type";

export const seatLockService = {
  /**
   * Lock a single seat
   */
  lockSingleSeat: async (
    data: SingleSeatLockRequest
  ): Promise<SeatLockResponse> => {
    const res = await showtimeClient.post<SeatLockResponse>(
      "/seat-lock/lock-single",
      data
    );
    return res.data;
  },

  /**
   * Unlock a single seat
   */
  unlockSingleSeat: async (
    showtimeId: string,
    seatId: string,
    userId?: string,
    guestSessionId?: string
  ): Promise<SeatLockResponse> => {
    const res = await showtimeClient.post<SeatLockResponse>(
      "/seat-lock/unlock-single",
      null,
      {
        params: { showtimeId, seatId, userId, guestSessionId },
      }
    );
    return res.data;
  },

  /**
   * Unlock multiple seats (batch)
   */
  unlockBatchSeats: async (
    showtimeId: string,
    seatIds: string[],
    userId?: string,
    guestSessionId?: string
  ): Promise<SeatLockResponse[]> => {
    const res = await showtimeClient.post<SeatLockResponse[]>(
      "/seat-lock/unlock-batch",
      null,
      {
        params: {
          showtimeId,
          seatIds: seatIds.join(","), // Convert array to comma-separated string
          userId,
          guestSessionId,
        },
      }
    );
    return res.data;
  },

  /**
   * Lock multiple seats (batch)
   */
  lockSeats: async (data: SeatLockRequest): Promise<SeatLockResponse[]> => {
    const res = await showtimeClient.post<SeatLockResponse[]>(
      "/seat-lock/lock",
      data
    );
    return res.data;
  },

  /**
   * Release locked seats
   */
  releaseSeats: async (
    data: SeatReleaseRequest
  ): Promise<SeatLockResponse[]> => {
    const res = await showtimeClient.post<SeatLockResponse[]>(
      "/seat-lock/release",
      data
    );
    return res.data;
  },

  /**
   * Get seat lock status
   */
  getSeatStatus: async (
    showtimeId: string,
    seatId: string
  ): Promise<SeatLockResponse> => {
    const res = await showtimeClient.get<SeatLockResponse>(
      "/seat-lock/status",
      { params: { showtimeId, seatId } }
    );
    return res.data;
  },
};
