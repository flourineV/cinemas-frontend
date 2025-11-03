import { fnbClient } from "../apiClients/fnbClient";

export interface FnbItemRequest {
  name: string;
  description?: string;
  unitPrice: number;
}

export interface FnbItemResponse {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
}

export interface FnbCalculationItem {
  id: string;
  quantity: number;
}

export interface FnbCalculationResponse {
  totalPrice: number;
  breakdown: { [key: string]: number };
}

export const fnbService = {
  // [GET] Lấy danh sách tất cả F&B items
  getAllFnbItems: async (): Promise<FnbItemResponse[]> => {
    const res = await fnbClient.get<FnbItemResponse[]>("/fnb");
    return res.data;
  },

  // [GET] Lấy chi tiết 1 item theo ID
  getFnbItemById: async (id: string): Promise<FnbItemResponse> => {
    const res = await fnbClient.get<FnbItemResponse>(`/fnb/${id}`);
    return res.data;
  },

  // [POST] Tạo mới 1 item
  createFnbItem: async (data: FnbItemRequest): Promise<FnbItemResponse> => {
    const res = await fnbClient.post<FnbItemResponse>("/fnb", data);
    return res.data;
  },

  // [PUT] Cập nhật F&B item
  updateFnbItem: async (
    id: string,
    data: FnbItemRequest
  ): Promise<FnbItemResponse> => {
    const res = await fnbClient.put<FnbItemResponse>(`/fnb/${id}`, data);
    return res.data;
  },

  // [DELETE] Xóa F&B item
  deleteFnbItem: async (id: string): Promise<void> => {
    await fnbClient.delete(`/fnb/${id}`);
  },

  // [POST] Tính tổng giá trị của các item đã chọn
  calculateFnbPrice: async (
    selectedItems: FnbCalculationItem[]
  ): Promise<FnbCalculationResponse> => {
    const res = await fnbClient.post<FnbCalculationResponse>(
      "/fnb/calculate",
      { selectedFnbItems: selectedItems }
    );
    return res.data;
  },
};
