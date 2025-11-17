import { fnbClient } from "../apiClient";
import type {
  FnbItemRequest,
  FnbItemResponse,
  FnbCalculationItem,
  FnbCalculationResponse,
} from "@/types/fnb/fnb.type";

import { mockFnbData } from "@/mocks/mockFnb";

export const fnbService = {
  // [GET] Lấy danh sách tất cả F&B items
  getAllFnbItems: async (): Promise<FnbItemResponse[]> => {
    try {
      const res = await fnbClient.get<FnbItemResponse[]>("");
      return res.data;
    } catch (err) {
      console.warn("⚠️ BE không chạy — dùng mock F&B để debug UI.");
      return mockFnbData;
    }
  },

  // [GET] Lấy chi tiết 1 item theo ID
  getFnbItemById: async (id: string): Promise<FnbItemResponse> => {
    try {
      const res = await fnbClient.get<FnbItemResponse>(`/${id}`);
      return res.data;
    } catch (err) {
      console.warn("⚠️ BE không chạy — xem mock F&B data để debug UI.");

      const found = mockFnbData.find(x => x.id === id);
      if (found) return found;

      throw new Error("Item not found in mock");
    }
  },

  // [POST] Tạo mới 1 item
  createFnbItem: async (data: FnbItemRequest): Promise<FnbItemResponse> => {
    const res = await fnbClient.post<FnbItemResponse>("", data);
    return res.data;
  },

  // [PUT] Cập nhật F&B item
  updateFnbItem: async (
    id: string,
    data: FnbItemRequest
  ): Promise<FnbItemResponse> => {
    const res = await fnbClient.put<FnbItemResponse>(`/${id}`, data);
    return res.data;
  },

  // [DELETE] Xóa F&B item
  deleteFnbItem: async (id: string): Promise<void> => {
    await fnbClient.delete(`/${id}`);
  },

  // [POST] Tính tổng giá trị của các item đã chọn
  calculateFnbPrice: async (
    selectedItems: FnbCalculationItem[]
  ): Promise<FnbCalculationResponse> => {
    try {
      const res = await fnbClient.post<FnbCalculationResponse>("/calculate",
      { selectedFnbItems: selectedItems });
      return res.data;
    } catch (err) {
      console.warn("⚠️ BE không chạy — tự tính bằng mock để debug UI.");

      let total = 0;
      const breakdown: Record<string, number> = {};

      selectedItems.forEach(item => {
        const found = mockFnbData.find(x => x.id === item.id);
        if (found) {
          const price = found.unitPrice * item.quantity;
          breakdown[item.id] = price;
          total += price;
        }
      });

      return { totalPrice: total, breakdown };
    }
  },
};
