import { showtimeClient } from "../apiClients/showtimeClient";

export interface ProvinceRequest {
    name: string;
}

export interface ProvinceResponse {
    id: string;
    name: string;
}

export const provinceService = {
    // [POST] Tạo Tỉnh thành mới
    createProvince: async (data: ProvinceRequest): Promise<ProvinceResponse> => {
        const res = await showtimeClient.post<ProvinceResponse>("/provinces", data);
        return res.data;
    },

    // [GET] Lấy thông tin một Tỉnh thành theo ID
    getProvinceById: async (id: string): Promise<ProvinceResponse> => {
        // Chú ý: Cần thêm ID vào URL path
        const res = await showtimeClient.get<ProvinceResponse>(`/provinces/${id}`);
        return res.data;
    },

    // [GET] Lấy danh sách tất cả Tỉnh thành
    getAllProvinces: async (): Promise<ProvinceResponse[]> => {
        const res = await showtimeClient.get<ProvinceResponse[]>("/provinces");
        return res.data;
    },

    // [PUT] Cập nhật Tỉnh thành
    updateProvince: async (id: string, data: ProvinceRequest): Promise<ProvinceResponse> => {
        // Gửi ID và dữ liệu cập nhật
        const res = await showtimeClient.put<ProvinceResponse>(`/provinces/${id}`, data);
        return res.data;
    },

    // [DELETE] Xóa Tỉnh thành
    deleteProvince: async (id: string): Promise<void> => {
        // Trả về Promise<void> vì API Java trả về ResponseEntity<Void> (204 No Content)
        await showtimeClient.delete(`/provinces/${id}`);
    },
};