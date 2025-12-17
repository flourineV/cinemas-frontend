import { fnbClient } from "../apiClient";
import { theaterService } from "../showtime/theaterService";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import type {
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
