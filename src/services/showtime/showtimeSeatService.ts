import { showtimeClient } from "../apiClients/showtimeClient";

/** Enum mô phỏng trạng thái ghế trong ShowtimeSeat (BE) */
export type SeatStatus = "AVAILABLE" | "LOCKED" | "BOOKED";

/** Dữ liệu trả về từ BE */
export interface ShowtimeSeatResponse {
  seatId: string;
  seatNumber: string;
  status: SeatStatus;
}

/** Dữ liệu gửi lên BE khi cập nhật status ghế */
export interface UpdateSeatStatusRequest {
  showtimeId: string;
  seatId: string;
  status: SeatStatus;
}

/** Service gọi API cho các thao tác liên quan đến ghế trong suất chiếu */
export const showtimeSeatService = {
  /**
   * [GET] Lấy danh sách ghế theo showtime
   * /api/showtimes/{showtimeId}/seats
   */
  getSeatsByShowtime: async (showtimeId: string): Promise<ShowtimeSeatResponse[]> => {
    const res = await showtimeClient.get<ShowtimeSeatResponse[]>(`/${showtimeId}/seats`);
    return res.data;
  },

  /**
   * [PATCH] Cập nhật trạng thái 1 ghế (AVAILABLE / LOCKED / BOOKED)
   * /api/showtimes/{showtimeId}/seats/{seatId}/status
   */
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

  /**
   * [POST] Khởi tạo danh sách ghế AVAILABLE cho 1 suất chiếu
   * /api/showtimes/{showtimeId}/initialize-seats
   */
  initializeSeatsForShowtime: async (showtimeId: string): Promise<string> => {
    const res = await showtimeClient.post<string>(`/${showtimeId}/initialize-seats`);
    return res.data;
  },
};
