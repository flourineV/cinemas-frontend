import { showtimeClient } from "../apiClient";

import type {
  SeatStatus,
  ShowtimeSeatResponse,
  ShowtimeSeatsLayoutResponse,
} from "@/types/showtime/showtimeSeat.type";

export const showtimeSeatService = {
  getSeatsByShowtime: async (
    showtimeId: string
  ): Promise<ShowtimeSeatsLayoutResponse> => {
    const res = await showtimeClient.get<ShowtimeSeatsLayoutResponse>(
      `/${showtimeId}/seats`
    );
    return res.data;
  },

  updateSeatStatus: async (
    showtimeId: string,
    seatId: string,
    status: SeatStatus
  ): Promise<ShowtimeSeatResponse> => {
    const res = await showtimeClient.patch<ShowtimeSeatResponse>(
      `/${showtimeId}/seats/${seatId}/status`,
      { showtimeId, seatId, status }
    );
    return res.data;
  },

  initializeSeatsForShowtime: async (showtimeId: string): Promise<string> => {
    const res = await showtimeClient.post<string>(
      `/${showtimeId}/initialize-seats`
    );
    return res.data;
  },
};
