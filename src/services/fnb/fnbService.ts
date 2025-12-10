import { fnbClient } from "../apiClient";
import { theaterService } from "../showtime/theaterService";
import type { TheaterResponse } from "@/types/showtime/theater.type";

export interface FnbItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  available: boolean;
}

export interface FnbOrderRequest {
  theaterId: string;
  items: {
    fnbItemId: string;
    quantity: number;
  }[];
  customerInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

export interface FnbOrderResponse {
  id: string;
  theaterId: string;
  theaterName: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  totalAmount: number;
  customerInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  status: string;
  createdAt: string;
}

export const fnbService = {
  // Get all theaters (sử dụng theaterService có sẵn)
  getTheaters: async (): Promise<TheaterResponse[]> => {
    return await theaterService.getAllTheaters();
  },

  // Get FnB items by theater
  getFnbItems: async (theaterId: string): Promise<FnbItem[]> => {
    const response = await fnbClient.get<FnbItem[]>(
      `/items?theaterId=${theaterId}`
    );
    return response.data;
  },

  // Create FnB order
  createOrder: async (
    orderData: FnbOrderRequest
  ): Promise<FnbOrderResponse> => {
    const response = await fnbClient.post<FnbOrderResponse>(
      "/orders",
      orderData
    );
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<FnbOrderResponse> => {
    const response = await fnbClient.get<FnbOrderResponse>(
      `/orders/${orderId}`
    );
    return response.data;
  },
};
