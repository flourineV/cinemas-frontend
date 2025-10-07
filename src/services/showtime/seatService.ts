import { showtimeClient } from "../apiClients/showtimeClient";

/**
 * Kiểu dữ liệu request gửi lên BE khi tạo/cập nhật ghế
 */
export interface SeatRequest {
  roomId: string;
  seatNumber: string;
  rowLabel: string;
  columnIndex: number;
  type: string; // NORMAL | VIP | COUPLE
}

/**
 * Kiểu dữ liệu response nhận từ BE
 */
export interface SeatResponse {
  id: string;
  roomId: string;
  roomName: string;
  seatNumber: string;
  rowLabel: string;
  columnIndex: number;
  type: string;
}

/**
 * seatService — ánh xạ đầy đủ các API trong SeatController.java
 */
export const seatService = {
  // [POST] Tạo danh sách ghế cho 1 phòng
  createSeats: async (data: SeatRequest[]): Promise<SeatResponse[]> => {
    const res = await showtimeClient.post<SeatResponse[]>("/seats", data);
    return res.data;
  },

  // [GET] Lấy thông tin 1 ghế theo ID
  getSeatById: async (id: string): Promise<SeatResponse> => {
    const res = await showtimeClient.get<SeatResponse>(`/seats/${id}`);
    return res.data;
  },

  // [GET] Lấy tất cả ghế trong toàn hệ thống
  getAllSeats: async (): Promise<SeatResponse[]> => {
    const res = await showtimeClient.get<SeatResponse[]>("/seats");
    return res.data;
  },

  // [GET] Lấy danh sách ghế theo roomId
  getSeatsByRoomId: async (roomId: string): Promise<SeatResponse[]> => {
    const res = await showtimeClient.get<SeatResponse[]>(`/seats/room/${roomId}`);
    return res.data;
  },

  // [PUT] Cập nhật 1 ghế theo ID
  updateSeat: async (id: string, data: SeatRequest): Promise<SeatResponse> => {
    const res = await showtimeClient.put<SeatResponse>(`/seats/${id}`, data);
    return res.data;
  },

  // [DELETE] Xóa ghế theo ID
  deleteSeat: async (id: string): Promise<void> => {
    await showtimeClient.delete(`/seats/${id}`);
  },
};
