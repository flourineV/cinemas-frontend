// src/services/theaterService.ts
import { showtimeClient } from "../apiClients/showtimeClient";

// ================== Interfaces ==================
export interface TheaterRequest {
    provinceId: string; // Chuyển UUID (Java) thành string (TypeScript)
    name: string;
    address: string;
    description: string;
}

export interface TheaterResponse {
    id: string; // Chuyển UUID (Java) thành string (TypeScript)
    name: string;
    address: string;
    description: string;
    provinceName: string;
}

// ================== Service ==================
export const theaterService = {
    // [POST] Tạo Rạp chiếu mới
    createTheater: async (data: TheaterRequest): Promise<TheaterResponse> => {
        const res = await showtimeClient.post<TheaterResponse>("/theaters", data);
        return res.data;
    },

    // [GET] Lấy thông tin một Rạp chiếu theo ID
    getTheaterById: async (id: string): Promise<TheaterResponse> => {
        // Trong Controller, phương thức này thiếu @GetMapping, nhưng API path nên là /theaters/{id}
        const res = await showtimeClient.get<TheaterResponse>(`/theaters/${id}`);
        return res.data;
    },

    // [GET] Lấy danh sách tất cả Rạp chiếu
    getAllTheaters: async (): Promise<TheaterResponse[]> => {
        const res = await showtimeClient.get<TheaterResponse[]>("/theaters");
        return res.data;
    },

    // [GET] Lấy danh sách Rạp chiếu theo Tỉnh thành (Province)
    getTheatersByProvince: async (provinceId: string): Promise<TheaterResponse[]> => {
        // Ánh xạ đến endpoint /api/showtimes/theaters/search?provinceId=...
        const res = await showtimeClient.get<TheaterResponse[]>("/theaters/search", {
            params: {
                provinceId: provinceId
            }
        });
        return res.data;
    },

    // [PUT] Cập nhật Rạp chiếu
    updateTheater: async (id: string, data: TheaterRequest): Promise<TheaterResponse> => {
        const res = await showtimeClient.put<TheaterResponse>(`/theaters/${id}`, data);
        return res.data;
    },

    // [DELETE] Xóa Rạp chiếu
    deleteTheater: async (id: string): Promise<void> => {
        // Trả về Promise<void> vì API Java trả về ResponseEntity<Void> (204 No Content)
        await showtimeClient.delete(`/theaters/${id}`);
    },
};