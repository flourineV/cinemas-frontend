import { showtimeClient } from "../apiClients/showtimeClient";

export interface SeatLockRequest {
    id : string,
    seatId : string,
    bookingId : string
}

export interface SeatLockResponse {
    showtimeId : string,
    seatId : string,
    status : string,
    ttl : number
}

export const seatLockService = {
    lockSeat : async (data: SeatLockRequest): Promise<SeatLockResponse> => {
        const res = await showtimeClient.post<SeatLockResponse>("/seat-lock/lock", data);
        return res.data;
    },

    releaseSeat: async (data: SeatLockRequest): Promise<SeatLockResponse> => {
        const res = await showtimeClient.post<SeatLockResponse>("/seat-lock/release", data);
        return res.data;
    },

    getSeatStatus: async (showtimeId: string, seatId: string): Promise<SeatLockResponse> => {
    const res = await showtimeClient.get<SeatLockResponse>(
      `/seat-lock/status`,
      { params: { showtimeId, seatId } }
    );
    return res.data;
  },
}