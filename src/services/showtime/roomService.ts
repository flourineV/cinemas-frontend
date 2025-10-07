// src/services/roomService.ts
import { showtimeClient } from "../apiClients/showtimeClient";

// ================== Interfaces ==================
export interface RoomRequest {
    theaterId: string; // UUID (Java) -> string (TypeScript)
    name: string;
    seatCount: number;
}

export interface RoomResponse {
    id: string; // UUID (Java) -> string (TypeScript)
    name: string;
    seatCount: number;
    theaterName: string;
}

// ================== Service ==================
export const roomService = {
    // [POST] Tạo Phòng chiếu mới
    createRoom: async (data: RoomRequest): Promise<RoomResponse> => {
        const res = await showtimeClient.post<RoomResponse>("/rooms", data);
        return res.data;
    },

    // [GET] Lấy thông tin một Phòng chiếu theo ID
    getRoomById: async (id: string): Promise<RoomResponse> => {
        const res = await showtimeClient.get<RoomResponse>(`/rooms/${id}`);
        return res.data;
    },

    // [GET] Lấy danh sách tất cả Phòng chiếu
    getAllRooms: async (): Promise<RoomResponse[]> => {
        const res = await showtimeClient.get<RoomResponse[]>("/rooms");
        return res.data;
    },

    // [PUT] Cập nhật Phòng chiếu
    updateRoom: async (id: string, data: RoomRequest): Promise<RoomResponse> => {
        const res = await showtimeClient.put<RoomResponse>(`/rooms/${id}`, data);
        return res.data;
    },

    // [DELETE] Xóa Phòng chiếu
    deleteRoom: async (id: string): Promise<void> => {
        // Trả về Promise<void> vì API Java trả về ResponseEntity<Void> (204 No Content)
        await showtimeClient.delete(`/rooms/${id}`);
    },

    /*
     * Hàm Tùy chọn (Ánh xạ đến phần comment trong Java Controller)
     * [GET] Lấy danh sách Phòng chiếu theo Theater ID
     */
    getRoomsByTheaterId: async (theaterId: string): Promise<RoomResponse[]> => {
        // Ánh xạ đến endpoint giả định: /api/showtimes/rooms/by-theater/{theaterId}
        const res = await showtimeClient.get<RoomResponse[]>(`/rooms/by-theater/${theaterId}`);
        return res.data;
    }
};