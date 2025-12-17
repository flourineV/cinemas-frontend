import { promotionClient } from "../apiClient";
import type {
  PromotionRequest,
  PromotionResponse,
  PromotionValidationResponse,
  UserPromotionsResponse,
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

  // Lấy các khuyến mãi cho user cụ thể (phân chia applicable và not applicable)
  getActivePromotionsForUser: async (
    userId: string
  ): Promise<UserPromotionsResponse> => {
    const res = await promotionClient.get<UserPromotionsResponse>(
      `/active-for-user?userId=${userId}`
    );
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

  // Lấy tất cả promotion cho admin với filter
  getAllPromotionsForAdmin: async (
    code?: string,
    discountType?: string,
    promotionType?: string,
    isActive?: boolean
  ): Promise<PromotionResponse[]> => {
    const params = new URLSearchParams();
    if (code) params.append("code", code);
    if (discountType) params.append("discountType", discountType);
    if (promotionType) params.append("promotionType", promotionType);
    if (isActive !== undefined) params.append("isActive", isActive.toString());

    const queryString = params.toString();
    const url = queryString ? `/admin/all?${queryString}` : "/admin/all";

    const res = await promotionClient.get<PromotionResponse[]>(url);
    return res.data;
  },
};
