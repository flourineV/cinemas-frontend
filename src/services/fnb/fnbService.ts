import { fnbClient } from "../apiClient";
import { theaterService } from "../showtime/theaterService";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import type {
  FnbItemRequest,
  FnbItemResponse,
  FnbOrderRequest,
  FnbOrderResponse,
} from "@/types/fnb/fnb.type";

export const fnbService = {
  getTheaters: async (): Promise<TheaterResponse[]> => {
    return await theaterService.getAllTheaters();
  },

  getAllFnbItems: async (): Promise<FnbItemResponse[]> => {
    const response = await fnbClient.get<FnbItemResponse[]>("");
    return response.data;
  },

  getFnbItemById: async (id: string): Promise<FnbItemResponse> => {
    const response = await fnbClient.get<FnbItemResponse>(`/items/${id}`);
    return response.data;
  },

  createFnbItem: async (data: FnbItemRequest): Promise<FnbItemResponse> => {
    const response = await fnbClient.post<FnbItemResponse>("", data);
    return response.data;
  },

  updateFnbItem: async (
    id: string,
    data: FnbItemRequest
  ): Promise<FnbItemResponse> => {
    const response = await fnbClient.put<FnbItemResponse>(`/${id}`, data);
    return response.data;
  },

  deleteFnbItem: async (id: string): Promise<void> => {
    await fnbClient.delete(`/${id}`);
  },

  createOrder: async (
    orderData: FnbOrderRequest
  ): Promise<FnbOrderResponse> => {
    const response = await fnbClient.post<FnbOrderResponse>(
      "/orders",
      orderData
    );
    return response.data;
  },

  getOrderById: async (orderId: string): Promise<FnbOrderResponse> => {
    const response = await fnbClient.get<FnbOrderResponse>(
      `/orders/${orderId}`
    );
    return response.data;
  },

  getOrdersByUser: async (userId: string): Promise<FnbOrderResponse[]> => {
    const response = await fnbClient.get<FnbOrderResponse[]>(
      `/orders/user/${userId}`
    );
    return response.data;
  },
};
