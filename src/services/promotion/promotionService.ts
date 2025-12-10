import { promotionClient } from "../apiClient";
import type {
  PromotionRequest,
  PromotionResponse,
  PromotionValidationResponse,
} from "@/types/promotion/promotion.type";

export const promotionService = {
  // Lấy tất cả khuyến mãi
  getAllPromotions: async (): Promise<PromotionResponse[]> => {
    const res = await promotionClient.get<PromotionResponse[]>("");
    return res.data;
  },

  // Lấy các khuyến mãi đang active
  getActivePromotions: async (): Promise<PromotionResponse[]> => {
    const res = await promotionClient.get<PromotionResponse[]>("/active");
    return res.data;
  },

  // Validate promotion code
  validatePromotionCode: async (
    code: string
  ): Promise<PromotionValidationResponse> => {
    const res = await promotionClient.get<PromotionValidationResponse>(
      `/validate?code=${code}`
    );
    return res.data;
  },

  // Tạo mới promotion
  createPromotion: async (
    data: PromotionRequest
  ): Promise<PromotionResponse> => {
    const res = await promotionClient.post<PromotionResponse>("", data);
    return res.data;
  },

  // Cập nhật promotion
  updatePromotion: async (
    id: string,
    data: PromotionRequest
  ): Promise<PromotionResponse> => {
    const res = await promotionClient.put<PromotionResponse>(`/${id}`, data);
    return res.data;
  },

  // Xóa promotion
  deletePromotion: async (id: string): Promise<void> => {
    await promotionClient.delete(`/${id}`);
  },
};
